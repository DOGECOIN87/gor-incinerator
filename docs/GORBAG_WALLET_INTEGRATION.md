# Gorbag Wallet Integration Guide

Complete guide for integrating Gor-Incinerator API into Gorbag Wallet.

## 📋 Overview

This guide provides step-by-step instructions for Aether Labs to integrate the Gor-Incinerator token burning service into Gorbag Wallet.

### Partnership Benefits

- **50/50 Revenue Split** - Aether Labs receives 2.5% of all reclaimed rent
- **Protected API Access** - Exclusive API key with 100 req/min rate limit
- **Zero Infrastructure** - No backend maintenance required
- **Complete Transparency** - Monthly reconciliation reports
- **Global Performance** - Sub-100ms response times via Cloudflare edge network

## 🔑 Authentication

### API Key Format

```
gorincin_[64_hexadecimal_characters]
```

### Example
```
<YOUR_API_KEY>
```

### Usage

Include the API key in the `x-api-key` header for all requests:

```bash
curl -H "x-api-key: gorincin_YOUR_API_KEY" \
  https://api.gor-incinerator.com/assets/WALLET_ADDRESS
```

### Rate Limiting

- **Limit**: 100 requests per minute per API key
- **Response Header**: `X-RateLimit-Remaining` indicates remaining requests
- **429 Status**: Returned when rate limit exceeded

## 🔌 API Endpoints

### Base URL

```
https://api.gor-incinerator.com
```

### 1. Health Check

**Endpoint**: `GET /health`

**Authentication**: Not required

**Description**: Check API status and availability.

**Request**:
```bash
curl https://api.gor-incinerator.com/health
```

**Response**:
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

**Endpoint**: `GET /assets/:wallet`

**Authentication**: Required

**Description**: Returns all token accounts eligible for burning (zero balance accounts).

**Parameters**:
- `wallet` (path parameter) - Base58-encoded Gorbagana wallet address

**Request**:
```bash
curl -X GET "https://api.gor-incinerator.com/assets/8xKZFz7qJR2H9PmVJW3nN4kLdMqY6tBsC1rEfGhUiSoP" \
  -H "x-api-key: gorincin_YOUR_API_KEY"
```

**Response** (200 OK):
```json
{
  "wallet": "8xKZFz7qJR2H9PmVJW3nN4kLdMqY6tBsC1rEfGhUiSoP",
  "accounts": [
    {
      "pubkey": "DzP3K8vQZ2nM5xLrT9wY1jH4sB6cF8dE7gA2hN9pK3qR",
      "mint": "GorTokenMint111111111111111111111111111111",
      "balance": "0",
      "burnEligible": true,
      "estimatedRent": 0.00203928
    },
    {
      "pubkey": "8xKZFz7qJR2H9PmVJW3nN4kLdMqY6tBsC1rEfGhUiSoP",
      "mint": "AnotherMint222222222222222222222222222222",
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

**Error Responses**:

**401 Unauthorized** - Invalid or missing API key
```json
{
  "error": "Authentication Failed",
  "message": "Invalid API key.",
  "status": 401
}
```

**400 Bad Request** - Invalid wallet address
```json
{
  "error": "Validation Error",
  "message": "Invalid wallet address format",
  "status": 400
}
```

---

### 3. Build Burn Transaction

**Endpoint**: `POST /build-burn-tx`

**Authentication**: Required

**Description**: Builds an unsigned transaction to close token accounts with automatic fee splitting.

**Request Body**:
```json
{
  "wallet": "8xKZFz7qJR2H9PmVJW3nN4kLdMqY6tBsC1rEfGhUiSoP",
  "accounts": [
    "DzP3K8vQZ2nM5xLrT9wY1jH4sB6cF8dE7gA2hN9pK3qR",
    "8xKZFz7qJR2H9PmVJW3nN4kLdMqY6tBsC1rEfGhUiSoP"
  ],
  "maxAccounts": 14
}
```

**Field Descriptions**:
- `wallet` (required) - User's wallet address (signer)
- `accounts` (required) - Array of token account addresses to close
- `maxAccounts` (optional) - Maximum accounts per transaction (default: 14, max: 14)

**Request**:
```bash
curl -X POST "https://api.gor-incinerator.com/build-burn-tx" \
  -H "x-api-key: gorincin_YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "wallet": "8xKZFz7qJR2H9PmVJW3nN4kLdMqY6tBsC1rEfGhUiSoP",
    "accounts": ["DzP3K8vQZ2nM5xLrT9wY1jH4sB6cF8dE7gA2hN9pK3qR"],
    "maxAccounts": 14
  }'
