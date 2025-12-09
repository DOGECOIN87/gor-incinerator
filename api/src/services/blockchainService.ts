/**
 * Blockchain service for Gorbagana RPC interactions
 * Handles fetching token accounts and building transactions
 */

import { Connection, PublicKey } from "@solana/web3.js";
import { TokenAccount, ParsedTokenAccountData, BlockchainError } from "../types";
import { RENT_PER_ACCOUNT, lamportsToGor } from "./feeService";
import { AccountLayout, MintLayout } from "@solana/spl-token";

/**
 * Gorbagana Token Program ID (same as Solana)
 */
export const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");

/**
 * Interface for simplified token account info
 */
export interface SimpleTokenAccountInfo {
  mint: string;
  owner: string;
  amount: number;
  decimals: number;
}

/**
 * Blacklist of important tokens that should never be closed
 * These are typically stablecoins or other critical tokens
 */
export const TOKEN_BLACKLIST = [
  "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm", // Example token 1
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // Example token 2 (USDC on Solana)
];

/**
 * Fetch the mint authority for a given mint address.
 * @param connection - RPC connection
 * @param mintPubkey - Mint public key
 * @returns Mint authority PublicKey or null if not found
 */
export async function getMintAuthority(
  connection: Connection,
  mintPubkey: PublicKey
): Promise<PublicKey | null> {
  try {
    const mintInfo = await connection.getAccountInfo(mintPubkey);
    if (!mintInfo) {
      return null;
    }
    const data = MintLayout.decode(mintInfo.data);
    if (data.mintAuthorityOption === 0) {
      return null; // No mint authority
    }
    return new PublicKey(data.mintAuthority);
  } catch (error) {
    throw new BlockchainError(
      `Failed to fetch mint authority for ${mintPubkey.toBase58()}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Fetch and parse a token account's data.
 * @param connection - RPC connection
 * @param accountPubkey - Token account public key
 * @returns Simplified token account info
 */
export async function getAccountInfo(
  connection: Connection,
  accountPubkey: PublicKey
): Promise<SimpleTokenAccountInfo | null> {
  try {
    const accountInfo = await connection.getAccountInfo(accountPubkey);
    if (!accountInfo) {
      return null;
    }
    const data = AccountLayout.decode(accountInfo.data);
    const amount = Number(data.amount);
    const mint = new PublicKey(data.mint).toBase58();
    const owner = new PublicKey(data.owner).toBase58();

    // Fetch mint info to get decimals
    const mintAccountInfo = await connection.getAccountInfo(data.mint);
    if (!mintAccountInfo) {
        throw new BlockchainError(`Mint account not found for token account ${accountPubkey.toBase58()}`);
    }
    const mintData = MintLayout.decode(mintAccountInfo.data);
    const decimals = mintData.decimals;

    return {
      mint,
      owner,
      amount,
      decimals,
    };
  } catch (error) {
    throw new BlockchainError(
      `Failed to fetch token account info for ${accountPubkey.toBase58()}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

// The existing fetchTokenAccounts function uses getParsedTokenAccountsByOwner which is good for /assets.
// The existing isBurnEligible and filterBurnEligibleAccounts will be updated in Phase 3.
// For now, we only need the new helper functions for the transaction builder.


/**
 * Create connection to Gorbagana RPC
 * @param rpcUrl - RPC endpoint URL
 * @returns Connection instance
 */
export function createConnection(rpcUrl: string): Connection {
  return new Connection(rpcUrl, {
    commitment: "processed",
  });
}

/**
 * Fetch all token accounts for a wallet
 * @param connection - RPC connection
 * @param walletAddress - Wallet public key
 * @returns Array of parsed token account data
 */
export async function fetchTokenAccounts(
  connection: Connection,
  walletAddress: PublicKey
): Promise<ParsedTokenAccountData[]> {
  try {
    const response = await connection.getParsedTokenAccountsByOwner(walletAddress, {
      programId: TOKEN_PROGRAM_ID,
    });

    return response.value as ParsedTokenAccountData[];
  } catch (error) {
    throw new BlockchainError(
      `Failed to fetch token accounts: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Check if a token account is blacklisted.
 * @param mint - Mint address string
 * @returns True if the mint is blacklisted
 */
export function isBlacklisted(mint: string): boolean {
  return TOKEN_BLACKLIST.includes(mint);
}

/**
 * Enriches token accounts with burn eligibility status and metadata.
 * This function implements the new burn eligibility rules.
 * @param connection - RPC connection
 * @param walletPubkey - The wallet public key (payer)
 * @param accounts - Array of parsed token account data
 * @returns Array of token accounts with full metadata
 */
export async function enrichTokenAccounts(
  connection: Connection,
  walletPubkey: PublicKey,
  accounts: ParsedTokenAccountData[]
): Promise<TokenAccount[]> {
  const enrichedAccounts: TokenAccount[] = [];

  for (const account of accounts) {
    const info = account.account.data.parsed.info;
    const pubkey = account.pubkey.toString();
    const mint = info.mint;
    const balance = info.tokenAmount.amount;
    const decimals = info.tokenAmount.decimals;
    const mintPubkey = new PublicKey(mint);

    // 1. Check Blacklist
    const isMintBlacklisted = isBlacklisted(mint);

    let burnEligible = false;
    let isMintAuthority = false;

    if (!isMintBlacklisted) {
      // 2. Check Mint/Burn Authority (only necessary if balance > 0)
      if (balance !== "0") {
        const mintAuthority = await getMintAuthority(connection, mintPubkey);
        isMintAuthority = mintAuthority?.toBase58() === walletPubkey.toBase58();
      }

      // 3. Apply New Rules:
      // burnEligible = true IF:
      // - Not blacklisted AND (
      //     - tokenAmount.amount === "0"
      //     OR
      //     - wallet is mint/burn authority for the token
      //   )
      burnEligible = balance === "0" || isMintAuthority;
    }

    // Add comments explaining auth rules (as requested by user)
    let authComment: string;
    if (isMintBlacklisted) {
      authComment = "Blacklisted token, cannot be burned or closed.";
    } else if (balance !== "0" && isMintAuthority) {
      authComment = "Wallet is Mint Authority, allowing burn of non-zero balance.";
    } else if (balance === "0") {
      authComment = "Zero balance, allowing close.";
    } else {
      authComment = "Non-zero balance, and wallet is not Mint Authority, cannot be burned/closed.";
    }

    enrichedAccounts.push({
      pubkey,
      mint,
      balance,
      decimals,
      burnEligible,
      estimatedRent: lamportsToGor(RENT_PER_ACCOUNT),
      authComment,
    });
  }

  return enrichedAccounts;
}

/**
 * Validate wallet address format
 * @param address - Wallet address string
 * @returns PublicKey if valid
 * @throws BlockchainError if invalid
 */
export function validateWalletAddress(address: string): PublicKey {
  try {
    return new PublicKey(address);
  } catch (error) {
    throw new BlockchainError(`Invalid wallet address: ${address}`);
  }
}

/**
 * Validate array of token account addresses
 * @param accounts - Array of account address strings
 * @returns Array of PublicKeys if all valid
 * @throws BlockchainError if any invalid
 */
export function validateAccountAddresses(accounts: string[]): PublicKey[] {
  return accounts.map((account, index) => {
    try {
      return new PublicKey(account);
    } catch (error) {
      throw new BlockchainError(`Invalid account address at index ${index}: ${account}`);
    }
  });
}
