/**
 * API Client for Gor-Incinerator Backend
 * Handles communication with Cloudflare Workers API
 */

// API Types
export interface TokenAccount {
  pubkey: string;
  mint: string;
  balance: string;
  burnEligible: boolean;
  estimatedRent: number;
}

export interface AssetsSummary {
  totalAccounts: number;
  burnEligible: number;
  totalRent: number;
  serviceFee: number;
  youReceive: number;
}

export interface AssetsResponse {
  wallet: string;
  accounts: TokenAccount[];
  summary: AssetsSummary;
}

export interface FeeBreakdown {
  aetherLabs: number;
  gorIncinerator: number;
}

export interface BuildBurnTxResponse {
  transaction: string; // Base64 encoded
  accountsToClose: number;
  totalRent: number;
  serviceFee: number;
  feeBreakdown: FeeBreakdown;
  youReceive: number;
  blockhash: string;
  requiresSignatures: string[];
}

export interface BuildBurnTxRequest {
  wallet: string;
  accounts: string[];
  maxAccounts?: number;
}

/**
 * API Client Configuration
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const API_KEY = import.meta.env.VITE_API_KEY || "";

/**
 * Check if API mode is enabled
 */
export function isApiModeEnabled(): boolean {
  return Boolean(API_BASE_URL);
}

/**
 * Fetch burn-eligible assets for a wallet
 * @param walletAddress - Wallet public key
 * @returns Assets response with burn-eligible accounts
 */
export async function fetchAssets(walletAddress: string): Promise<AssetsResponse> {
  if (!API_BASE_URL) {
    throw new Error("API_BASE_URL not configured");
  }

  const response = await fetch(`${API_BASE_URL}/assets/${walletAddress}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch assets");
  }

  return response.json();
}

/**
 * Build burn transaction via API
 * @param request - Build transaction request
 * @returns Unsigned transaction and metadata
 */
export async function buildBurnTransaction(
  request: BuildBurnTxRequest
): Promise<BuildBurnTxResponse> {
  if (!API_BASE_URL) {
    throw new Error("API_BASE_URL not configured");
  }

  const response = await fetch(`${API_BASE_URL}/build-burn-tx`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to build transaction");
  }

  return response.json();
}

/**
 * Deserialize base64 transaction for signing
 * @param serializedTx - Base64 encoded transaction
 * @returns VersionedTransaction ready for signing
 */
export async function deserializeTransaction(serializedTx: string) {
  const { VersionedTransaction } = await import("@solana/web3.js");
  const txBuffer = Buffer.from(serializedTx, "base64");
  return VersionedTransaction.deserialize(txBuffer);
}