```

**Response** (200 OK):
```json
{
  "transaction": "AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAQAHDwK...",
  "accountsToClose": 14,
  "totalRent": 0.02854992,
  "serviceFee": 0.00142750,
  "feeBreakdown": {
    "aetherLabs": 0.00071375,
    "gorIncinerator": 0.00071375
  },
  "youReceive": 0.02712242,
  "blockhash": "9xKZFz7qJR2H9PmVJW3nN4kLdMqY6tBsC1rEfGhUiSoP",
  "requiresSignatures": ["8xKZFz7qJR2H9PmVJW3nN4kLdMqY6tBsC1rEfGhUiSoP"]
}
```

**Field Descriptions**:
- `transaction` - Base64-encoded unsigned transaction (ready for signing)
- `accountsToClose` - Number of accounts included in transaction
- `totalRent` - Total rent to be reclaimed (in GOR)
- `serviceFee` - Total 5% service fee (in GOR)
- `feeBreakdown` - Split between Aether Labs and Gor-incinerator
- `youReceive` - Net amount user receives after fees (in GOR)
- `blockhash` - Recent blockhash used in transaction
- `requiresSignatures` - Array of public keys that must sign

**Error Responses**:

**400 Bad Request** - Invalid request
```json
{
  "error": "Validation Error",
  "message": "Missing required field: wallet",
  "status": 400
}
```

**500 Internal Server Error** - RPC or blockchain error
```json
{
  "error": "Internal Server Error",
  "message": "Failed to fetch latest blockhash",
  "status": 500
}
```

---

## 🔄 Integration Flow

### Complete User Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        GORBAG WALLET                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 1. User clicks "Burn Tokens"
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  GET /assets/:wallet                                            │
│  Returns list of burn-eligible accounts                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 2. Display accounts to user
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  User reviews and confirms                                      │
│  - See accounts to close                                        │
│  - See estimated rent reclaim                                   │
│  - See 5% fee breakdown (2.5% to Aether, 2.5% to Incinerator) │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 3. User confirms
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  POST /build-burn-tx                                            │
│  Returns unsigned transaction with fee splits                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 4. Wallet signs transaction
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Wallet broadcasts to Gorbagana blockchain                      │
│  Transaction executes atomically:                               │
│  - Close token accounts                                         │
│  - Transfer 2.5% to Aether Labs vault                          │
│  - Transfer 2.5% to Gor-incinerator vault                      │
│  - Return 95% to user                                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 5. Show success message
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Display transaction result to user                             │
│  - Transaction hash                                             │
│  - Rent reclaimed                                               │
│  - Fee paid                                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 💻 Code Examples

### JavaScript/TypeScript Example

```typescript
import { Connection, VersionedTransaction } from '@solana/web3.js';

/**
 * Gor-Incinerator API Client
 */
class GorIncineratorAPI {
  private apiKey: string;
  private baseURL: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.gor-incinerator.com';
  }

  /**
   * Get burn-eligible assets for a wallet
   */
  async getAssets(walletAddress: string) {
    const response = await fetch(`${this.baseURL}/assets/${walletAddress}`, {
      method: 'GET',
      headers: {
        'x-api-key': this.apiKey,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`API Error: ${error.message}`);
    }

    return await response.json();
  }

  /**
   * Build burn transaction
   */
  async buildBurnTransaction(
    walletAddress: string,
    accounts: string[],
    maxAccounts: number = 14
  ) {
    const response = await fetch(`${this.baseURL}/build-burn-tx`, {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        wallet: walletAddress,
        accounts,
        maxAccounts,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`API Error: ${error.message}`);
    }

    return await response.json();
  }
}

