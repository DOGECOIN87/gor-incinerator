/**
 * Type definitions for Cook-Incinerator API
 * Cloudflare Workers backend for Cookbag Wallet integration
 */

import { PublicKey } from "@solana/web3.js";

// ============================================================================
// Environment & Configuration Types
// ============================================================================

export interface Env {
  // D1 Database binding
  DB: D1Database;
  
  // Secrets (set via wrangler secret put)
  API_KEY: string;
  ADMIN_API_KEY: string;
  COOK_RPC_URL: string;
  COOK_VAULT_ADDRESS_AETHER: string;
  COOK_VAULT_ADDRESS_INCINERATOR: string;
  
  // Environment variables
  ENVIRONMENT: string;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

/**
 * Token account information with burn eligibility
 */
export interface TokenAccount {
  pubkey: string;
  mint: string;
  balance: string;
  decimals: number; // Added for clarity in /assets response
  burnEligible: boolean;
  estimatedRent: number; // in COOK
  authComment?: string; // Added for debugging/clarity of eligibility
}

/**
 * Summary of burn-eligible accounts
 */
export interface AssetsSummary {
  totalAccounts: number;
  burnEligible: number;
  totalRent: number; // in COOK
  serviceFee: number; // in COOK (5% of totalRent)
  youReceive: number; // in COOK (95% of totalRent)
}

/**
 * Response for GET /assets/:wallet
 */
export interface AssetsResponse {
  wallet: string;
  accounts: TokenAccount[];
  summary: AssetsSummary;
}

/**
 * Request body for POST /build-burn-tx
 */
export interface BuildBurnTxRequest {
  wallet: string;
  accounts: string[]; // Array of token account pubkeys
  maxAccounts?: number; // Optional, defaults to 14
}

/**
 * Fee breakdown for transaction
 */
export interface FeeBreakdown {
  aetherLabs: number; // 2.5% in lamports
  cookIncinerator: number; // 2.5% in lamports
}

/**
 * Response for POST /build-burn-tx
 */
export interface BuildBurnTxResponse {
  transaction: string; // Base64 encoded serialized transaction
  accountsToClose: number;
  totalRent: number; // in COOK
  serviceFee: number; // in COOK (5% total)
  feeBreakdown: FeeBreakdown; // Split by party
  youReceive: number; // in COOK
  blockhash: string;
  requiresSignatures: string[]; // Array of pubkeys that need to sign
}

/**
 * Query parameters for GET /reconciliation/report
 */
export interface ReconciliationQuery {
  start: string; // ISO date string YYYY-MM-DD
  end: string; // ISO date string YYYY-MM-DD
}

/**
 * Period information for reconciliation report
 */
export interface ReconciliationPeriod {
  start: string;
  end: string;
}

/**
 * Summary statistics for reconciliation report
 */
export interface ReconciliationSummary {
  totalTransactions: number;
  totalAccountsClosed: number;
  totalRent: number; // in COOK
  totalFees: number; // in COOK
  aetherLabsShare: number; // in COOK
  cookIncineratorShare: number; // in COOK
}

/**
 * Individual transaction record for reconciliation
 */
export interface TransactionRecord {
  id: number;
  timestamp: string;
  wallet: string;
  accountsClosed: number;
  totalRent: number;
  serviceFee: number;
  aetherLabsFee: number;
  cookIncineratorFee: number;
  txHash: string | null;
  status: "pending" | "confirmed" | "failed";
  createdAt: string;
}

/**
 * Response for GET /reconciliation/report
 */
export interface ReconciliationResponse {
  period: ReconciliationPeriod;
  summary: ReconciliationSummary;
  transactions: TransactionRecord[];
}

// ============================================================================
// Database Types
// ============================================================================

/**
 * Database row for transactions table
 */
export interface TransactionRow {
  id: number;
  timestamp: string;
  wallet: string;
  accounts_closed: number;
  total_rent: number;
  service_fee: number;
  aether_labs_fee: number;
  cook_incinerator_fee: number;
  tx_hash: string | null;
  status: string;
  created_at: string;
}

// ============================================================================
// Internal Service Types
// ============================================================================

/**
 * Fee calculation result
 */
export interface FeeCalculation {
  totalRent: number; // in lamports
  serviceFee: number; // in lamports (5% of totalRent)
  aetherLabsFee: number; // in lamports (2.5% of totalRent)
  cookIncineratorFee: number; // in lamports (2.5% of totalRent)
  netAmount: number; // in lamports (95% of totalRent)
}

/**
 * Parsed token account data from RPC
 */
export interface ParsedTokenAccountData {
  pubkey: PublicKey;
  account: {
    data: {
      parsed: {
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
      };
    };
  };
}

// ============================================================================
// Error Types
// ============================================================================

export interface ApiError {
  error: string;
  message: string;
  status: number;
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class BlockchainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BlockchainError";
  }
}
