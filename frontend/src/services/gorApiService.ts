/**
 * GOR API Service
 * Fetches token metadata (logos, names, symbols) from gorapi.onrender.com
 */

const GOR_API_BASE_URL = "https://gorapi.onrender.com";

export interface TokenMetadata {
    mint: string;
    name: string;
    symbol: string;
    logo: string | null;
    decimals?: number;
}

interface GorApiTokenResponse {
    mint: string;
    metadata: {
        name: string;
        symbol: string;
        logo: string;
        decimals: number;
        description?: string;
    };
    price?: {
        usd: number;
    };
}

// Wrapper response from the API
interface GorApiSearchResponse {
    success: boolean;
    query: string;
    count: number;
    data: GorApiTokenResponse[];
}

// Cache for token metadata to avoid repeated API calls
const tokenMetadataCache = new Map<string, TokenMetadata | null>();

/**
 * Fetch metadata for a single token by mint address
 * @param mint - Token mint address
 * @returns Token metadata or null if not found
 */
export async function fetchTokenMetadata(mint: string): Promise<TokenMetadata | null> {
    // Check cache first
    if (tokenMetadataCache.has(mint)) {
        return tokenMetadataCache.get(mint) || null;
    }

    try {
        const response = await fetch(`${GOR_API_BASE_URL}/api/tokens/search?q=${mint}`);

        if (!response.ok) {
            tokenMetadataCache.set(mint, null);
            return null;
        }

        const apiResponse: GorApiSearchResponse = await response.json();

        // Check if we got valid data
        if (!apiResponse.success || !apiResponse.data || apiResponse.data.length === 0) {
            tokenMetadataCache.set(mint, null);
            return null;
        }

        // Find exact match for the mint address
        const token = apiResponse.data.find(t => t.mint === mint);

        if (!token) {
            tokenMetadataCache.set(mint, null);
            return null;
        }

        const metadata: TokenMetadata = {
            mint: token.mint,
            name: token.metadata.name,
            symbol: token.metadata.symbol,
            logo: token.metadata.logo || null,
            decimals: token.metadata.decimals,
        };

        tokenMetadataCache.set(mint, metadata);
        return metadata;
    } catch (error) {
        console.error(`Error fetching token metadata for ${mint}:`, error);
        tokenMetadataCache.set(mint, null);
        return null;
    }
}

/**
 * Fetch metadata for multiple tokens in parallel
 * @param mints - Array of token mint addresses
 * @returns Map of mint address to token metadata
 */
export async function fetchBatchTokenMetadata(
    mints: string[]
): Promise<Map<string, TokenMetadata | null>> {
    const uniqueMints = [...new Set(mints)];
    const results = new Map<string, TokenMetadata | null>();

    // Fetch all tokens in parallel with a small delay to avoid rate limiting
    const promises = uniqueMints.map(async (mint, index) => {
        // Add small stagger to avoid overwhelming the API
        if (index > 0) {
            await new Promise(resolve => setTimeout(resolve, index * 50));
        }
        const metadata = await fetchTokenMetadata(mint);
        results.set(mint, metadata);
    });

    await Promise.all(promises);
    return results;
}

/**
 * Clear the token metadata cache
 */
export function clearTokenMetadataCache(): void {
    tokenMetadataCache.clear();
}
