# Phase 3 — Update Burn-Eligibility Logic

This phase implemented the new burn eligibility rules as requested by the user. The core logic is now contained within the new `enrichTokenAccounts` function in `api/src/services/blockchainService.ts`.

The `TokenAccount` interface in `api/src/types/index.ts` was also updated to include `decimals` and an `authComment` for clarity and to support the `/assets` API endpoint.

## Updated Code: `api/src/services/blockchainService.ts` (Diff)

The previous `isBurnEligible` and `filterBurnEligibleAccounts` functions were replaced by the comprehensive `enrichTokenAccounts` function.

```typescript
// ... (omitted existing code)

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
```

## Updated Interface: `api/src/types/index.ts` (Diff)

The `TokenAccount` interface was updated to reflect the new data points:

```typescript
// ... (omitted existing code)

/**
 * Token account information with burn eligibility
 */
export interface TokenAccount {
  pubkey: string;
  mint: string;
  balance: string;
  decimals: number; // Added for clarity in /assets response
  burnEligible: boolean;
  estimatedRent: number; // in GOR
  authComment?: string; // Added for debugging/clarity of eligibility
}

// ... (omitted existing code)
```
