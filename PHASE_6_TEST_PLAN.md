# Phase 6 — Testing & Verification

This phase delivers the required unit tests and the End-to-End Integration Test Plan.

## A. Unit Tests

Unit tests have been created for the core logic components:

1.  **Burn Eligibility Logic**: Tests the `enrichTokenAccounts` function in `api/src/services/blockchainService.ts` to ensure the new rules (zero balance OR wallet is mint authority, AND not blacklisted) are correctly applied.
    *   **File**: `api/src/services/blockchainService.test.ts`
2.  **Transaction Assembly**: Tests the `buildBurnTransaction` function in `api/src/services/transactionBuilder.ts` to verify the correct sequence of instructions (BurnChecked, CloseAccount, Fee Transfers) and the validation logic.
    *   **File**: `api/src/services/transactionBuilder.test.ts`

## B. End-to-End Integration Test Plan

The following manual test plan is designed to verify the full functionality of the deployed Cloudflare Worker and its interaction with the Gorbagana RPC.

| Step | Description | Expected Outcome | Verification |
| :--- | :--- | :--- | :--- |
| **1. Setup** | Deploy the Cloudflare Worker with the updated code and ensure all secrets (`API_KEY`, `ADMIN_API_KEY`, `GOR_RPC_URL`, `GOR_VAULT_ADDRESS_AETHER`, `GOR_VAULT_ADDRESS_INCINERATOR`) are set. | Worker is live and accessible. | Worker URL returns "Gor-Incinerator API Worker is running!". |
| **2. Validator/Devnet Setup** | Set up a local validator or connect to a devnet/testnet environment. Fund a test wallet (Wallet A) with GOR. | Wallet A has a positive GOR balance. | Check Wallet A balance via RPC. |
| **3. Token Creation** | Create two new SPL tokens (Token X and Token Y). | Two new mint accounts exist. | Check mint accounts via RPC. |
| **4. Account Setup** | **Case 1 (Close-Only):** Create Token X account for Wallet A, transfer all tokens out, leaving a **zero balance**. **Case 2 (Burnable):** Create Token Y account for Wallet A, transfer tokens to it, and ensure **Wallet A is set as the Mint Authority** for Token Y. **Case 3 (Non-Burnable):** Create a Token Z account (or use a blacklisted token) with a **non-zero balance** where Wallet A is **NOT** the Mint Authority. | Three token accounts exist with the specified states. | Check token account balances and mint authorities via RPC. |
| **5. Test `GET /assets`** | Call `GET /assets/{Wallet A Pubkey}` with the correct `x-api-key`. | Response contains all three accounts. **Account X** has `burnEligible: true` and `authComment: "Zero balance, allowing close."`. **Account Y** has `burnEligible: true` and `authComment: "Wallet is Mint Authority, allowing burn of non-zero balance."`. **Account Z** has `burnEligible: false` and `authComment` indicating non-authority or blacklist. Summary fields are correct. | Verify JSON response against expected values. |
| **6. Test `POST /build-burn-tx` (Success)** | Call `POST /build-burn-tx` with a list containing **Account X** and **Account Y** pubkeys. | Returns a base64-encoded `transaction` and correct fee breakdown. | Verify `accountsToClose` is 2. Verify `totalRent`, `serviceFee`, and `feeBreakdown` are calculated correctly based on 2 accounts. |
| **7. Test `POST /build-burn-tx` (Failure)** | Call `POST /build-burn-tx` with a list containing **Account Z** pubkey. | Returns a `400 Bad Request` with a `ValidationError` message indicating the wallet is not the mint authority. | Verify HTTP status code and error message. |
| **8. Transaction Execution** | Use a Solana SDK to deserialize the transaction from Step 6, sign it with Wallet A, and submit it to the RPC. | Transaction is confirmed on-chain. | Check transaction status via RPC. |
| **9. Verification** | **a.** Check Wallet A's GOR balance. **b.** Check the status of Account X and Account Y. **c.** Check the supply of Token Y. **d.** Check the balances of the Aether and Incinerator Vaults. | **a.** Wallet A's GOR balance increased by `youReceive` amount. **b.** Account X and Account Y are closed (no longer exist). **c.** Token Y's total supply is reduced by the burned amount. **d.** Vault balances increased by their respective fee shares. | Check RPC data for all four points. |
| **10. D1 Verification** | Query the D1 database (e.g., via the `/reconciliation/report` admin endpoint) for the transaction log. | A new record exists for the transaction with the correct `accounts_closed`, `total_rent`, and fee amounts. | Verify D1 log entry. |
