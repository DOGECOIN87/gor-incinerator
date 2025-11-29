## Gor-Incinerator API

Cloudflare Workers backend for Gorbag Wallet integration. Provides protected API endpoints for token burning with automatic 50/50 fee splitting between Aether Labs and Gor-incinerator.

## 🚀 Features

- **Protected API Endpoints** - API key authentication via `x-api-key` header
- **Burn-Eligible Account Detection** - Automatic filtering of empty token accounts
- **50/50 Fee Splitting** - Real-time fee distribution to both vault addresses
- **Transaction Logging** - Complete audit trail in Cloudflare D1 database
- **Monthly Reconciliation** - Built-in reporting for fee verification
- **Global Edge Deployment** - Low-latency responses from 270+ locations

## 📋 API Endpoints

### 1. GET /assets/:wallet

Returns all burn-eligible token accounts for a wallet.

**Authentication**: Required (`x-api-key` header)

**Request**:
```bash
curl -X GET "https://api.gor-incinerator.fun/assets/ABC123..." \
  -H "x-api-key: your_api_key"
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

Builds an unsigned burn transaction with fee splits.

**Authentication**: Required (`x-api-key` header)

**Request**:
```bash
curl -X POST "https://api.gor-incinerator.fun/build-burn-tx" \
  -H "x-api-key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "wallet": "ABC123...",
    "accounts": ["DEF456...", "GHI789..."],
    "maxAccounts": 14
  }'
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

**Transaction Flow**:
1. Wallet calls `/build-burn-tx` with selected accounts
2. API returns unsigned transaction with fee splits
3. Wallet signs transaction with user's private key
4. Wallet broadcasts transaction to Gorbagana blockchain
5. Transaction executes atomically:
   - Closes empty token accounts
   - Transfers 2.5% fee to Aether Labs vault
   - Transfers 2.5% fee to Gor-incinerator vault
   - Returns 95% rent to user

### 3. GET /reconciliation/report

Generates reconciliation report for date range.

**Authentication**: Required (`x-api-key` header with admin privileges)

**Request**:
```bash
curl -X GET "https://api.gor-incinerator.fun/reconciliation/report?start=2025-01-01&end=2025-01-31" \
  -H "x-api-key: your_admin_api_key"
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

## 🔧 Development Setup

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
# API key for Gorbag Wallet
wrangler secret put API_KEY

# Admin API key for reconciliation
wrangler secret put ADMIN_API_KEY

# Gorbagana RPC URL
wrangler secret put GOR_RPC_URL

# Vault addresses (50/50 split)
wrangler secret put GOR_VAULT_ADDRESS_AETHER
wrangler secret put GOR_VAULT_ADDRESS_INCINERATOR
```

### Database Setup

Create D1 database:

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

## 📊 Reconciliation

### Using Bash Script

```bash
cd scripts

# Set admin API key
export ADMIN_API_KEY=your_admin_api_key

# Generate report for current month
./reconciliation.sh

# Generate report for specific date range
./reconciliation.sh 2025-01-01 2025-01-31
```

### Using Python Script

```bash
cd scripts

# Set admin API key
export ADMIN_API_KEY=your_admin_api_key

# Install dependencies
pip3 install requests

# Generate report for current month
python3 reconciliation.py

# Generate report for specific date range
python3 reconciliation.py 2025-01-01 2025-01-31
```

Both scripts generate:
- Console summary with statistics
- JSON file with full transaction details
- CSV export for spreadsheet analysis

## 🔒 Security

- **API Key Authentication** - All endpoints require valid API key
- **No Private Keys** - Backend never handles user private keys
- **Secrets Management** - All sensitive data stored in Cloudflare Secrets
- **CORS Protection** - Configurable origin restrictions
- **Rate Limiting** - Built-in DDoS protection via Cloudflare

## 📝 Fee Structure

- **Total Service Fee**: 5% of reclaimed rent
- **Aether Labs Share**: 2.5% (50% of service fee)
- **Gor-incinerator Share**: 2.5% (50% of service fee)
- **User Receives**: 95% of reclaimed rent

**Example**:
- 14 accounts closed = 0.02854992 GOR reclaimed
- Service fee = 0.00142750 GOR (5%)
- Aether Labs = 0.00071375 GOR (2.5%)
- Gor-incinerator = 0.00071375 GOR (2.5%)
- User receives = 0.02712242 GOR (95%)

## 🧪 Testing

### Test GET /assets/:wallet

```bash
curl -X GET "https://api.gor-incinerator.fun/assets/YOUR_WALLET_ADDRESS" \
  -H "x-api-key: YOUR_API_KEY"
```

### Test POST /build-burn-tx

```bash
curl -X POST "https://api.gor-incinerator.fun/build-burn-tx" \
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
curl -X GET "https://api.gor-incinerator.fun/reconciliation/report?start=2025-01-01&end=2025-01-31" \
  -H "x-api-key: YOUR_ADMIN_API_KEY"
```

## 📖 Documentation

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [Solana Web3.js Docs](https://solana-labs.github.io/solana-web3.js/)
- [Gorbagana Blockchain](https://gorbagana.com)

## 🤝 Contract Compliance

This API fulfills all requirements from the partnership agreement:

✅ **Protected API Endpoints** - API key authentication  
✅ **GET /assets/:wallet** - Burn-eligible account detection  
✅ **POST /build-burn-tx** - Transaction building with fee splits  
✅ **Gorbagana Blockchain Only** - RPC configured for Gorbagana  
✅ **Logging & Analytics** - Complete transaction tracking in D1  
✅ **5% Fee with 50/50 Split** - Real-time fee distribution  
✅ **Monthly Reconciliation** - Built-in reporting tools  

## 📄 License

ISC License

## 🔗 Links

- **API**: https://api.gor-incinerator.fun
- **Frontend**: https://gor-incinerator.fun
- **GitHub**: https://github.com/DOGECOIN87/gor-incinerator
