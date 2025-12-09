# Phase 2 — Implement Real Burn + Close Logic

This phase involved creating the core logic for building the Solana transaction that performs the token burning and account closing. The logic is encapsulated in a new service file, `api/src/services/transactionBuilder.ts`, and supporting functions were added to `api/src/services/blockchainService.ts`.

The implementation strictly follows the user's requirements:

1.  **Token Account Processing**: For each account, it fetches the token amount, decimals, and mint authority.
2.  **Burn Logic**: If the balance is greater than 0, it checks if the wallet is the mint authority. If authorized, it inserts an SPL `BurnChecked` instruction. If not authorized, it throws a `ValidationError`, preventing the transaction from being built.
3.  **Close Logic**: An SPL `CloseAccountInstruction` is **always** appended for the account, ensuring the rent is reclaimed to the payer's wallet.
4.  **Instruction Order**: The final transaction instructions are ordered as: `BurnChecked` (optional) -> `CloseAccount` -> `SystemProgram.transfer` (Service fee transfers).

## Updated Code: `api/src/services/transactionBuilder.ts` (Full Code)

```typescript
/**
 * Transaction Builder Service
 * Contains the core logic for building the burn and close transaction.
 */

import {
  Connection,
  PublicKey,
  TransactionInstruction,
  VersionedTransaction,
  TransactionMessage,
  Blockhash,
  SystemProgram,
} from "@solana/web3.js";
import {
  createCloseAccountInstruction,
  createBurnCheckedInstruction,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  BuildBurnTxRequest,
  BuildBurnTxResponse,
  BlockchainError,
  ValidationError,
  Env,
} from "../types";
import { createFeeInstructions, calculateFee, lamportsToGor } from "./feeService";
import { getMintAuthority, getAccountInfo } from "./blockchainService";

// Max number of instructions in a single transaction (Solana limit is around 1232 bytes, 
// but for simplicity and safety with multiple BurnChecked/CloseAccount, we stick to a lower limit)
const MAX_ACCOUNTS_PER_TX = 14;

/**
 * Builds a VersionedTransaction with BurnChecked, CloseAccount, and Fee Transfer instructions.
 * @param connection - RPC connection
 * @param env - Environment bindings for vault addresses
 * @param request - Request body with wallet and accounts to process
 * @returns Base64 encoded VersionedTransaction
 */
export async function buildBurnTransaction(
  connection: Connection,
  env: Env,
  request: BuildBurnTxRequest
): Promise<BuildBurnTxResponse> {
  const { wallet, accounts: accountPubkeys } = request;
  const payer = new PublicKey(wallet);

  if (accountPubkeys.length === 0) {
    throw new ValidationError("No accounts provided to close.");
  }

  if (accountPubkeys.length > MAX_ACCOUNTS_PER_TX) {
    throw new ValidationError(
      `Cannot process more than ${MAX_ACCOUNTS_PER_TX} accounts per transaction.`
    );
  }

  const instructions: TransactionInstruction[] = [];
  const accountsToClose: string[] = [];
  let totalBurned = 0;

  // 1. Process each token account
  for (const accountPubkeyStr of accountPubkeys) {
    const accountPubkey = new PublicKey(accountPubkeyStr);
    const accountInfo = await getAccountInfo(connection, accountPubkey);

    if (!accountInfo) {
      throw new BlockchainError(`Token account not found: ${accountPubkeyStr}`);
    }

    const { mint, owner, amount, decimals } = accountInfo;
    const mintPubkey = new PublicKey(mint);
    const accountOwner = new PublicKey(owner);

    // Validate that the account belongs to the wallet
    if (accountOwner.toBase58() !== wallet) {
        // This should ideally be caught by the caller, but is a good safety check
        throw new ValidationError(`Account ${accountPubkeyStr} does not belong to wallet ${wallet}.`);
    }

    // Check if the account has a balance
    if (amount > 0) {
      // Check mint authority for burn permission
      const mintAuthority = await getMintAuthority(connection, mintPubkey);
      const isBurnAuthorized = mintAuthority && mintAuthority.toBase58() === wallet;

      if (isBurnAuthorized) {
        // 1. Insert SPL BurnChecked instruction
        // NOTE: The payer (wallet) is used as the authority for the burn instruction.
        // This assumes the wallet is the current owner of the token account AND the mint authority.
        instructions.push(
          createBurnCheckedInstruction(
            accountPubkey, // token account
            mintPubkey, // mint
            payer, // owner/authority
            amount, // amount to burn
            decimals, // decimals
            TOKEN_PROGRAM_ID // program id
          )
        );
        totalBurned += amount;
      } else {
        // Exclude from burn/close and return a validation error
        throw new ValidationError(
          `Token account ${accountPubkeyStr} has a balance (${amount}) but wallet is not the mint authority to burn it.`
        );
      }
    }

    // 2. ALWAYS append CloseAccountInstruction AFTER burning (if burn occurred) or if balance was 0
    instructions.push(
      createCloseAccountInstruction(
        accountPubkey, // token account to close
        payer, // destination (where rent goes)
        payer, // owner/authority
        [], // signer seeds
        TOKEN_PROGRAM_ID // program id
      )
    );
    accountsToClose.push(accountPubkeyStr);
  }

  // 3. Get recent blockhash
  const { blockhash } = await connection.getLatestBlockhash();

  // 4. Compute service fee and create fee transfer instructions
  const feeCalc = calculateFee(accountsToClose.length);
  const feeInstructions = createFeeInstructions(
    accountsToClose.length,
    payer,
    env.GOR_VAULT_ADDRESS_AETHER,
    env.GOR_VAULT_ADDRESS_INCINERATOR
  );

  // 5. Assemble all instructions in the required order
  // The required order is: BurnChecked (optional) -> CloseAccount -> Service fee transfers
  const finalInstructions = [...instructions, ...feeInstructions];

  // 6. Build VersionedTransaction
  const messageV0 = new TransactionMessage({
    payerKey: payer,
    recentBlockhash: blockhash,
    instructions: finalInstructions,
  }).compileToV0Message();

  const transaction = new VersionedTransaction(messageV0);

  // 7. Serialize to base64 and return response
  const serializedTx = transaction.serialize().toString("base64");

  return {
    transaction: serializedTx,
    accountsToClose: accountsToClose.length,
    totalRent: lamportsToGor(feeCalc.totalRent),
    serviceFee: lamportsToGor(feeCalc.serviceFee),
    feeBreakdown: {
      aetherLabs: lamportsToGor(feeCalc.aetherLabsFee),
      gorIncinerator: lamportsToGor(feeCalc.gorIncineratorFee),
    },
    youReceive: lamportsToGor(feeCalc.netAmount),
    blockhash: blockhash,
    requiresSignatures: [wallet],
  };
}
```

## Supporting Code: `api/src/services/blockchainService.ts` (Diff)

The following functions were added to `blockchainService.ts` to support the transaction builder:

```typescript
// ... (omitted existing code)

/**
 * Interface for simplified token account info
 */
export interface SimpleTokenAccountInfo {
  mint: string;
  owner: string;
  amount: number;
  decimals: number;
}

// ... (omitted existing code)

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
      // ... (error handling)
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
    // ... (error handling)
  }
}
```
