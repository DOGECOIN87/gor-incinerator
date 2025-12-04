# Gor-Incinerator API Documentation

**Version:** 1.0.0
**Base URL:** `https://api.gor-incinerator.fun` (production)
**Protocol:** HTTPS
**Authentication:** API Key via `x-api-key` header

## Overview

The Gor-Incinerator API provides protected endpoints for the Gorbag Wallet integration, enabling users to:

- Scan wallets for burn-eligible token accounts
- Build unsigned burn transactions with automatic fee distribution
- Apply 0% fees for Gorbagio NFT holders
- Generate reconciliation reports for revenue tracking

## Authentication

All API endpoints (except `/health`) require authentication via API key:

```http
x-api-key: your-api-key-here
```

### API Key Types

1. **Regular API Key** - For asset scanning and transaction building
2. **Admin API Key** - For reconciliation reports (higher privilege)

## Endpoints

### 1. Health Check

**GET** `/` or `/health`

Check API service health and version.

**Authentication:** None required

**Response:**

```json
{
  "service": "Gor-Incinerator API",
  "version": "1.0.0",
  "status": "healthy",
  "endpoints": [
    "GET /assets/:wallet",
    "POST /build-burn-tx",
    "GET /reconciliation/report"
  ]
}
```

---

### 2. Get Burn-Eligible Assets

**GET** `/assets/:wallet`

Scan a wallet for burn-eligible token accounts and calculate fees.

**Authentication:** Required (Regular API Key)

**Parameters:**

- `wallet` (path) - Wallet address (base58 encoded)

**Response:**

```json
{
  "wallet": "7kF9X2qW...",
  "accounts": [
    {
      "pubkey": "ABC123...",
      "mint": "DEF456...",
      "balance": "0",
      "burnEligible": true,
      "estimatedRent": 0.00203928
    }
  ],
  "summary": {
    "totalAccounts": 50,
    "burnEligible": 25,
    "totalRent": 0.050982,
    "serviceFee": 0.002549,
    "youReceive": 0.048433,
    "gorbagioHolder": false
  }
}
```

**Response Fields:**

- `gorbagioHolder` - If `true`, user holds a Gorbagio NFT and receives 0% fee discount
- `serviceFee` - 5% for regular users, 0% for Gorbagio holders
- `youReceive` - 95% for regular users, 100% for Gorbagio holders

---

### 3. Build Burn Transaction

**POST** `/build-burn-tx`

Build an unsigned transaction to close token accounts and apply fees.

**Authentication:** Required (Regular API Key)

**Request Body:**

```json
{
  "wallet": "7kF9X2qW...",
  "accounts": [
    "ABC123...",
    "DEF456...",
    "GHI789..."
  ],
  "maxAccounts": 14
}
```

**Request Fields:**

- `wallet` (required) - Wallet address (base58)
- `accounts` (required) - Array of token account addresses to close
- `maxAccounts` (optional) - Maximum accounts per transaction (default: 14, max: 14)

**Response:**

```json
{
  "transaction": "AgAAAA...",
  "accountsToClose": 14,
  "totalRent": 0.028549,
  "serviceFee": 0.001427,
  "feeBreakdown": {
    "aetherLabs": 0.000713,
    "gorIncinerator": 0.000714
  },
  "youReceive": 0.027122,
  "blockhash": "8kMN2vX...",
  "requiresSignatures": ["7kF9X2qW..."],
  "gorbagioHolder": false
}
```

**Response Fields:**

- `transaction` - Base64 encoded serialized transaction (unsigned)
- `gorbagioHolder` - If `true`, `serviceFee` will be 0 and `feeBreakdown` will show 0 for both parties
- `feeBreakdown` - 50/50 split between Aether Labs and Gor-incinerator (0/0 for Gorbagio holders)

**Fee Structure:**

| User Type | Service Fee | User Receives | Aether Labs | Gor-incinerator |
|-----------|-------------|---------------|-------------|-----------------|
| Regular   | 5%          | 95%           | 2.5%        | 2.5%            |
| Gorbagio NFT Holder | 0% | 100%          | 0%          | 0%              |

---

### 4. Reconciliation Report

**GET** `/reconciliation/report?start=YYYY-MM-DD&end=YYYY-MM-DD`

Generate a reconciliation report for a date range (monthly revenue tracking).

**Authentication:** Required (Admin API Key)

**Query Parameters:**

- `start` (required) - Start date (ISO format: YYYY-MM-DD)
- `end` (required) - End date (ISO format: YYYY-MM-DD)

**Response:**

