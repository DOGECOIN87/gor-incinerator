# AETHER LABS Partnership & Integration Agreement
## Gor-Incinerator Rent Reclamation Service

**Document Date:** December 12, 2025  
**Status:** Official Partnership Agreement  
**Integration Status:** ✅ FULLY OPERATIONAL

---

## 1. Partnership Overview

### Parties Involved
- **Service Provider:** Gor-Incinerator (Rent Reclamation Platform)
- **Partner:** AETHER LABS (Gorbag Wallet)
- **Blockchain Network:** Gorbagana (GOR Token)

### Partnership Terms
- **Fee Share Structure:** 50/50 split of all service fees
- **Service Focus:** Token account rent reclamation on Gorbagana
- **Go-Live Date:** December 12, 2025
- **Duration:** Ongoing partnership
- **Termination:** Either party may terminate with 30 days written notice

---

## 2. Service Description

### What is Gor-Incinerator?
Gor-Incinerator is a decentralized application that helps Gorbagana users reclaim rent from token accounts by:
1. Identifying token accounts with zero balance and dust
2. Burning any remaining token balance
3. Closing accounts to reclaim rent (approximately 0.00203928 GOR per account)
4. Distributing fees to partners

### Core Features
- **Automatic Rent Calculation:** Calculates exact rent reclamation per account
- **Batch Processing:** Supports closing up to 14 accounts per transaction
- **Secure Transactions:** Uses user's own wallet for transaction signing
- **Real-Time Reporting:** Dashboard for tracking reclamation activity
- **Partnership Reconciliation:** Detailed reports for fee distribution

---

## 3. Revenue Model & Fee Distribution

### Fee Structure
```
Total Rent Reclaimed per Account: 0.00203928 GOR

Service Fee Breakdown:
├─ Total Service Fee: 5% of rent reclaimed
├─ AETHER LABS Share: 50% of service fee
└─ Gor-Incinerator Share: 50% of service fee

User Receives: 95% of rent reclaimed
```

### Example Calculation
**Scenario:** User closes 5 token accounts

```
Total Rent Reclaimed:    0.01019640 GOR (5 × 0.00203928)
Service Fee (5%):        0.00050982 GOR
AETHER LABS Fee (50%):   0.00025491 GOR
Gor-Incinerator Fee:     0.00025491 GOR
User Receives:           0.00968658 GOR (95%)
```

### Payment Terms
- **Frequency:** Weekly automated payments to vault addresses
- **Minimum Threshold:** $1 USD equivalent (approximately 0.00001 GOR)
- **Currency:** Native GOR tokens
- **Settlement:** Automatic via smart contract transfers

---

## 4. AETHER LABS Integration Details

### Vault Address (Fee Recipient)
```
Primary Vault: DvY73fC74Ny33Zu3ScA62VCSwrz1yV8kBysKu3rnLjvD
Network: Gorbagana (GOR)
Fund Type: Accumulated service fees from rent reclamation
```

### API Credentials

#### User API Key (Frontend Access)
```
Key ID: gorincin_user_key_v1
API Key: REDACTED_USER_API_KEY
Scope: User transaction building, assets lookup
Rate Limit: 1000 requests/hour per user
Expires: No expiration (partnership ongoing)
```

#### Admin API Key (Reporting & Reconciliation)
```
Key ID: gorincin_admin_key_aether_v1
API Key: REDACTED_ADMIN_API_KEY
Scope: Reconciliation reports, transaction history, fee auditing
Rate Limit: 100 requests/hour
Expires: No expiration (partnership ongoing)
Access Level: Admin-only endpoints
Restricted To: AETHER LABS authorized personnel
```

**⚠️ CONFIDENTIAL:** These API keys must be kept secure and not shared publicly.

---

## 5. API Endpoints

### Base URL
```
https://gor-incinerator-api.gor-incinerator.workers.dev
```

### Public Endpoints

#### 1. Health Check
```
Method: GET
Endpoint: /
Authentication: None required
Response: Text confirmation that API is operational
Status Code: 200 OK

Example:
curl https://gor-incinerator-api.gor-incinerator.workers.dev/
Response: "Gor-Incinerator API Worker is running!"
```

#### 2. Get User Assets (Token Accounts)
```
Method: GET
Endpoint: /assets/:wallet
Authentication: Required (User API Key)
Header: x-api-key: {USER_API_KEY}
Parameters:
  - wallet: User's Gorbagana wallet address (base58)

Response:
{
  "wallet": "user_wallet_address",
  "accounts": [
    {
      "address": "token_account_address",
      "mint": "token_mint_address",
      "balance": "0",
      "burnEligible": true,
      "estimatedRent": 203928
    }
  ],
  "summary": {
    "totalAccounts": 25,
    "burnEligible": 18,
    "totalRent": 3670704,
    "serviceFee": 183535,
    "youReceive": 3487169
  }
}

Example:
curl -H "x-api-key: REDACTED_USER_API_KEY" \
  https://gor-incinerator-api.gor-incinerator.workers.dev/assets/wallet_address
```

