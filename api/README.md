# Gor-Incinerator API

[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

> Cloudflare Workers backend for the GOR Token Incinerator. Burn empty token accounts and reclaim rent on the Gorbagana blockchain.

---

## Table of Contents

- [Features](#features)
- [API Endpoints](#api-endpoints)
  - [GET /assets/:wallet](#1-get-assetswallet)
  - [POST /build-burn-tx](#2-post-build-burn-tx)
  - [GET /reconciliation/report](#3-get-reconciliationreport)
- [Development Setup](#development-setup)
- [Reconciliation](#reconciliation)
- [Security](#security)
- [Fee Structure](#fee-structure)
- [Testing](#testing)
- [Documentation](#documentation)
- [License](#license)

---

## Features

| Feature | Description |
|---------|-------------|
| **Protected API Endpoints** | API key authentication via `x-api-key` header |
| **Burn-Eligible Detection** | Automatic filtering of empty token accounts |
| **Rent Reclamation** | Recover rent from unused token accounts |
| **Transaction Logging** | Complete audit trail in Cloudflare D1 database |
| **Global Edge Deployment** | Low-latency responses from 270+ locations |

---

## API Endpoints

**Base URL:** `https://api.gor-incinerator.com`

### 1. GET /assets/:wallet

Returns all burn-eligible token accounts for a wallet.

| Parameter | Type | Description |
|-----------|------|-------------|
| `wallet` | path | Wallet public key to query |

**Authentication:** Required (`x-api-key` header)

<details>
<summary>Request Example</summary>

```bash
curl -X GET "https://api.gor-incinerator.com/assets/ABC123..." \
  -H "x-api-key: your_api_key"
```

</details>

<details>
<summary>Response Example</summary>

```json
{
  "wallet": "ABC123...",
  "accounts": [
    {
      "pubkey": "DEF456...",
      "mint": "GHI789...",
      "balance": "0",
      "burnEligible": true,
      "estimatedRent": 0.00203928
    }
  ],
  "summary": {
    "totalAccounts": 15,
    "burnEligible": 15,
    "totalRent": 0.03058920,
    "serviceFee": 0.00152946,
    "youReceive": 0.02905974
  }
}
```

</details>

---

### 2. POST /build-burn-tx

Builds an unsigned burn transaction.

| Field | Type | Description |
|-------|------|-------------|
| `wallet` | string | User's wallet public key |
| `accounts` | string[] | Array of token account pubkeys to close |
| `maxAccounts` | number | Max accounts per transaction (default: 14) |

**Authentication:** Required (`x-api-key` header)

<details>
<summary>Request Example</summary>

```bash
curl -X POST "https://api.gor-incinerator.com/build-burn-tx" \
  -H "x-api-key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "wallet": "ABC123...",
    "accounts": ["DEF456...", "GHI789..."],
    "maxAccounts": 14
  }'
```

</details>

<details>
<summary>Response Example</summary>

```json
{
  "transaction": "base64_encoded_transaction",
  "accountsToClose": 14,
  "totalRent": 0.02854992,
  "serviceFee": 0.00142750,
  "youReceive": 0.02712242,
  "blockhash": "ABC123...",
  "requiresSignatures": ["ABC123..."]
}
```

</details>

#### Transaction Flow

```
1. Wallet calls /build-burn-tx with selected accounts
              |
              v
2. API returns unsigned transaction
              |
              v
3. Wallet signs transaction with user's private key
              |
              v
4. Wallet broadcasts transaction to Gorbagana blockchain
              |
              v
5. Transaction executes atomically:
   - Closes empty token accounts
   - Collects service fee
   - Returns remaining rent to user
```

---

### 3. GET /reconciliation/report

Generates reconciliation report for date range.

| Parameter | Type | Description |
|-----------|------|-------------|
| `start` | query | Start date (YYYY-MM-DD) |
| `end` | query | End date (YYYY-MM-DD) |

**Authentication:** Required (`x-api-key` header with admin privileges)

<details>
<summary>Request Example</summary>

```bash
curl -X GET "https://api.gor-incinerator.com/reconciliation/report?start=2025-01-01&end=2025-01-31" \
  -H "x-api-key: your_admin_api_key"
```

</details>

<details>
<summary>Response Example</summary>

```json
{
  "period": {
    "start": "2025-01-01",
    "end": "2025-01-31"
  },
  "summary": {
    "totalTransactions": 1250,
    "totalAccountsClosed": 15000,
    "totalRent": 30.5892,
    "totalFees": 1.52946
  },
  "transactions": [...]
}
```

</details>

---

## Development Setup

### Prerequisites

- Node.js 18+
- Wrangler CLI (`npm install -g wrangler`)
- Cloudflare account

### Installation

```bash
cd api
npm install
```

### Local Development

```bash
# Run local dev server
npm run dev

# Test endpoint
curl http://localhost:8787/health
```

### Environment Variables

Set secrets via Wrangler CLI:

```bash
# API key for authentication
wrangler secret put API_KEY

# Admin API key for reconciliation
wrangler secret put ADMIN_API_KEY

# Gorbagana RPC URL
wrangler secret put GOR_RPC_URL

# Fee recipient vault address
wrangler secret put GOR_VAULT_ADDRESS
```

### Database Setup

```bash
# Create database
wrangler d1 create gor-incinerator-logs

# Copy database_id to wrangler.toml

# Apply migrations
wrangler d1 execute gor-incinerator-logs --file=./migrations/0001_initial_schema.sql
```

### Deployment

```bash
# Deploy to production
npm run deploy

# View logs
npm run tail
```

---

## Reconciliation

### Using Bash Script

```bash
cd scripts

export ADMIN_API_KEY=your_admin_api_key

# Generate report for current month
./reconciliation.sh

# Generate report for specific date range
./reconciliation.sh 2025-01-01 2025-01-31
```

### Using Python Script

```bash
cd scripts

export ADMIN_API_KEY=your_admin_api_key

pip3 install requests

# Generate report for current month
python3 reconciliation.py

# Generate report for specific date range
python3 reconciliation.py 2025-01-01 2025-01-31
```

**Output formats:**
- Console summary with statistics
- JSON file with full transaction details
- CSV export for spreadsheet analysis

---

## Security

| Feature | Description |
|---------|-------------|
| **API Key Authentication** | All endpoints require valid API key |
| **No Private Keys** | Backend never handles user private keys |
| **Secrets Management** | All sensitive data stored in Cloudflare Secrets |
| **CORS Protection** | Configurable origin restrictions |
| **Rate Limiting** | Built-in DDoS protection via Cloudflare |

---

## Fee Structure

| Component | Percentage |
|-----------|------------|
| Service Fee | 5% |
| **User Receives** | **95%** |

**Example Calculation:**

```
14 accounts closed = 0.02854992 GOR reclaimed
â”œâ”€â”€ Service fee    = 0.00142750 GOR (5%)
â””â”€â”€ User receives  = 0.02712242 GOR (95%)
```

---

## Testing

### Test GET /assets/:wallet

```bash
curl -X GET "https://api.gor-incinerator.com/assets/YOUR_WALLET_ADDRESS" \
  -H "x-api-key: YOUR_API_KEY"
```

### Test POST /build-burn-tx

```bash
curl -X POST "https://api.gor-incinerator.com/build-burn-tx" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "wallet": "YOUR_WALLET_ADDRESS",
    "accounts": ["ACCOUNT_1", "ACCOUNT_2"],
    "maxAccounts": 14
  }'
```

### Test Reconciliation

```bash
curl -X GET "https://api.gor-incinerator.com/reconciliation/report?start=2025-01-01&end=2025-01-31" \
  -H "x-api-key: YOUR_ADMIN_API_KEY"
```

---

## Documentation

| Resource | Link |
|----------|------|
| Cloudflare Workers | [developers.cloudflare.com/workers](https://developers.cloudflare.com/workers/) |
| Cloudflare D1 | [developers.cloudflare.com/d1](https://developers.cloudflare.com/d1/) |
| Solana Web3.js | [solana-labs.github.io/solana-web3.js](https://solana-labs.github.io/solana-web3.js/) |
| Gorbagana Blockchain | [gorbagana.com](https://gorbagana.com) |

---

## License

This project is licensed under the [ISC License](LICENSE).

---

<p align="center">
  <a href="https://api.gor-incinerator.com"><strong>API</strong></a> &bull;
  <a href="https://gor-incinerator.com"><strong>Frontend</strong></a> &bull;
  <a href="https://github.com/DOGECOIN87/gor-incinerator"><strong>GitHub</strong></a>
</p>
