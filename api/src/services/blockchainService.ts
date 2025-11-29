/**
 * Blockchain service for Gorbagana RPC interactions
 * Handles fetching token accounts and building transactions
 */

import { Connection, PublicKey } from "@solana/web3.js";
import { TokenAccount, ParsedTokenAccountData, BlockchainError } from "../types";
import { RENT_PER_ACCOUNT, lamportsToGor } from "./feeService";

/**
 * Gorbagana Token Program ID (same as Solana)
 */
export const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");

/**
 * Blacklist of important tokens that should never be closed
 * These are typically stablecoins or other critical tokens
 */
export const TOKEN_BLACKLIST = [
  "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm", // Example token 1
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // Example token 2 (USDC on Solana)
];

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
 * Check if a token account is burn-eligible
 * @param account - Parsed token account data
 * @returns True if account can be burned
 */
export function isBurnEligible(account: ParsedTokenAccountData): boolean {
  const info = account.account.data.parsed.info;
  const balance = info.tokenAmount.amount;
  const mint = info.mint;

  // Account must have zero balance
  if (balance !== "0") {
    return false;
  }

  // Account must not be in blacklist
  if (TOKEN_BLACKLIST.includes(mint)) {
    return false;
  }

  return true;
}

/**
 * Filter token accounts for burn-eligible ones
 * @param accounts - Array of parsed token account data
 * @returns Array of burn-eligible token accounts with metadata
 */
export function filterBurnEligibleAccounts(accounts: ParsedTokenAccountData[]): TokenAccount[] {
  return accounts
    .filter(isBurnEligible)
    .map((account) => {
      const info = account.account.data.parsed.info;
      return {
        pubkey: account.pubkey.toString(),
        mint: info.mint,
        balance: info.tokenAmount.amount,
        burnEligible: true,
        estimatedRent: lamportsToGor(RENT_PER_ACCOUNT),
      };
    });
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