```json
{
  "period": {
    "start": "2025-11-01",
    "end": "2025-11-30"
  },
  "summary": {
    "totalTransactions": 1250,
    "totalAccountsClosed": 15000,
    "totalRent": 30.5893,
    "totalFees": 1.5294,
    "aetherLabsShare": 0.7647,
    "gorIncineratorShare": 0.7647
  },
  "transactions": [
    {
      "id": 1,
      "timestamp": "2025-11-01T12:34:56.789Z",
      "wallet": "7kF9X2qW...",
      "accountsClosed": 14,
      "totalRent": 0.028549,
      "serviceFee": 0.001427,
      "aetherLabsFee": 0.000713,
      "gorIncineratorFee": 0.000714,
      "txHash": "5kD8Y...",
      "status": "confirmed",
      "createdAt": "2025-11-01T12:34:56.789Z"
    }
  ]
}
```

---

## Gorbagio NFT Holder Benefits

### How It Works

1. When a request is made, the API checks if the wallet holds a Gorbagio NFT
2. If yes, the service fee is set to **0%** (normally 5%)
3. User receives **100%** of rent reclaimed (normally 95%)
4. No fee transfers are included in the transaction

### NFT Verification Methods

The API verifies Gorbagio NFTs using multiple methods:

1. **Collection Mint Address** - Checks if NFT belongs to verified collection
2. **Creator Address** - Verifies NFT creator matches Gorbagio creator
3. **Update Authority** - Checks NFT update authority
4. **Verified Mint Whitelist** - Checks against known Gorbagio mint addresses

### Caching

- NFT holder status is cached for 5 minutes per wallet
- Reduces blockchain RPC calls and improves performance
- Cache is automatically invalidated after TTL

---

## Error Responses

### 400 Bad Request

```json
{
  "error": "Validation Error",
  "message": "Invalid wallet address format",
  "status": 400
}
```

### 401 Unauthorized

```json
{
  "error": "Authentication Failed",
  "message": "Missing API key. Include x-api-key header.",
  "status": 401
}
```

### 404 Not Found

```json
{
  "error": "Not Found",
  "message": "Endpoint not found: GET /invalid",
  "status": 404
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal Server Error",
  "message": "Failed to connect to RPC",
  "status": 500
}
```

---

## Rate Limits

- **100 requests per minute** per API key
- Requests exceeding the limit will receive `429 Too Many Requests`

---

## CORS

The API supports CORS for browser-based requests:

- **Allowed Origins:** `https://gorbag.wallet`, `https://gor-incinerator.fun`
- **Allowed Methods:** `GET`, `POST`, `OPTIONS`
- **Allowed Headers:** `Content-Type`, `x-api-key`

---

## Example: Complete Burn Flow

### Step 1: Scan for burn-eligible accounts

```bash
curl -X GET "https://api.gor-incinerator.fun/assets/7kF9X2qW..." \
  -H "x-api-key: your-api-key"
```

**Response shows Gorbagio holder:**

```json
{
  "summary": {
    "burnEligible": 25,
    "serviceFee": 0,
    "youReceive": 0.050982,
    "gorbagioHolder": true
  }
}
```

### Step 2: Build burn transaction

```bash
curl -X POST "https://api.gor-incinerator.fun/build-burn-tx" \
  -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "wallet": "7kF9X2qW...",
    "accounts": ["ABC123...", "DEF456..."],
    "maxAccounts": 14
  }'
```

**Response includes 0% fee:**

```json
{
  "transaction": "AgAAAA...",
  "serviceFee": 0,
  "youReceive": 0.028549,
  "gorbagioHolder": true
}
```

### Step 3: Sign and submit transaction

1. Deserialize the base64 transaction
2. Sign with user's wallet
3. Submit to Gorbagana RPC
4. User receives 100% of rent (no fees deducted)

---

## Development & Testing

### Local Development

```bash
cd api
npm install
npm run dev
```

### Testing with cURL

```bash
# Test health endpoint
curl https://api.gor-incinerator.fun/health

# Test with API key
curl -H "x-api-key: test-key" \
  https://api.gor-incinerator.fun/assets/WALLET_ADDRESS
```

---

## Deployment

The API is deployed on Cloudflare Workers for:

- **Global edge network** - Low latency worldwide
- **Automatic scaling** - Handles traffic spikes
- **DDoS protection** - Built-in security
- **99.99% uptime SLA**

---

## Support

- **Issues:** Report bugs at the GitHub repository
- **Email:** Contact integration partner (Aether Labs / Gorbag Wallet team)
- **Status:** Check `https://api.gor-incinerator.fun/health`

---

## Changelog

### v1.0.0 (2025-12-04)

- ✅ Initial API release
- ✅ GET /assets/:wallet endpoint
- ✅ POST /build-burn-tx endpoint
- ✅ GET /reconciliation/report endpoint
- ✅ 50/50 revenue split (Aether Labs + Gor-incinerator)
- ✅ Gorbagio NFT holder verification (0% fees)
- ✅ Transaction logging to D1 database
- ✅ API key authentication
- ✅ CORS support for browser requests
- ✅ Comprehensive error handling
