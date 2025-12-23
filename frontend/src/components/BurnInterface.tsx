import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Loader2, CheckCircle2, AlertCircle, Wallet, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";

interface TokenAccount {
  pubkey: string;
  mint: string;
  balance: string;
}

interface BurnInterfaceProps {
  walletConnected: boolean;
  walletAddress: string;
  onConnectWallet: () => void;
}

const RENT_PER_ACCOUNT = 0.00203928; // GOR per account
const FEE_PERCENTAGE = 0.05; // 5%
// Gorbagana Token Program ID (different from Solana)
const TOKEN_PROGRAM_ID = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";

// Fee vault address (100% to Gor-Incinerator for direct mode)
const GOR_INCINERATOR_VAULT = "BuRnX2HDP8s1CFdYwKpYCCshaZcTvFm3xjbmXPR3QsdG";

const DEFAULT_GOR_RPC_URL = "https://rpc.trashscan.io";
const GORBAGANA_RPC_HINTS = ["gorbagana", "trashscan", "api.gorbagana.com"];
const LAMPORTS_PER_GOR = 1_000_000_000;

// Blacklist of important tokens that should never be closed
const BLACKLIST = [
  "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
];

const getWalletRpcEndpoint = (connection: unknown): string | undefined => {
  if (!connection || typeof connection !== "object") {
    return undefined;
  }

  const maybeConnection = connection as { rpcEndpoint?: string; _rpcEndpoint?: string };
  return maybeConnection.rpcEndpoint || maybeConnection._rpcEndpoint;
};

const isGorbaganaRpc = (endpoint: string): boolean =>
  GORBAGANA_RPC_HINTS.some((hint) => endpoint.includes(hint));

const resolveRpcEndpoint = (connection: unknown): string => {
  const envRpc = import.meta.env.VITE_GOR_RPC_URL;
  if (envRpc) {
    return envRpc;
  }

  const walletRpc = getWalletRpcEndpoint(connection);
  if (walletRpc && isGorbaganaRpc(walletRpc)) {
    return walletRpc;
  }

  return DEFAULT_GOR_RPC_URL;
};