/**
 * Example: Burn tokens flow
 */
async function burnTokensFlow(
  apiClient: GorIncineratorAPI,
  connection: Connection,
  walletAddress: string,
  signTransaction: (tx: VersionedTransaction) => Promise<VersionedTransaction>
) {
  try {
    // Step 1: Get burn-eligible assets
    console.log('Fetching burn-eligible assets...');
    const assetsData = await apiClient.getAssets(walletAddress);
    
    console.log(`Found ${assetsData.summary.burnEligible} eligible accounts`);
    console.log(`Total rent: ${assetsData.summary.totalRent} GOR`);
    console.log(`Service fee: ${assetsData.summary.serviceFee} GOR`);
    console.log(`You receive: ${assetsData.summary.youReceive} GOR`);

    // Step 2: Get user confirmation (implement your UI logic here)
    const userConfirmed = true; // Replace with actual user confirmation

    if (!userConfirmed) {
      console.log('User cancelled');
      return;
    }

    // Step 3: Build burn transaction
    console.log('Building burn transaction...');
    const accountAddresses = assetsData.accounts.map((acc: any) => acc.pubkey);
    const txData = await apiClient.buildBurnTransaction(
      walletAddress,
      accountAddresses,
      14
    );

    console.log(`Transaction will close ${txData.accountsToClose} accounts`);
    console.log(`Fee breakdown:`);
    console.log(`  - Aether Labs: ${txData.feeBreakdown.aetherLabs} GOR`);
    console.log(`  - Gor-incinerator: ${txData.feeBreakdown.gorIncinerator} GOR`);

    // Step 4: Deserialize and sign transaction
    console.log('Signing transaction...');
    const txBuffer = Buffer.from(txData.transaction, 'base64');
    const transaction = VersionedTransaction.deserialize(txBuffer);
    const signedTx = await signTransaction(transaction);

    // Step 5: Send transaction
    console.log('Broadcasting transaction...');
    const signature = await connection.sendTransaction(signedTx);
    
    // Step 6: Confirm transaction
    console.log('Confirming transaction...');
    await connection.confirmTransaction(signature, 'confirmed');

    console.log('✅ Success!');
    console.log(`Transaction: ${signature}`);
    console.log(`Rent reclaimed: ${txData.youReceive} GOR`);

    return {
      signature,
      accountsClosed: txData.accountsToClose,
      rentReclaimed: txData.youReceive,
      feePaid: txData.serviceFee,
    };
  } catch (error) {
    console.error('Error burning tokens:', error);
    throw error;
  }
}

// Usage
const apiClient = new GorIncineratorAPI('gorincin_YOUR_API_KEY');
const connection = new Connection('https://rpc.gorbagana.com');

// Call in your wallet's burn tokens handler
// await burnTokensFlow(apiClient, connection, userWallet, signTransaction);
```

---

## 🧪 Testing

### Test with cURL

```bash
# 1. Test health endpoint
curl https://api.gor-incinerator.com/health

# 2. Test get assets (replace with your API key and wallet)
curl -X GET "https://api.gor-incinerator.com/assets/YOUR_WALLET_ADDRESS" \
  -H "x-api-key: gorincin_YOUR_API_KEY"

# 3. Test build transaction (replace with actual data)
curl -X POST "https://api.gor-incinerator.com/build-burn-tx" \
  -H "x-api-key: gorincin_YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "wallet": "YOUR_WALLET_ADDRESS",
    "accounts": ["ACCOUNT_1", "ACCOUNT_2"],
    "maxAccounts": 14
  }'
