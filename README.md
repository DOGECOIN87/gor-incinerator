# Gor-Incinerator API

The Gor-Incinerator API is a secure Cloudflare Worker designed to facilitate the burning and closing of unneeded Solana Program Library (SPL) token accounts. It provides a robust backend for wallet integration, ensuring real on-chain token burning and secure transaction building.

## 🚀 Final Functionality

This API implements the following core features:

1.  **Real Token Burning**: Supports on-chain burning of non-zero balance token accounts where the wallet holds the Mint Authority.
2.  **Rent Reclamation**: Closes all specified token accounts (zero-balance or burned) to reclaim the locked SOL rent to the user's wallet.
3.  **Secure Fee Collection**: Automatically calculates a 5% service fee on the reclaimed rent, split 50/50 between the Aether Labs and Gor-Incinerator vaults, and includes the transfer instructions in the transaction.
4.  **Burn Eligibility Logic**: Determines if an account is eligible for closing/burning based on balance, blacklist status, and Mint Authority ownership.
5.  **Secure API Access**: All core endpoints are protected by API key authentication using Cloudflare Worker secrets.

## ⚙️ API Endpoints

| Endpoint | Method | Description | Authentication |
| :--- | :--- | :--- | :--- |
| `/assets/:wallet` | `GET` | Fetches all token accounts for a wallet, enriched with burn eligibility status and estimated rent. | `x-api-key` |
| `/build-burn-tx` | `POST` | Builds an unsigned, versioned Solana transaction containing BurnChecked, CloseAccount, and fee transfer instructions. | `x-api-key` |
| `/reconciliation/report` | `GET` | Admin endpoint to query transaction logs from the D1 database for reconciliation. | `x-api-key` (Admin) |

## 🛠️ Deployment

The API is built using Hono and deployed as a Cloudflare Worker.

### 1. Install Dependencies

Navigate to the `api/` directory and install the necessary packages:

```bash
cd api
pnpm install
```

### 2. Configure Environment Secrets

The worker requires several secrets to be set via `wrangler secret put`. **Do not hardcode these values.**

| Secret Name | Description |
| :--- | :--- |
| `API_KEY` | Key for general API access (`/assets`, `/build-burn-tx`). |
| `ADMIN_API_KEY` | Key for administrative access (`/reconciliation/report`). |
| `GOR_RPC_URL` | URL for the Solana RPC endpoint (e.g., Gorbagana RPC). |
| `GOR_VAULT_ADDRESS_AETHER` | Public key for the Aether Labs fee vault. |
| `GOR_VAULT_ADDRESS_INCINERATOR` | Public key for the Gor-Incinerator fee vault. |

**Example Setup (Execute in the `api/` directory):**

```bash
# Example for API_KEY - replace the value with your actual secret
echo "YOUR_SECURE_API_KEY_VALUE" | wrangler secret put API_KEY
```

### 3. Deploy the Worker

Ensure your `wrangler.toml` is configured correctly, then deploy the worker:

```bash
wrangler deploy
```

## 🧪 Testing

Unit tests for the core logic are available in `api/src/services/*.test.ts`. Run them using:

```bash
pnpm test
```