export default function BurnInterface({ walletConnected, walletAddress, onConnectWallet }: BurnInterfaceProps) {
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<TokenAccount[]>([]);
  const [totalRent, setTotalRent] = useState(0);
  const [serviceFee, setServiceFee] = useState(0);
  const [youReceive, setYouReceive] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [burnComplete, setBurnComplete] = useState(false);
  const [txSignature, setTxSignature] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (walletConnected && !scanning && accounts.length === 0) {
      scanAccounts();
    }
  }, [walletConnected]);

  const scanAccounts = async () => {
    setScanning(true);
    setError("");
    
    try {
      // @ts-ignore - Backpack wallet API
      if (!window.backpack) {
        throw new Error("Backpack wallet not found");
      }

      // @ts-ignore
      const walletConnection = window.backpack.connection;
      // @ts-ignore
      const publicKey = window.backpack.publicKey;

      // Import PublicKey for programId
      const { Connection, PublicKey } = await import("@solana/web3.js");
      const rpcEndpoint = resolveRpcEndpoint(walletConnection);
      const rpcConnection = new Connection(rpcEndpoint, { commitment: "processed" });

      // Fetch all token accounts
      const tokenAccounts = await rpcConnection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: new PublicKey(TOKEN_PROGRAM_ID) }
      );

      // Filter for empty accounts not in blacklist
      const emptyAccounts: TokenAccount[] = [];
      
      for (const account of tokenAccounts.value) {
        const data = account.account.data.parsed.info;
        const balance = data.tokenAmount.amount;
        const mint = data.mint;

        // Only include empty accounts not in blacklist
        if (balance === "0" && !BLACKLIST.includes(mint)) {
          emptyAccounts.push({
            pubkey: account.pubkey.toString(),
            mint: mint,
            balance: balance,
          });
        }
      }

      setAccounts(emptyAccounts);
      
      const rent = emptyAccounts.length * RENT_PER_ACCOUNT;
      const fee = rent * FEE_PERCENTAGE;
      
      setTotalRent(rent);
      setServiceFee(fee);
      setYouReceive(rent - fee);
    } catch (err) {
      console.error("Error scanning accounts:", err);
      setError(err instanceof Error ? err.message : "Failed to scan accounts");
    } finally {
      setScanning(false);
    }
  };

  const handleBurn = async () => {
    setLoading(true);
    setError("");
    
    try {
      // @ts-ignore
      if (!window.backpack) {
        throw new Error("Backpack wallet not found");
      }

      // @ts-ignore
      const walletConnection = window.backpack.connection;
      // @ts-ignore
      const publicKey = window.backpack.publicKey;
      const rpcEndpoint = resolveRpcEndpoint(walletConnection);

      // Import required Solana libraries
      const { 
        Connection,
        TransactionMessage, 
        VersionedTransaction,
        ComputeBudgetProgram,
        SystemProgram,
        PublicKey
      } = await import("@solana/web3.js");
      const rpcConnection = new Connection(rpcEndpoint, { commitment: "processed" });
      
      const { createCloseAccountInstruction } = await import("@solana/spl-token");

      // Get latest blockhash
      const { blockhash, lastValidBlockHeight } = await rpcConnection.getLatestBlockhash("processed");

      // Build instructions
      const instructions = [
        ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1000 }),
        ComputeBudgetProgram.setComputeUnitLimit({ units: 45000 }),
      ];

      // Add close account instructions (max 14 per transaction)
      const accountsToClose = accounts.slice(0, 14);
      if (accountsToClose.length === 0) {
        throw new Error("No eligible accounts to close");
      }

      const accountPubkeys = accountsToClose.map((account) => new PublicKey(account.pubkey));
      const accountInfos = await rpcConnection.getMultipleAccountsInfo(accountPubkeys, "processed");
      const totalRentLamports = accountInfos.reduce((sum, info, index) => {
        if (!info) {
          throw new Error(`Account not found: ${accountsToClose[index].pubkey}`);
        }
        return sum + info.lamports;
      }, 0);
      const feeInLamports = Math.floor(totalRentLamports * FEE_PERCENTAGE);
      const youReceiveLamports = totalRentLamports - feeInLamports;

      setTotalRent(totalRentLamports / LAMPORTS_PER_GOR);
      setServiceFee(feeInLamports / LAMPORTS_PER_GOR);
      setYouReceive(youReceiveLamports / LAMPORTS_PER_GOR);

      for (const account of accountsToClose) {
        instructions.push(
          createCloseAccountInstruction(
            new PublicKey(account.pubkey),
            publicKey,
            publicKey
          )
        );
      }

      console.log("[Fee Debug]", {
        accountsToClose: accountsToClose.length,
        totalRentLamports,
        feeInLamports,
        vault: GOR_INCINERATOR_VAULT
      });

      if (feeInLamports > 0) {
        const vaultPubkey = new PublicKey(GOR_INCINERATOR_VAULT);
        const vaultInfo = await rpcConnection.getAccountInfo(vaultPubkey, "processed");
        if (vaultInfo && vaultInfo.data.length > 0) {
          const minVaultBalance = await rpcConnection.getMinimumBalanceForRentExemption(
            vaultInfo.data.length
          );
          if (vaultInfo.lamports + feeInLamports < minVaultBalance) {
            throw new Error("Fee vault is not rent-exempt. Contact support.");
          }
        }

        instructions.push(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: vaultPubkey,
            lamports: feeInLamports,
          })
        );
      }

      // Create transaction
      const message = new TransactionMessage({
        payerKey: publicKey,
        recentBlockhash: blockhash,
        instructions,
      }).compileToV0Message();

      const transaction = new VersionedTransaction(message);
      const feeEstimate = await rpcConnection.getFeeForMessage(message);
      const networkFeeLamports = feeEstimate.value ?? 0;
      const walletBalanceLamports = await rpcConnection.getBalance(publicKey, "processed");
      if (walletBalanceLamports + totalRentLamports < feeInLamports + networkFeeLamports) {
        throw new Error("Insufficient GOR to cover fees. Keep a small balance in your wallet.");
      }

      let signature: string;

      // Prefer signing locally and sending via the configured Gorbagana RPC
      // @ts-ignore
      if (typeof window.backpack.signTransaction === "function") {
        // @ts-ignore
        const signedTransaction = await window.backpack.signTransaction(transaction);
        signature = await rpcConnection.sendRawTransaction(signedTransaction.serialize());
      } else {
        const walletRpc = getWalletRpcEndpoint(walletConnection);
        if (!walletRpc || !isGorbaganaRpc(walletRpc)) {
          throw new Error("Backpack RPC is not on Gorbagana. Please switch your wallet RPC and try again.");
        }

        // @ts-ignore
        signature = await window.backpack.signAndSendTransaction(transaction);
      }
      
      setTxSignature(signature);
      
      // Wait for confirmation
      await rpcConnection.confirmTransaction(
        {
          signature,
          blockhash,
          lastValidBlockHeight,
        },
        "processed"
      );
      
      setBurnComplete(true);
    } catch (err) {
      console.error("Error burning accounts:", err);

      if (err && typeof err === "object") {
        const sendTxError = err as { getLogs?: () => Promise<string[]> };
        if (typeof sendTxError.getLogs === "function") {
          try {
            const logs = await sendTxError.getLogs();
            console.error("Transaction logs:", logs);
          } catch (logError) {
            console.error("Failed to fetch transaction logs:", logError);
          }
        }
      }
      
      let errorMessage = "Failed to burn accounts";
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null) {
        // Try to extract error message from various error formats
        const errorObj = err as any;
        if (errorObj.message) {
          errorMessage = errorObj.message;
        } else if (errorObj.error) {
          errorMessage = typeof errorObj.error === 'string' ? errorObj.error : JSON.stringify(errorObj.error);
        } else if (errorObj.toString && errorObj.toString() !== '[object Object]') {
          errorMessage = errorObj.toString();
        } else {
          errorMessage = JSON.stringify(err, null, 2);
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!walletConnected) {
    return (
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader className="text-center">
          <div className="mx-auto h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
            <Wallet className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Connect Your Wallet</CardTitle>
          <CardDescription className="text-base mt-2">
            Connect your Backpack wallet to start burning empty token accounts and reclaiming your GOR
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={onConnectWallet}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            size="lg"
          >
            <Wallet className="mr-2 h-5 w-5" />
            Connect Backpack Wallet
          </Button>
          <p className="text-sm text-muted-foreground text-center mt-4">
            Don't have Backpack? <a href="https://backpack.app" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Download here</a>
          </p>
        </CardContent>
      </Card>
    );
  }

  if (burnComplete) {
    const accountsClosed = Math.min(accounts.length, 14);
    return (
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader className="text-center">
          <div className="mx-auto h-16 w-16 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl text-primary">Burn Complete!</CardTitle>
          <CardDescription className="text-base mt-2">
            Your empty token accounts have been successfully closed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-5 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Accounts closed:</span>
              <span className="font-bold text-lg">{accountsClosed}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Service fee (5%):</span>
              <span className="font-semibold">{serviceFee.toFixed(5)} GOR</span>
            </div>
            <div className="border-t border-border/50 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold">You received:</span>
                <span className="font-bold text-xl text-primary">{youReceive.toFixed(5)} GOR</span>
              </div>
            </div>
          </div>

          {txSignature && (
            <a
              href={`https://explorer.solana.com/tx/${txSignature}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-sm text-primary hover:underline"
            >
              View Transaction
              <ExternalLink className="h-4 w-4" />
            </a>
          )}

          <Button 
            onClick={() => {
              setBurnComplete(false);
              setAccounts([]);
              setTxSignature("");
              scanAccounts();
            }}
            className="w-full border-primary/30 hover:bg-primary/10"
            variant="outline"
          >
            Scan for More Accounts
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Ready to Burn</CardTitle>
            <CardDescription className="text-base mt-1">
              Connected: {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
            </CardDescription>
          </div>
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Flame className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-destructive mb-1">Error</p>
                <p className="text-muted-foreground">{error}</p>
              </div>
            </div>
          </div>
        )}

        {scanning ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
            <p className="text-muted-foreground">Scanning for empty token accounts...</p>
          </div>
        ) : (
          <>
            <div className="bg-muted/50 rounded-lg p-5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Empty accounts found:</span>
                <span className="font-bold text-lg">{accounts.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total rent to reclaim:</span>
                <span className="font-bold text-lg text-primary">{totalRent.toFixed(5)} GOR</span>
              </div>
              <div className="border-t border-border/50 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Service fee (5%):</span>
                  <span className="font-semibold">{serviceFee.toFixed(5)} GOR</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm font-semibold">You receive:</span>
                  <span className="font-bold text-xl text-primary">{youReceive.toFixed(5)} GOR</span>
                </div>
              </div>
            </div>

            {accounts.length > 0 && (
              <div className="bg-muted/30 rounded-lg p-4 max-h-64 overflow-y-auto">
                <p className="text-sm font-semibold mb-3">Token Accounts to Close:</p>
                <div className="space-y-2">
                  {accounts.slice(0, 14).map((account, idx) => (
                    <div key={account.pubkey} className="flex items-center justify-between text-xs bg-background/50 rounded p-2">
                      <span className="text-muted-foreground">#{idx + 1}</span>
                      <span className="font-mono text-foreground truncate mx-2 flex-1">
                        {account.mint.slice(0, 8)}...{account.mint.slice(-8)}
                      </span>
                      <span className="text-primary">{RENT_PER_ACCOUNT.toFixed(6)} GOR</span>
                    </div>
                  ))}
                  {accounts.length > 14 && (
                    <p className="text-xs text-muted-foreground text-center pt-2">
                      +{accounts.length - 14} more (will be processed in next transaction)
                    </p>
                  )}
                </div>
              </div>
            )}

            {accounts.length > 0 ? (
              <>
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-foreground mb-1">Before you proceed:</p>
                      <ul className="text-muted-foreground space-y-1">
                        <li>• Only empty accounts will be closed</li>
                        <li>• Your tokens are always safe</li>
                        <li>• Max 14 accounts per transaction</li>
                        <li>• 5% service fee will be deducted</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleBurn}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing Transaction...
                    </>
                  ) : (
                    <>
                      <Flame className="mr-2 h-5 w-5" />
                      Burn {Math.min(accounts.length, 14)} Accounts Now
                    </>
                  )}
                </Button>
              </>
            ) : (
              <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 mx-auto text-primary mb-4" />
                <p className="text-lg font-semibold mb-2">All Clean!</p>
                <p className="text-muted-foreground">No empty token accounts found in your wallet.</p>
                <Button 
                  onClick={scanAccounts}
                  variant="outline"
                  className="mt-4 border-primary/30 hover:bg-primary/10"
                >
                  Scan Again
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
