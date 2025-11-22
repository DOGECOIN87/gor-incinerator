import { PublicKey } from "@solana/web3.js";

/**
 * Represents a token account with its metadata
 */
export interface TokenAccountInfo {
  pubkey: PublicKey;
  mint: string;
  owner: string;
  balance: string;
  decimals: number;
}

/**
 * Result of a transaction execution
 */
export interface TransactionResult {
  signature: string;
  success: boolean;
  error?: string;
  rentReclaimed?: number;
}

/**
 * Fee calculation details
 */
export interface FeeCalculation {
  totalRent: number;
  feePercentage: number;
  feeAmount: number;
  netAmount: number;
}

/**
 * Context for building and executing transactions
 */
export interface TransactionContext {
  accounts: TokenAccountInfo[];
  blockhash: string;
  lastValidBlockHeight: number;
  payer: PublicKey;
}

/**
 * Token account data structure from RPC response
 */
export interface TokenAccountData {
  info: {
    isNative: boolean;
    mint: string;
    owner: string;
    state: string;
    tokenAmount: {
      amount: string;
      decimals: number;
      uiAmount: number;
      uiAmountString: string;
    };
  };
}