#### 3. Build Burn Transaction
```
Method: POST
Endpoint: /build-burn-tx
Authentication: Required (User API Key)
Header: x-api-key: {USER_API_KEY}
Content-Type: application/json

Request Body:
{
  "wallet": "user_wallet_address",
  "accounts": [
    "token_account_1",
    "token_account_2",
    ...
  ],
  "maxAccounts": 14  // Maximum accounts per transaction
}

Response:
{
  "wallet": "user_wallet_address",
  "accountsToClose": 10,
  "totalRent": 2039280,
  "serviceFee": 101964,
  "feeBreakdown": {
    "aetherLabs": 50982,
    "gorIncinerator": 50982
  },
  "userReceive": 1937316,
  "transaction": "signed_transaction_base64_encoded"
}

Example:
curl -X POST \
  -H "x-api-key: REDACTED_USER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "wallet": "user_wallet",
    "accounts": ["account1", "account2"],
    "maxAccounts": 14
  }' \
  https://gor-incinerator-api.gor-incinerator.workers.dev/build-burn-tx
```

### Admin Endpoints (AETHER LABS Only)

#### 4. Reconciliation Report
```
Method: GET
Endpoint: /reconciliation/report
Authentication: Required (Admin API Key)
Header: x-api-key: {ADMIN_API_KEY}
Query Parameters:
  - start: Start date (YYYY-MM-DD format)
  - end: End date (YYYY-MM-DD format)

Response:
{
  "period": {
    "start": "2025-12-01",
    "end": "2025-12-31"
  },
  "summary": {
    "totalTransactions": 156,
    "totalAccountsClosed": 892,
    "totalRent": 1815811200,
    "totalFees": 90790560,
    "aetherLabsShare": 45395280,
    "gorIncineratorShare": 45395280
  },
  "transactions": [
    {
      "id": 1,
      "timestamp": "2025-12-12T10:30:00Z",
      "wallet": "user_wallet_address",
      "accounts_closed": 8,
      "total_rent": 16314400,
      "service_fee": 815720,
      "aether_labs_fee": 407860,
      "gor_incinerator_fee": 407860
    }
    // ... more transactions
  ]
}

Example:
curl -H "x-api-key: REDACTED_ADMIN_API_KEY" \
  "https://gor-incinerator-api.gor-incinerator.workers.dev/reconciliation/report?start=2025-12-01&end=2025-12-31"
```

---

## 6. Integration Architecture

### Technology Stack
- **Frontend:** React + Vite (TypeScript)
- **Backend:** Cloudflare Workers (Hono framework)
- **Database:** Cloudflare D1 (SQLite)
- **Blockchain:** Gorbagana RPC (`https://rpc.gorbagana.wtf`)
- **Hosting:** Cloudflare Pages + Workers

### Data Flow
```
User Interface
       ↓
API Gateway (Cloudflare Workers)
       ↓
  [Authentication Middleware]
       ↓
  [Fee Calculation Service]
       ↓
  [Transaction Builder]
       ↓
  [Database Logger] → D1 Database
       ↓
  [RPC Connection] → Gorbagana Blockchain
       ↓
   User's Wallet → Transaction Signing & Broadcasting
       ↓
  [Fee Distribution] → AETHER LABS Vault + Gor-Incinerator Vault
       ↓
   Reconciliation Reports (Admin Only)
```

### Security Architecture
```
┌─────────────────────────────────────────┐
│        Authentication Layer             │
├─────────────────────────────────────────┤
│ • API Key validation on all endpoints   │
│ • Separate user vs admin keys           │
│ • Rate limiting (1000/hour for users)   │
│ • Rate limiting (100/hour for admin)    │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│     Authorization Layer                 │
├─────────────────────────────────────────┤
│ • User endpoints: GET /assets, POST /tx │
│ • Admin endpoints: GET /reconciliation   │
│ • Wallet signature verification         │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│    Data Protection Layer                │
├─────────────────────────────────────────┤
│ • TLS/HTTPS encryption in transit       │
│ • Secrets stored in Cloudflare vault    │
│ • No API keys in source code            │
│ • CORS enabled for frontend only        │
└─────────────────────────────────────────┘
```

---

## 7. Database Schema