```

### Test Checklist

- [ ] Health endpoint returns 200 OK
- [ ] Get assets returns valid account list
- [ ] Build transaction returns valid base64 transaction
- [ ] Transaction can be deserialized with @solana/web3.js
- [ ] Signed transaction broadcasts successfully
- [ ] Transaction confirms on-chain
- [ ] Fees are split correctly (check on-chain)
- [ ] User receives 95% of rent

---

## 📊 Fee Structure

### Breakdown

| Component | Percentage | Recipient |
|-----------|------------|-----------|
| **Total Service Fee** | 5% | Split 50/50 |
| Aether Labs Share | 2.5% | Aether Labs Vault |
| Gor-incinerator Share | 2.5% | Gor-incinerator Vault |
| **User Receives** | 95% | User Wallet |

### Example Calculation

**Scenario**: User closes 14 token accounts

1. **Total Rent Reclaimed**: 14 × 0.00203928 GOR = **0.02854992 GOR**
2. **Service Fee (5%)**: 0.02854992 × 0.05 = **0.00142750 GOR**
3. **Aether Labs (2.5%)**: 0.00142750 ÷ 2 = **0.00071375 GOR**
4. **Gor-incinerator (2.5%)**: 0.00142750 ÷ 2 = **0.00071375 GOR**
5. **User Receives (95%)**: 0.02854992 - 0.00142750 = **0.02712242 GOR**

### Vault Addresses

**Aether Labs Vault**: `[TO BE PROVIDED]`  
**Gor-incinerator Vault**: `[TO BE PROVIDED]`

These addresses are hardcoded in the API and cannot be changed by the client.

---

## 📈 Monthly Reconciliation

### Reconciliation Report Endpoint

**Endpoint**: `GET /reconciliation/report`

**Authentication**: Admin API key required

**Parameters**:
- `start` (query parameter) - Start date (YYYY-MM-DD)
- `end` (query parameter) - End date (YYYY-MM-DD)

**Request**:
```bash
curl -X GET "https://api.gor-incinerator.com/reconciliation/report?start=2025-01-01&end=2025-01-31" \
  -H "x-api-key: gorincin_ADMIN_API_KEY"
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
  "transactions": [
    {
      "id": 1,
      "timestamp": "2025-01-15T10:30:00Z",
      "wallet": "8xKZFz...",
      "accountsClosed": 10,
      "totalRent": 0.0203928,
      "serviceFee": 0.00101964,
      "aetherLabsFee": 0.00050982,
      "gorIncineratorFee": 0.00050982,
      "txHash": "5xKZFz...",
      "status": "confirmed"
    }
  ]
}
```

### Automated Reconciliation Scripts

Scripts are provided in `api/scripts/`:

**Bash Script**:
```bash
cd api/scripts
export ADMIN_API_KEY=gorincin_YOUR_ADMIN_KEY
./reconciliation.sh 2025-01-01 2025-01-31
```

**Python Script**:
```bash
cd api/scripts
export ADMIN_API_KEY=gorincin_YOUR_ADMIN_KEY
python3 reconciliation.py 2025-01-01 2025-01-31
```

Both scripts generate:
- Console summary
- JSON file with full data
- CSV export for spreadsheet analysis

---

## 🔒 Security Best Practices

### API Key Management

1. **Never commit API keys to version control**
2. **Store in environment variables or secure vaults**
3. **Rotate keys periodically** (every 90 days recommended)
4. **Use separate keys for development and production**
5. **Monitor API key usage** via reconciliation reports

### Transaction Security

1. **Always verify transaction contents before signing**
2. **Check fee amounts match expected values**
3. **Validate vault addresses are correct**
4. **Implement transaction simulation before signing**
5. **Show clear fee breakdown to users**

### User Privacy

1. **API does not store user private keys**
2. **Transactions are built unsigned**
3. **Signing happens client-side in wallet**
4. **Only public wallet addresses are logged**

---

## 🚨 Error Handling

### Common Errors

| Status Code | Error | Cause | Solution |
|-------------|-------|-------|----------|
| 401 | Authentication Failed | Invalid API key | Check API key is correct |
| 400 | Validation Error | Invalid request data | Verify request format |
| 429 | Rate Limit Exceeded | Too many requests | Wait 60 seconds and retry |
| 500 | Internal Server Error | RPC or blockchain issue | Retry request, check RPC status |

### Error Response Format

All errors follow this format:

```json
{
  "error": "Error Type",
  "message": "Detailed error message",
  "status": 400
}
```

### Retry Logic

Implement exponential backoff for retries:

```typescript
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      
      // Don't retry 4xx errors (except 429)
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      // Exponential backoff: 1s, 2s, 4s
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    } catch (error) {
      if (i === maxRetries - 1) throw error;
    }
  }
}
```

---

## 📞 Support

### Technical Support

- **GitHub Issues**: https://github.com/DOGECOIN87/gor-incinerator/issues
- **Email**: [Contact via GitHub]
- **Response Time**: Within 24 hours

### Documentation

- **API Documentation**: https://github.com/DOGECOIN87/gor-incinerator/blob/main/api/README.md
- **Deployment Guide**: https://github.com/DOGECOIN87/gor-incinerator/blob/main/DEPLOYMENT_GUIDE.md
- **Business Model**: https://github.com/DOGECOIN87/gor-incinerator/blob/main/docs/BUSINESS_MODEL.md

---

## ✅ Integration Checklist

### Pre-Integration

- [ ] Receive API key from Gor-incinerator team
- [ ] Store API key securely in environment variables
- [ ] Review API documentation
- [ ] Set up test environment

### Development

- [ ] Implement API client class
- [ ] Add "Burn Tokens" feature to wallet UI
- [ ] Implement get assets flow
- [ ] Implement build transaction flow
- [ ] Add transaction signing and broadcasting
- [ ] Display fee breakdown to users
- [ ] Implement error handling
- [ ] Add retry logic for failed requests

### Testing

- [ ] Test with testnet/devnet (if available)
- [ ] Test with small amounts on mainnet
- [ ] Verify fee splits are correct on-chain
- [ ] Test error scenarios
- [ ] Test rate limiting behavior
- [ ] Perform end-to-end user flow testing

### Production

- [ ] Deploy to production
- [ ] Monitor transaction success rate
- [ ] Set up error tracking
- [ ] Document any issues
- [ ] Provide feedback to Gor-incinerator team

### Post-Launch

- [ ] Review monthly reconciliation reports
- [ ] Monitor API performance
- [ ] Collect user feedback
- [ ] Optimize user experience

---

## 🎯 Success Metrics

### Track These KPIs

- **Transaction Success Rate**: Target >95%
- **API Response Time**: Target <500ms
- **User Adoption**: Number of users using burn feature
- **Revenue Generated**: Total fees collected
- **User Satisfaction**: Feedback and ratings

---

## 📄 Appendix A: Vault Addresses

**To be provided by Gor-incinerator team**

| Vault | Address | Purpose |
|-------|---------|---------|
| Aether Labs | `[TBD]` | Receives 2.5% of service fee |
| Gor-incinerator | `[TBD]` | Receives 2.5% of service fee |

---

## 📄 Appendix B: Rate Limiting Details

### Rate Limit Specifications

- **Limit**: 100 requests per minute per API key
- **Window**: Rolling 60-second window
- **Headers**: 
  - `X-RateLimit-Limit: 100`
  - `X-RateLimit-Remaining: 95`
  - `X-RateLimit-Reset: 1609459200` (Unix timestamp)

### Rate Limit Response

When rate limit is exceeded:

```json
{
  "error": "Rate Limit Exceeded",
  "message": "You have exceeded the rate limit of 100 requests per minute",
  "status": 429,
  "retryAfter": 60
}
```

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Contact**: DOGECOIN87 via GitHub
