# Gor-Incinerator - Complete Implementation Guide

**Premium Token Burning Service for Gorbagana Blockchain**

Serverless API backend with Cloudflare Workers + Pages for Gorbag Wallet integration.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Contract Compliance](#contract-compliance)
4. [Quick Start](#quick-start)
5. [Documentation](#documentation)
6. [API Endpoints](#api-endpoints)
7. [Fee Structure](#fee-structure)
8. [Deployment](#deployment)
9. [Testing](#testing)
10. [Reconciliation](#reconciliation)
11. [Support](#support)

---

## 🎯 Overview

Gor-Incinerator provides a **protected API backend** for burning empty token accounts on the Gorbagana blockchain. This implementation fulfills the partnership agreement between **Gor-incinerator** (Matt Aaron) and **Aether Labs** (Gorbag Wallet).

### Key Features

✅ **Protected API Endpoints** - API key authentication for exclusive access  
✅ **Burn-Eligible Detection** - Automatic filtering of empty token accounts  
✅ **50/50 Fee Splitting** - Real-time distribution to both vault addresses  
✅ **Transaction Logging** - Complete audit trail in Cloudflare D1 database  
✅ **Monthly Reconciliation** - Built-in reporting for fee verification  
✅ **Global Edge Deployment** - Low-latency responses from 270+ locations  
✅ **Auto-Scaling** - Handles traffic spikes without manual intervention  
✅ **Zero Server Management** - Fully serverless architecture  

---

## 🏗️ Architecture

### Stack

- **Backend**: Cloudflare Workers (serverless functions)
- **Database**: Cloudflare D1 (SQLite at the edge)
- **Frontend**: Cloudflare Pages (React + Vite)
- **Blockchain**: Gorbagana (Solana fork)

### Components

```
┌─────────────────┐
│  Gorbag Wallet  │ (Aether Labs)
└────────┬────────┘
         │ x-api-key
         ▼
┌─────────────────────────────────┐
│  Cloudflare Workers (API)       │
│  - GET /assets/:wallet          │
│  - POST /build-burn-tx          │
│  - GET /reconciliation/report   │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Cloudflare D1 (Database)       │
│  - Transaction logs             │
│  - Fee tracking                 │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  Cloudflare Pages (Frontend)    │
│  - React SPA                    │
│  - Backpack wallet integration  │
└─────────────────────────────────┘
```

---

## ✅ Contract Compliance

This implementation fulfills **all requirements** from the partnership agreement:

| Requirement | Implementation | Status |
|------------|----------------|--------|
| Protected API endpoints | API key authentication via `x-api-key` header | ✅ |
| GET /assets/:wallet | Returns burn-eligible accounts with flags | ✅ |
| POST /build-burn-tx | Builds unsigned transaction with fee splits | ✅ |
| Gorbagana blockchain only | RPC configured for Gorbagana | ✅ |
| API protection | Exclusive API keys for Aether Labs | ✅ |
| Logging & analytics | Complete transaction tracking in D1 | ✅ |
| 5% service fee | Calculated on total rent reclaimed | ✅ |
| 50/50 fee split | Real-time distribution to both vaults | ✅ |
| Monthly reconciliation | Built-in reporting tools | ✅ |
| Serverless & auto-scaling | Cloudflare Workers infrastructure | ✅ |

---

## 🚀 Quick Start

### For Developers

```bash
# Clone repository
git clone https://github.com/DOGECOIN87/gor-incinerator.git
cd gor-incinerator

# Deploy API backend
cd api
npm install
wrangler login
wrangler deploy

# Deploy frontend
cd ../frontend
npm install
npm run build
# Configure via Cloudflare Pages dashboard
```

### For Gorbag Wallet Integration

```typescript
// 1. Fetch burn-eligible accounts
const response = await fetch(
  `https://api.gor-incinerator.fun/assets/${walletAddress}`,
  { headers: { "x-api-key": API_KEY } }
);
const assets = await response.json();

// 2. Build burn transaction
const txResponse = await fetch(
  "https://api.gor-incinerator.fun/build-burn-tx",
  {
    method: "POST",
    headers: { "x-api-key": API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      wallet: walletAddress,
      accounts: selectedAccounts,
      maxAccounts: 14,
    }),
  }
);
const txData = await txResponse.json();

// 3. Sign and send
const transaction = VersionedTransaction.deserialize(
  Buffer.from(txData.transaction, "base64")
);
const signature = await wallet.signAndSendTransaction(transaction);
```

---

## 📚 Documentation

### Complete Guides

- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Step-by-step deployment instructions
- **[USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md)** - API usage examples in multiple languages
- **[CLOUDFLARE_IMPLEMENTATION.md](./CLOUDFLARE_IMPLEMENTATION.md)** - Architecture design document
- **[api/README.md](./api/README.md)** - API backend documentation
- **[frontend/README_API_MODE.md](./frontend/README_API_MODE.md)** - Frontend integration guide

### Quick Links

- [API Endpoints](#api-endpoints)
- [Fee Structure](#fee-structure)
- [Reconciliation](#reconciliation)
- [Testing](#testing)

---

## 🔌 API Endpoints

### 1. GET /assets/:wallet

Returns all burn-eligible token accounts for a wallet.

**Authentication**: Required (`x-api-key` header)

**Example**:
```bash
curl -X GET "https://api.gor-incinerator.fun/assets/YOUR_WALLET" \
  -H "x-api-key: YOUR_API_KEY"
```

**Response**:
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

### 2. POST /build-burn-tx

Builds an unsigned burn transaction with 50/50 fee split.

**Authentication**: Required (`x-api-key` header)

**Request**:
```json
{
  "wallet": "ABC123...",
  "accounts": ["DEF456...", "GHI789..."],
  "maxAccounts": 14
}
```

**Response**:
```json
{
  "transaction": "base64_encoded_transaction",
  "accountsToClose": 14,
  "totalRent": 0.02854992,
  "serviceFee": 0.00142750,
  "feeBreakdown": {
    "aetherLabs": 0.00071375,
    "gorIncinerator": 0.00071375
  },
  "youReceive": 0.02712242,
  "blockhash": "ABC123...",
  "requiresSignatures": ["ABC123..."]
}
```

### 3. GET /reconciliation/report

Generates reconciliation report for date range.

**Authentication**: Required (admin `x-api-key` header)

**Example**:
```bash
curl -X GET "https://api.gor-incinerator.fun/reconciliation/report?start=2025-01-01&end=2025-01-31" \
  -H "x-api-key: YOUR_ADMIN_API_KEY"
```

**Response**:
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
    "totalFees": 1.52946,
    "aetherLabsShare": 0.76473,
    "gorIncineratorShare": 0.76473
  },
  "transactions": [...]
}
```

---

## 💰 Fee Structure

### Calculation

- **Rent per account**: ~0.00203928 GOR (Gorbagana standard)
- **Service fee**: 5% of total rent reclaimed
- **Fee split**: 50/50 between Aether Labs and Gor-incinerator

### Example

**Scenario**: User burns 14 empty token accounts

```
Total rent reclaimed:  14 × 0.00203928 = 0.02854992 GOR

Service fee (5%):      0.02854992 × 0.05 = 0.00142750 GOR
  ├─ Aether Labs (2.5%):     0.00071375 GOR
  └─ Gor-incinerator (2.5%): 0.00071375 GOR

User receives (95%):   0.02854992 - 0.00142750 = 0.02712242 GOR
```

### Transaction Flow

1. User selects accounts to burn
2. API builds transaction with:
   - Close account instructions (14 max)
   - Transfer 2.5% to Aether Labs vault
   - Transfer 2.5% to Gor-incinerator vault
3. User signs transaction in wallet
4. Transaction executes atomically on-chain
5. User receives 95% of rent back

---

## 🚀 Deployment

### Prerequisites

- Node.js 18+
- Cloudflare account (free tier works)
- Wrangler CLI installed
- Gorbagana vault addresses

### Backend Deployment

```bash
cd api

# Install dependencies
npm install

# Login to Cloudflare
wrangler login

# Create D1 database
wrangler d1 create gor-incinerator-logs
# Copy database_id to wrangler.toml

# Apply migrations
wrangler d1 execute gor-incinerator-logs --file=./migrations/0001_initial_schema.sql

# Set secrets
wrangler secret put API_KEY
wrangler secret put ADMIN_API_KEY
wrangler secret put GOR_RPC_URL
wrangler secret put GOR_VAULT_ADDRESS_AETHER
wrangler secret put GOR_VAULT_ADDRESS_INCINERATOR

# Deploy
wrangler deploy
```

### Frontend Deployment

1. Go to [Cloudflare Pages](https://dash.cloudflare.com/?to=/:account/pages)
2. Click **Create a project** → **Connect to Git**
3. Select `DOGECOIN87/gor-incinerator` repository
4. Configure:
   - **Root directory**: `frontend`
   - **Build command**: `npm run build`
   - **Build output**: `dist`
5. Set environment variables:
   - `VITE_API_BASE_URL=https://api.gor-incinerator.fun`
   - `VITE_API_KEY=<api_key>`
6. Click **Save and Deploy**

**See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.**

---

## 🧪 Testing

### Test API Endpoints

```bash
# Health check
curl https://api.gor-incinerator.fun/health

# Test assets endpoint
curl -X GET "https://api.gor-incinerator.fun/assets/YOUR_WALLET" \
  -H "x-api-key: YOUR_API_KEY"

# Test build transaction
curl -X POST "https://api.gor-incinerator.fun/build-burn-tx" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "wallet": "YOUR_WALLET",
    "accounts": ["ACCOUNT_1", "ACCOUNT_2"],
    "maxAccounts": 14
  }'

# Test reconciliation (admin)
curl -X GET "https://api.gor-incinerator.fun/reconciliation/report?start=2025-01-01&end=2025-01-31" \
  -H "x-api-key: YOUR_ADMIN_API_KEY"
```

### Test Frontend

1. Visit `https://gor-incinerator.fun`
2. Connect Backpack wallet
3. Scan for empty accounts
4. Click **Burn X Accounts**
5. Sign transaction
6. Verify on Gorbagana explorer

---

## 📊 Reconciliation

### Monthly Reconciliation Process

Between the 27th and last day of each month, both parties conduct reconciliation:

#### Using Bash Script

```bash
cd api/scripts
export ADMIN_API_KEY=your_admin_api_key
./reconciliation.sh 2025-01-01 2025-01-31
```

#### Using Python Script

```bash
cd api/scripts
export ADMIN_API_KEY=your_admin_api_key
python3 reconciliation.py 2025-01-01 2025-01-31
```

#### Output

```
=== Reconciliation Report ===
Period: 2025-01-01 to 2025-01-31

Summary Statistics:
  Total Transactions: 1250
  Total Accounts Closed: 15000
  Total Rent: 30.5892 GOR
  Total Fees: 1.52946 GOR

Fee Split (50/50):
  Aether Labs: 0.76473 GOR
  Gor-incinerator: 0.76473 GOR

Full report saved to: reconciliation_2025-01-01_to_2025-01-31.json
CSV export saved to: reconciliation_2025-01-01_to_2025-01-31.csv
```

### Verification

1. Compare transaction counts
2. Verify fee amounts match on-chain transfers
3. Confirm each party received correct share
4. Resolve discrepancies within 5 business days (per contract)

---

## 🤝 Support

### For Aether Labs (Gorbag Wallet)

**API Credentials**:
- API Base URL: `https://api.gor-incinerator.fun`
- API Key: (provided separately)

**Documentation**:
- [API README](./api/README.md)
- [Usage Examples](./USAGE_EXAMPLES.md)
- [Frontend Integration](./frontend/README_API_MODE.md)

**Contact**: @mattrickbeats via X.com

### For Users

- **Website**: https://gor-incinerator.fun
- **GitHub**: https://github.com/DOGECOIN87/gor-incinerator
- **Support**: @mattrickbeats via X.com

### For Developers

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [Solana Web3.js Docs](https://solana-labs.github.io/solana-web3.js/)

---

## 📄 License

ISC License

---

## 🎉 Acknowledgments

- **Aether Labs** - Partnership and Gorbag Wallet integration
- **Gorbagana** - High-performance blockchain infrastructure
- **Cloudflare** - Global edge computing platform

---

**Gor-Incinerator** - Professional token burning service for Gorbagana network users.

Built with ❤️ by Matt Aaron