### Transactions Table
```sql
CREATE TABLE transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL,
  wallet TEXT NOT NULL,
  accounts_closed INTEGER NOT NULL,
  total_rent REAL NOT NULL,
  service_fee REAL NOT NULL,
  aether_labs_fee REAL NOT NULL,
  gor_incinerator_fee REAL NOT NULL,
  tx_hash TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes for Performance:**
```sql
CREATE INDEX idx_timestamp ON transactions(timestamp);
CREATE INDEX idx_wallet ON transactions(wallet);
CREATE INDEX idx_status ON transactions(status);
```

**Data Retention:** All transaction records retained indefinitely for audit purposes.

---

## 8. Compliance & Audit

### Fee Verification
AETHER LABS can verify their fee accumulation at any time using the admin API:

```bash
#!/bin/bash
# Verify AETHER LABS fees for a specific period

ADMIN_KEY="REDACTED_ADMIN_API_KEY"
START_DATE="2025-12-01"
END_DATE="2025-12-31"

curl -H "x-api-key: $ADMIN_KEY" \
  "https://gor-incinerator-api.gor-incinerator.workers.dev/reconciliation/report?start=$START_DATE&end=$END_DATE" \
  | jq '.summary.aetherLabsShare'
```

### Monthly Settlement
1. Generate reconciliation report via admin API
2. Verify AETHER LABS share calculation
3. Initiate automated transfer to vault address
4. Archive reconciliation report for tax/audit purposes

### Audit Trail
All transactions are logged to the D1 database with:
- Exact timestamp of execution
- User wallet address
- Number of accounts closed
- Exact fee amounts (including AETHER LABS share)
- Transaction hash (if confirmed)

---

## 9. Deployment Information

### Live Production Environment

#### API Worker
```
URL: https://gor-incinerator-api.gor-incinerator.workers.dev
Provider: Cloudflare Workers
Version: Latest (deployed 2025-12-12)
Region: Global CDN
Uptime SLA: 99.99%+
```

#### Database
```
Type: Cloudflare D1 (SQLite)
Name: gor-incinerator-logs-2
ID: 54456de5-7083-46c2-a69b-4164d5de2dff
Region: Cloudflare Global Network
Uptime SLA: 99.99%+
Backup: Automatic daily backups
```

#### Frontend
```
URL: https://gor-incinerator.com
Hosting: Cloudflare Pages
Framework: React + Vite
Build: Production optimized (453 KB gzip)
API Mode: Backend integration (using API endpoints)
```

### Environment Configuration

**Production Secrets (Stored in Cloudflare):**
```
- API_KEY: User authentication key
- ADMIN_API_KEY: Admin reconciliation key  
- GOR_RPC_URL: https://rpc.gorbagana.wtf
- GOR_VAULT_ADDRESS_AETHER: DvY73fC74Ny33Zu3ScA62VCSwrz1yV8kBysKu3rnLjvD
- GOR_VAULT_ADDRESS_INCINERATOR: BuRnX2HDP8s1CFdYwKpYCCshaZcTvFm3xjbmXPR3QsdG
```

---

## 10. SLA & Support

### Service Level Agreement

| Metric | Target | Consequence |
|--------|--------|-------------|
| API Uptime | 99.9% monthly | $100 service credit |
| Response Time | <200ms p95 | Performance review |
| Transaction Success | 99.5% | Root cause analysis |
| Data Loss | 0% | Full investigation |

### Support Channels
- **Technical Issues:** GitHub Issues (https://github.com/DOGECOIN87/gor-incinerator)
- **Partnership Matters:** Email contact (to be provided)
- **Emergency Hotline:** 24/7 escalation available

### Scheduled Maintenance
- **Window:** Monthly on first Sunday at 2:00 AM UTC
- **Duration:** Max 1 hour
- **Notification:** 7 days advance notice

---

## 11. Terms & Conditions

### Intellectual Property
- Gor-Incinerator owns all rights to the platform code
- AETHER LABS owns rights to the Gorbag Wallet
- Both parties retain rights to their respective branding

### Liability
- Service provided "as-is" for rent reclamation
- No guarantee of specific transaction amounts
- User responsible for wallet security
- Blockchain-level failures not Gor-Incinerator responsibility

### Data Privacy
- User wallet addresses logged for transaction history
- No personal identification data collected
- AETHER LABS cannot access user wallets
- Reconciliation reports contain only aggregated data

### Termination Conditions
- Either party may terminate with 30 days written notice
- Final settlement of fees due within 7 days of termination
- Data retained per applicable regulations
- Code/API access revoked immediately upon termination

---

## 12. Getting Started for AETHER LABS

### Step 1: Integrate with Your Platform
```javascript
// Example integration in Gorbag Wallet

const API_BASE = "https://gor-incinerator-api.gor-incinerator.workers.dev";
const USER_API_KEY = "REDACTED_USER_API_KEY";

