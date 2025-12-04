/**
 * Gorbagio NFT Verification Service
 * Checks if a wallet holds a Gorbagio NFT for 0% fee eligibility
 *
 * Gorbagio NFT holders receive 0% service fees on burns
 * Regular users pay the standard 5% service fee
 */

import { Connection, PublicKey } from "@solana/web3.js";
import { Env, BlockchainError } from "../types";

/**
 * Configuration for Gorbagio NFT collection
 * These should be set via environment variables
 */
export interface GorbagioConfig {
  collectionMintAddress?: string; // Metaplex collection mint
  creatorAddress?: string; // NFT creator address
  verifiedMints?: string[]; // Whitelist of known Gorbagio mints
  updateAuthority?: string; // Update authority address
}

/**
 * Cache for NFT holder status to reduce blockchain queries
 * Cache expires after 5 minutes
 */
const NFT_HOLDER_CACHE = new Map<string, { isHolder: boolean; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Parse Gorbagio configuration from environment
 * @param env - Environment bindings
 * @returns GorbagioConfig
 */
export function getGorbagioConfig(env: Env): GorbagioConfig {
  const config: GorbagioConfig = {};

  if (env.GORBAGIO_COLLECTION_MINT) {
    config.collectionMintAddress = env.GORBAGIO_COLLECTION_MINT;
  }

  if (env.GORBAGIO_CREATOR_ADDRESS) {
    config.creatorAddress = env.GORBAGIO_CREATOR_ADDRESS;
  }

  if (env.GORBAGIO_UPDATE_AUTHORITY) {
    config.updateAuthority = env.GORBAGIO_UPDATE_AUTHORITY;
  }

  if (env.GORBAGIO_VERIFIED_MINTS) {
    // Parse comma-separated list of mint addresses
    config.verifiedMints = env.GORBAGIO_VERIFIED_MINTS.split(",").map((addr) => addr.trim());
  }

  return config;
}

/**
 * Check if wallet holds a Gorbagio NFT
 * Uses caching to minimize RPC calls
 *
 * @param connection - Solana connection
 * @param walletAddress - Wallet address to check
 * @param config - Gorbagio NFT configuration
 * @returns True if wallet holds a Gorbagio NFT
 */
export async function isGorbagioNFTHolder(
  connection: Connection,
  walletAddress: PublicKey,
  config: GorbagioConfig
): Promise<boolean> {
  const walletKey = walletAddress.toBase58();

  // Check cache first
  const cached = NFT_HOLDER_CACHE.get(walletKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.isHolder;
  }

  try {
    // If no configuration provided, cannot verify - return false
    if (
      !config.collectionMintAddress &&
      !config.creatorAddress &&
      !config.updateAuthority &&
      (!config.verifiedMints || config.verifiedMints.length === 0)
    ) {
      // Cache negative result
      NFT_HOLDER_CACHE.set(walletKey, { isHolder: false, timestamp: Date.now() });
      return false;
    }

    // Fetch all token accounts for wallet
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(walletAddress, {
      programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
    });

    // Filter for NFT accounts (balance = 1, decimals = 0)
    for (const { account } of tokenAccounts.value) {
      const parsedInfo = account.data.parsed?.info;
      if (!parsedInfo) continue;

      const amount = parsedInfo.tokenAmount?.amount;
      const decimals = parsedInfo.tokenAmount?.decimals;
      const mint = parsedInfo.mint;

      // Check if this is an NFT (1 token, 0 decimals)
      if (amount === "1" && decimals === 0) {
        // Verify if this NFT is a Gorbagio
        const isGorbagio = await verifyGorbagioNFT(connection, mint, config);
        if (isGorbagio) {
          // Cache positive result
          NFT_HOLDER_CACHE.set(walletKey, { isHolder: true, timestamp: Date.now() });
          return true;
        }
      }
    }

    // No Gorbagio NFT found - cache negative result
    NFT_HOLDER_CACHE.set(walletKey, { isHolder: false, timestamp: Date.now() });
    return false;
  } catch (error) {
    console.error("Error checking Gorbagio NFT holder status:", error);
    // On error, default to false (standard fees apply)
    return false;
  }
}

/**
 * Verify if a specific NFT mint is a Gorbagio NFT
 * Checks against multiple verification methods
 *
 * @param connection - Solana connection
 * @param mintAddress - NFT mint address
 * @param config - Gorbagio NFT configuration
 * @returns True if NFT is verified as Gorbagio
 */
async function verifyGorbagioNFT(
  connection: Connection,
  mintAddress: string,
  config: GorbagioConfig
): Promise<boolean> {
  try {
    // Method 1: Check against whitelist of verified mints
    if (config.verifiedMints && config.verifiedMints.length > 0) {
      if (config.verifiedMints.includes(mintAddress)) {
        return true;
      }
    }

    // Method 2: Fetch NFT metadata and verify collection/creator
    const mintPubkey = new PublicKey(mintAddress);

    // Get metadata account (using Metaplex standard)
    const metadataAddress = await getMetadataAddress(mintPubkey);
    const accountInfo = await connection.getAccountInfo(metadataAddress);

    if (!accountInfo) {
      return false;
    }

    // Parse metadata (simplified - in production use @metaplex-foundation/js)
    const metadata = parseMetadata(accountInfo.data);

    // Check collection mint address
    if (config.collectionMintAddress && metadata.collection === config.collectionMintAddress) {
      return true;
    }

    // Check creator address
    if (config.creatorAddress && metadata.creators?.includes(config.creatorAddress)) {
      return true;
    }

    // Check update authority
    if (config.updateAuthority && metadata.updateAuthority === config.updateAuthority) {
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error verifying NFT ${mintAddress}:`, error);
    return false;
  }
}

/**
 * Get Metaplex metadata account address for a mint
 * @param mintAddress - NFT mint public key
 * @returns Metadata account public key
 */
async function getMetadataAddress(mintAddress: PublicKey): Promise<PublicKey> {
  const METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
  const [metadataAddress] = await PublicKey.findProgramAddress(
    [Buffer.from("metadata"), METADATA_PROGRAM_ID.toBuffer(), mintAddress.toBuffer()],
    METADATA_PROGRAM_ID
  );
  return metadataAddress;
}

/**
 * Parse metadata account data (simplified version)
 * In production, use @metaplex-foundation/js for complete parsing
 *
 * @param data - Account data buffer
 * @returns Parsed metadata
 */
function parseMetadata(data: Buffer): {
  updateAuthority?: string;
  collection?: string;
  creators?: string[];
} {
  try {
    // Simplified parsing - extract key fields
    // Update authority is at bytes 1-33
    const updateAuthority = new PublicKey(data.slice(1, 33)).toBase58();

    // For full implementation, use Metaplex JS SDK to parse:
    // - Collection verification
    // - Creator addresses
    // - Symbol and name (for additional verification)

    return {
      updateAuthority,
      // TODO: Add full metadata parsing when Metaplex SDK is available
      collection: undefined,
      creators: [],
    };
  } catch (error) {
    console.error("Error parsing metadata:", error);
    return {};
  }
}

/**
 * Clear NFT holder cache for a specific wallet
 * Useful when cache needs to be invalidated
 *
 * @param walletAddress - Wallet address
 */
export function clearNFTHolderCache(walletAddress: string): void {
  NFT_HOLDER_CACHE.delete(walletAddress);
}

/**
 * Clear all NFT holder cache
 * Useful for testing or manual cache refresh
 */
export function clearAllNFTHolderCache(): void {
  NFT_HOLDER_CACHE.clear();
}
