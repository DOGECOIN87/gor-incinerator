/**
 * Enhanced Burn Interface with API Mode Support
 * Supports both direct wallet mode and backend API mode
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Loader2, CheckCircle2, AlertCircle, Wallet, ExternalLink, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { isApiModeEnabled, fetchAssets, buildBurnTransaction, deserializeTransaction } from "@/services/apiClient";

interface TokenAccount {
  pubkey: string;
  mint: string;
  balance: string;
  burnEligible?: boolean;
  estimatedRent?: number;
}

interface BurnInterfaceProps {
  walletConnected: boolean;
  walletAddress: string;
  onConnectWallet: () => void;
}

const RENT_PER_ACCOUNT = 0.00203928; // GOR per account
const FEE_PERCENTAGE = 0.05; // 5%
const TOKEN_PROGRAM_ID = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";

// Fee vault addresses (50/50 split) - hardcoded for reliability
const AETHER_LABS_VAULT = "DvY73fC74Ny33Zu3ScA62VCSwrz1yV8kBysKu3rnLjvD";
const GOR_INCINERATOR_VAULT = "BuRnX2HDP8s1CFdYwKpYCCshaZcTvFm3xjbmXPR3QsdG";

const BLACKLIST = [
  "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
];

export default function BurnInterfaceAPI({ walletConnected, walletAddress, onConnectWallet }: BurnInterfaceProps) {
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<TokenAccount[]>([]);
  const [totalRent, setTotalRent] = useState(0);
  const [serviceFee, setServiceFee] = useState(0);
  const [aetherLabsFee, setAetherLabsFee] = useState(0);
  const [gorIncineratorFee, setGorIncineratorFee] = useState(0);
  const [youReceive, setYouReceive] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [burnComplete, setBurnComplete] = useState(false);
  const [txSignature, setTxSignature] = useState<string>("");
  const [error, setError] = useState<string>("");
  const apiMode = isApiModeEnabled();

  useEffect(() => {
    if (walletConnected && !scanning && accounts.length === 0) {
      scanAccounts();
    }
  }, [walletConnected]);

  /**
   * Scan accounts using API mode
   */
  const scanAccountsAPI = async () => {
    try {
      const response = await fetchAssets(walletAddress);
      
      setAccounts(response.accounts);
      setTotalRent(response.summary.totalRent);
      setServiceFee(response.summary.serviceFee);
      
      // Calculate 50/50 split
      const halfFee = response.summary.serviceFee / 2;
      setAetherLabsFee(halfFee);
      setGorIncineratorFee(halfFee);
      
      setYouReceive(response.summary.youReceive);
    } catch (err) {
      console.error("Error scanning accounts via API:", err);
      throw err;
    }
  };

  /**
   * Scan accounts using direct wallet mode (original implementation)
   */
  const scanAccountsDirect = async () => {
    try {
      // @ts-ignore - Backpack wallet API
      if (!window.backpack) {
        throw new Error("Backpack wallet not found");
      }

      // @ts-ignore
      const connection = window.backpack.connection;
      // @ts-ignore
      const publicKey = window.backpack.publicKey;

      const { PublicKey } = await import("@solana/web3.js");

      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: new PublicKey(TOKEN_PROGRAM_ID) }
      );

      const emptyAccounts: TokenAccount[] = [];
      
      for (const account of tokenAccounts.value) {
        const data = account.account.data.parsed.info;
        const balance = data.tokenAmount.amount;
        const mint = data.mint;

        if (balance === "0" && !BLACKLIST.includes(mint)) {
          emptyAccounts.push({
            pubkey: account.pubkey.toString(),
            mint: mint,
            balance: balance,
            burnEligible: true,
            estimatedRent: RENT_PER_ACCOUNT,
          });
        }
      }

      setAccounts(emptyAccounts);
      
      const rent = emptyAccounts.length * RENT_PER_ACCOUNT;
      const fee = rent * FEE_PERCENTAGE;
      
      setTotalRent(rent);
      setServiceFee(fee);
      
      // 50/50 split
      const halfFee = fee / 2;
      setAetherLabsFee(halfFee);
      setGorIncineratorFee(halfFee);
      
      setYouReceive(rent - fee);
    } catch (err) {
      console.error("Error scanning accounts directly:", err);
      throw err;
    }
  };

  const scanAccounts = async () => {
    setScanning(true);
    setError("");
    
    try {
      if (apiMode) {
        await scanAccountsAPI();
      } else {
        await scanAccountsDirect();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to scan accounts");
    } finally {
      setScanning(false);
    }
  };

  /**
   * Build and sign transaction using API mode
   */
  const handleBurnAPI = async () => {
    setLoading(true);
    setError("");
    
    try {
      // @ts-ignore
      if (!window.backpack) {
        throw new Error("Backpack wallet not found");
      }

      // Build transaction via API
      const response = await buildBurnTransaction({
        wallet: walletAddress,
        accounts: accounts.slice(0, 14).map(a => a.pubkey),
        maxAccounts: 14,
      });

      // Deserialize transaction
      const transaction = await deserializeTransaction(response.transaction);

      // Sign and send via Backpack
      // @ts-ignore
      const signature = await window.backpack.signAndSendTransaction(transaction);
      
      setTxSignature(signature);
      
      // @ts-ignore
      const connection = window.backpack.connection;
      await connection.confirmTransaction(signature, "processed");
      
      setBurnComplete(true);
    } catch (err) {
      console.error("Error burning accounts via API:", err);
      setError(err instanceof Error ? err.message : "Failed to burn accounts");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Build and sign transaction using direct mode (original implementation)
   */
  const handleBurnDirect = async () => {
    setLoading(true);
    setError("");
    
    try {
      // @ts-ignore
      if (!window.backpack) {
        throw new Error("Backpack wallet not found");
      }

      // @ts-ignore
      const connection = window.backpack.connection;
      // @ts-ignore
      const publicKey = window.backpack.publicKey;

      const { 
        TransactionMessage, 
        VersionedTransaction,
        ComputeBudgetProgram,
        SystemProgram,
        PublicKey
      } = await import("@solana/web3.js");
      
      const { createCloseAccountInstruction } = await import("@solana/spl-token");

      const { blockhash } = await connection.getLatestBlockhash("processed");

      const instructions = [
        ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1000 }),
        ComputeBudgetProgram.setComputeUnitLimit({ units: 45000 }),
      ];

      const accountsToClose = accounts.slice(0, 14);
      for (const account of accountsToClose) {
        instructions.push(
          createCloseAccountInstruction(
            new PublicKey(account.pubkey),
            publicKey,
            publicKey
          )
        );
      }

      // Add fee transfers (50/50 split) - using hardcoded vault addresses for reliability
      if (aetherLabsFee > 0) {
        instructions.push(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: new PublicKey(AETHER_LABS_VAULT),
            lamports: Math.floor(aetherLabsFee * 1e9),
          })
        );
      }

      if (gorIncineratorFee > 0) {
        instructions.push(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: new PublicKey(GOR_INCINERATOR_VAULT),
            lamports: Math.floor(gorIncineratorFee * 1e9),
          })
        );
      }

      const message = new TransactionMessage({
        payerKey: publicKey,
        recentBlockhash: blockhash,
        instructions,
      }).compileToV0Message();

      const transaction = new VersionedTransaction(message);

      // @ts-ignore
      const signature = await window.backpack.signAndSendTransaction(transaction);
      
      setTxSignature(signature);
      await connection.confirmTransaction(signature, "processed");
      
      setBurnComplete(true);
    } catch (err) {
      console.error("Error burning accounts directly:", err);
      setError(err instanceof Error ? err.message : "Failed to burn accounts");
    } finally {
      setLoading(false);
    }
  };

  const handleBurn = async () => {
    if (apiMode) {
      await handleBurnAPI();
    } else {
      await handleBurnDirect();
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
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Accounts Closed:</span>
              <span className="font-medium">{accountsClosed}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Rent Reclaimed:</span>
              <span className="font-medium">{totalRent.toFixed(8)} GOR</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Service Fee (5%):</span>
              <span className="font-medium">{serviceFee.toFixed(8)} GOR</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground pl-4">
              <span>→ Aether Labs (2.5%):</span>
              <span>{aetherLabsFee.toFixed(8)} GOR</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground pl-4">
              <span>→ Gor-incinerator (2.5%):</span>
              <span>{gorIncineratorFee.toFixed(8)} GOR</span>
            </div>
            <div className="flex justify-between text-base font-semibold pt-2 border-t border-border">
              <span>You Received:</span>
              <span className="text-primary">{youReceive.toFixed(8)} GOR</span>
            </div>
          </div>

          {txSignature && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open(`https://explorer.gorbagana.com/tx/${txSignature}`, "_blank")}
            >
              View Transaction
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          )}

          <Button
            onClick={() => {
              setBurnComplete(false);
              setTxSignature("");
              setAccounts([]);
              scanAccounts();
            }}
            className="w-full"
            variant="secondary"
          >
            Burn More Accounts
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
            <CardTitle className="text-2xl">Burn Empty Accounts</CardTitle>
            <CardDescription className="mt-2">
              Close empty token accounts and reclaim your GOR
            </CardDescription>
          </div>
          {apiMode && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
              <Info className="h-3 w-3" />
              <span>API Mode</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {scanning ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Scanning for empty accounts...</p>
          </div>
        ) : accounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-base font-medium">No Empty Accounts Found</p>
            <p className="text-sm text-muted-foreground mt-2">Your wallet is already optimized!</p>
          </div>
        ) : (
          <>
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Empty Accounts Found:</span>
                <span className="text-lg font-semibold">{accounts.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Rent to Reclaim:</span>
                <span className="text-lg font-semibold">{totalRent.toFixed(8)} GOR</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Service Fee (5%):</span>
                <span className="font-medium">{serviceFee.toFixed(8)} GOR</span>
              </div>
              <div className="flex justify-between items-center text-xs text-muted-foreground pl-4">
                <span>→ Aether Labs (2.5%):</span>
                <span>{aetherLabsFee.toFixed(8)} GOR</span>
              </div>
              <div className="flex justify-between items-center text-xs text-muted-foreground pl-4">
                <span>→ Gor-incinerator (2.5%):</span>
                <span>{gorIncineratorFee.toFixed(8)} GOR</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-border">
                <span className="font-medium">You Will Receive:</span>
                <span className="text-xl font-bold text-primary">{youReceive.toFixed(8)} GOR</span>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-destructive">Error</p>
                  <p className="text-xs text-destructive/80 mt-1">{error}</p>
                </div>
              </div>
            )}

            <Button
              onClick={handleBurn}
              disabled={loading || accounts.length === 0}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Flame className="mr-2 h-5 w-5" />
                  Burn {Math.min(accounts.length, 14)} Accounts
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Maximum 14 accounts per transaction. {accounts.length > 14 && `Remaining: ${accounts.length - 14}`}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
