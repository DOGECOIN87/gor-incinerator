# Phase 1 — Codebase Analysis: Gor-Incinerator

This analysis fulfills the requirements of Phase 1: Codebase Analysis, providing an architecture map and flow descriptions without modifying any code.

## 1. Architecture Map

The Gor-Incinerator project is structured as a full-stack application, with a clear separation between the frontend and the API backend, which is designed to run as a Cloudflare Worker.

| Component | Location | Technology | Role |
| :--- | :--- | :--- | :--- |
| **API Backend** | `api/` | Hono, TypeScript, Cloudflare Workers | Handles all core logic, including API key authentication, Solana RPC interaction, transaction building, and database logging. |
| **Frontend** | `frontend/` | React, TypeScript, TailwindCSS | User interface for wallet connection and interaction with the API. |
| **Blockchain Service** | `api/src/services/blockchainService.ts` | `@solana/web3.js` | Contains logic for connecting to the Gorbagana RPC, fetching token accounts, and determining burn eligibility. |
| **Fee Service** | `api/src/services/feeService.ts` | TypeScript | Calculates service fees and rent. |
| **Database** | N/A (Bound to Worker) | Cloudflare D1 (SQL) | Used for logging transaction details for reconciliation and reporting. |
| **Authentication** | `api/src/index.ts` | Hono Middleware | Placeholder logic for API key and Admin API key authentication. |

The flow is as follows: The **Frontend** makes requests to the **API Backend** (Cloudflare Worker). The Worker uses the **Blockchain Service** to interact with the Solana network and the **Database** to log transaction data.

## 2. Current Burn Flow (Placeholder)

The current implementation of the burn process is a **mock** and does not perform any on-chain burning or closing of accounts. The logic is split between `api/src/services/blockchainService.ts` and the `/build-burn-tx` handler in `api/src/index.ts`.

*   **Eligibility Determination (`blockchainService.ts`):**
    *   An account is considered **burn-eligible** if:
        1.  The token balance is exactly `"0"`.
        2.  The token's mint address is **not** included in the `TOKEN_BLACKLIST`.
    *   The current logic only supports closing zero-balance accounts. It does not check for mint/burn authority.

*   **Transaction Building (`api/src/index.ts` - POST /build-burn-tx):**
    *   The handler receives a list of accounts to "burn" (close).
    *   It calculates mock rent and a 5% service fee based on the number of accounts.
    *   It logs the transaction details (wallet, fees, accounts closed) to the D1 database with a `pending` status.
    *   It returns a **mock** base64-encoded transaction string, which is not a real Solana transaction.
    *   **Crucially, no actual on-chain instructions (BurnChecked, CloseAccount, Transfer) are generated.**

## 3. Current API Flow

The API is built using the Hono framework and is exposed as a Cloudflare Worker.

| Endpoint | Method | Authentication | Description |
| :--- | :--- | :--- | :--- |
| `/` | `GET` | None | Health check. Returns "Gor-Incinerator API Worker is running!". |
| `/assets/:wallet` | `GET` | `apiKeyAuth` | Fetches token accounts for a given wallet. Currently returns a **mock** list of two zero-balance accounts and a summary. |
| `/build-burn-tx` | `POST` | `apiKeyAuth` | Builds a transaction to close token accounts. Currently returns a **mock** transaction response after logging to D1. |
| `/reconciliation/report` | `GET` | `adminApiKeyAuth` | Admin route to query and aggregate transaction logs from the D1 database for a given date range. |

**API Key Authentication Flow (from `api/src/index.ts`):**

1.  The middleware (`apiKeyAuth` or `adminApiKeyAuth`) intercepts the request.
2.  It reads the API key from the `x-api-key` request header.
3.  **For `apiKeyAuth`**: It compares the header value against the hardcoded placeholder string `'GORBAG_WALLET_API_KEY_PLACEHOLDER'`.
4.  **For `adminApiKeyAuth`**: It compares the header value against the `env.ADMIN_API_KEY` binding.
5.  If the keys do not match (or are missing), a `401 Unauthorized` JSON error is returned.
6.  The user's requirement to use `env.API_KEY` for the regular API key is **not** currently implemented in `api/src/index.ts`. This will be addressed in Phase 4.