// Get user's burnable accounts
async function getAssets(walletAddress) {
  const response = await fetch(`${API_BASE}/assets/${walletAddress}`, {
    headers: { "x-api-key": USER_API_KEY }
  });
  return response.json();
}

// Build transaction
async function buildBurnTx(walletAddress, accounts) {
  const response = await fetch(`${API_BASE}/build-burn-tx`, {
    method: "POST",
    headers: {
      "x-api-key": USER_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ wallet: walletAddress, accounts })
  });
  return response.json();
}
```

### Step 2: Configure Your Environment
Store these keys securely in your infrastructure:
```bash
# .env (secured - never commit)
AETHER_LABS_ADMIN_API_KEY="REDACTED_ADMIN_API_KEY"
AETHER_LABS_VAULT_ADDRESS="DvY73fC74Ny33Zu3ScA62VCSwrz1yV8kBysKu3rnLjvD"
GOR_INCINERATOR_API_BASE="https://gor-incinerator-api.gor-incinerator.workers.dev"
```

### Step 3: Setup Automated Reconciliation
```bash
#!/bin/bash
# Reconciliation script (run daily)

ADMIN_KEY="REDACTED_ADMIN_API_KEY"
API_BASE="https://gor-incinerator-api.gor-incinerator.workers.dev"

# Get yesterday's date
START_DATE=$(date -d "yesterday" +%Y-%m-%d)
END_DATE=$(date +%Y-%m-%d)

# Fetch reconciliation report
REPORT=$(curl -s -H "x-api-key: $ADMIN_KEY" \
  "$API_BASE/reconciliation/report?start=$START_DATE&end=$END_DATE")

# Extract AETHER LABS share
AETHER_SHARE=$(echo $REPORT | jq '.summary.aetherLabsShare')

# Log to database
echo "$(date): AETHER LABS share for $START_DATE = $AETHER_SHARE GOR" >> reconciliation.log
```

### Step 4: Monitor Your Earnings
Use the admin API to verify fees accumulated:
```bash
# Weekly verification script
curl -H "x-api-key: REDACTED_ADMIN_API_KEY" \
  "https://gor-incinerator-api.gor-incinerator.workers.dev/reconciliation/report?start=2025-12-01&end=2025-12-31" \
  | jq '.summary | {totalFees, aetherLabsShare: .aetherLabsShare, gorIncineratorShare: .gorIncineratorShare}'
```

---

## 13. Contact & Escalation

### Primary Contacts
- **Technical Support:** [To be configured]
- **Partnership Manager:** [To be configured]
- **Emergency Contact:** [To be configured]

### Documentation Links
- **API Documentation:** `/docs/API_DEPLOYMENT_GUIDE.md`
- **Integration Guide:** `/docs/GORBAG_WALLET_INTEGRATION.md`
- **Verification Report:** `/AETHER_LABS_VERIFICATION.md`
- **GitHub Repository:** https://github.com/DOGECOIN87/gor-incinerator

### Feedback & Improvements
We welcome feedback on the integration. Please submit:
- Feature requests
- Performance suggestions
- Security concerns
- Documentation improvements

---

## 14. Signature & Acceptance

**By integrating with Gor-Incinerator, AETHER LABS agrees to:**
- ✅ Respect user privacy and data protection requirements
- ✅ Maintain confidentiality of API keys
- ✅ Comply with applicable blockchain regulations
- ✅ Report any security vulnerabilities responsibly
- ✅ Provide timely feedback on integration issues

**Partnership Effective Date:** December 12, 2025

---

## Appendix A: Glossary

| Term | Definition |
|------|-----------|
| **Rent Reclamation** | Process of recovering account rent by closing zero-balance token accounts |
| **Token Account** | Solana/Gorbagana account holding a specific token balance |
| **Service Fee** | 5% charge on rent reclaimed, split 50/50 with partner |
| **Lamports/Smallest Unit** | 1 GOR = 1,000,000,000 lamports |
| **Vault Address** | Gorbagana wallet receiving AETHER LABS service fees |
| **Admin API Key** | Restricted access for reconciliation reports and auditing |
| **RPC Endpoint** | Connection point to Gorbagana blockchain (https://rpc.gorbagana.wtf) |

## Appendix B: API Response Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Proceed with data |
| 400 | Bad Request | Check request format |
| 401 | Unauthorized | Verify API key |
| 404 | Not Found | Check endpoint URL |
| 429 | Rate Limited | Wait before retrying |
| 500 | Server Error | Contact support |

---

**Document Version:** 1.0  
**Last Updated:** December 12, 2025  
**Status:** Official Partnership Document  
**Classification:** Confidential - Partnership

---

**Gor-Incinerator Development Team**  
**AETHER LABS Partnership Integration**  
**December 12, 2025**
