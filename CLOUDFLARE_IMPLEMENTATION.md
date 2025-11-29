# Gor-Incinerator Cloudflare Workers + Pages Implementation

## 1. Repository Audit Summary

### Current State

**Frameworks & Languages:**
- **Backend**: TypeScript with Node.js
- **Frontend**: React 18 with TypeScript, Vite build system
- **Blockchain**: Solana Web3.js v1.95.0 and SPL Token libraries (compatible with Gorbagana fork)
- **Styling**: TailwindCSS with custom design system
- **3D Graphics**: Three.js with React Three Fiber

**What's Already Implemented:**

✅ **Core Burning Logic** (`src/burn.ts`):
- Command-line tool that scans wallet for empty token accounts
- Closes up to 14 accounts per transaction (optimized for compute limits)
- Fee calculation and collection (5% configurable)
- Blacklist protection for important tokens
- Comprehensive error handling and logging

✅ **Services Architecture** (`src/services/`):
- `feeService.ts`: Fee calculation (5% of ~0.00203928 GOR per account)
- `accountService.ts`: Token account management
- `transactionService.ts`: Transaction building and validation
- Full test coverage with Jest

✅ **Frontend** (`frontend/`):
- Modern React SPA with Backpack wallet integration
- `BurnInterface.tsx`: Complete UI for scanning and burning accounts
- Real-time fee calculation display
- Transaction confirmation and status tracking
- Responsive design with dark/light theme support

✅ **Configuration Management**:
- Environment-based config (`src/config.ts`)
- Support for RPC_URL, WALLET, FEE_RECIPIENT, FEE_PERCENTAGE

**What's Missing for Contract Fulfillment:**

❌ **Protected API Endpoints**:
- No `GET /assets/:wallet` endpoint
- No `POST /build-burn-tx` endpoint
- No API authentication mechanism
- Current implementation is client-side only (wallet signs directly)

❌ **Backend Infrastructure**:
- Currently uses GitHub Pages (static hosting only)
- No server-side API layer
- No request authentication/authorization

❌ **Logging & Analytics**:
- Basic console logging exists, but no persistent storage
- No transaction tracking database
- No reconciliation reporting system
- No monthly fee split tracking

❌ **Fee Splitting**:
- Current implementation sends 100% of fee to single recipient
- No 50/50 split between Aether Labs and Gor-incinerator
- Vault addresses not configured for dual recipients

❌ **API-First Architecture**:
- Frontend directly builds and signs transactions
- No backend transaction building service
- No centralized logging of all operations

### Key Observations

1. **Solid Foundation**: The core burning logic, fee calculation, and frontend are well-implemented and tested.

2. **Architecture Gap**: The current architecture is purely client-side (wallet → blockchain). The contract requires a backend API layer (wallet → API → blockchain).

3. **Fee Logic Needs Update**: Current `FeeService` sends fee to one address. Need to split into two transfers (50% each).

4. **Gorbagana Compatibility**: Code uses Solana libraries but targets Gorbagana RPC. This is correct (Gorbagana is a Solana fork).

---

## 2. Proposed Architecture

### Hosting Stack: **Cloudflare Workers + Cloudflare Pages**

**Why Cloudflare?**
- ✅ True serverless with zero cold starts
- ✅ Global edge network (270+ cities) = lowest latency
- ✅ Auto-scaling from 0 to millions of requests
- ✅ Generous free tier (100k requests/day)
- ✅ Built-in DDoS protection
- ✅ Simple deployment from GitHub
- ✅ Integrated logging and analytics
- ✅ No server management required

### Architecture Diagram

```
┌─────────────────┐
│  Gorbag Wallet  │
│  (Aether Labs)  │
└────────┬────────┘
         │ API Key Header
         │ (x-api-key)
         ▼
┌─────────────────────────────────────────────────────────┐
│         Cloudflare Workers (API Backend)                │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  GET /assets/:wallet                              │  │
│  │  - Validate API key                               │  │
│  │  - Query Gorbagana RPC for token accounts         │  │
│  │  - Filter empty accounts (burn-eligible)          │  │
│  │  - Return JSON with burn-eligibility flags        │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  POST /build-burn-tx                              │  │
│  │  - Validate API key                               │  │
│  │  - Build burn transaction instructions            │  │
│  │  - Calculate 5% fee                               │  │
│  │  - Add TWO fee transfers (50/50 split):           │  │
│  │    • 2.5% → Aether Labs vault                     │  │
│  │    • 2.5% → Gor-incinerator vault                 │  │
│  │  - Return unsigned transaction for wallet signing │  │
│  │  - Log transaction details to D1 database         │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  GET /reconciliation/report                       │  │
│  │  - Admin-only endpoint                            │  │
│  │  - Query D1 for date range                        │  │
│  │  - Calculate totals and splits                    │  │
│  └──────────────────────────────────────────────────┘  │
└───────────────────┬──────────────────────────────────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │  Cloudflare D1       │
         │  (SQLite Database)   │
         │                      │
         │  - Transaction logs  │
         │  - Fee tracking      │
         │  - Reconciliation    │
         └──────────────────────┘

┌─────────────────────────────────────────────────────────┐
│         Cloudflare Pages (Frontend)                     │
│                                                          │
│  - React SPA (existing frontend)                        │
│  - Backpack wallet integration                          │
│  - Direct blockchain interaction (for public users)     │
│  - OR calls backend API (for Gorbag Wallet integration) │
└─────────────────────────────────────────────────────────┘
```

### Component Breakdown

#### **Backend: Cloudflare Workers**

**Location**: `/api` directory (new)

**Endpoints**:

1. **`GET /assets/:wallet`**
   - **Purpose**: List all burn-eligible token accounts for a wallet
   - **Auth**: Required (`x-api-key` header)
   - **Process**:
     - Connect to Gorbagana RPC (env: `GOR_RPC_URL`)
     - Call `getParsedTokenAccountsByOwner()`
     - Filter for balance === "0" and not in blacklist
     - Return structured JSON with burn-eligibility flags
   - **Response**:
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

2. **`POST /build-burn-tx`**
   - **Purpose**: Build unsigned burn transaction with fee splits
   - **Auth**: Required (`x-api-key` header)
   - **Input**:
     ```json
     {
       "wallet": "ABC123...",
       "accounts": ["DEF456...", "GHI789..."],
       "maxAccounts": 14
     }
     ```
   - **Process**:
     - Validate input (max 14 accounts per tx)
     - Build transaction instructions:
       - Compute budget instructions
       - Close account instructions for each selected account
       - **TWO** fee transfer instructions:
         - 2.5% of total rent → `GOR_VAULT_ADDRESS_AETHER`
         - 2.5% of total rent → `GOR_VAULT_ADDRESS_INCINERATOR`
     - Get recent blockhash
     - Compile to VersionedTransaction message
     - Serialize transaction (base64)
     - **Log to D1 database** (pending status)
   - **Response**:
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

3. **`GET /reconciliation/report?start=YYYY-MM-DD&end=YYYY-MM-DD`**
   - **Purpose**: Generate reconciliation report for date range
   - **Auth**: Admin API key (separate from wallet API key)
   - **Process**:
     - Query D1 for all transactions in date range
     - Aggregate totals:
       - Total transactions
       - Total accounts closed
       - Total fees collected
       - Split by party (Aether Labs vs Gor-incinerator)
   - **Response**:
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

#### **Database: Cloudflare D1 (SQLite)**

**Schema**:

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

CREATE INDEX idx_timestamp ON transactions(timestamp);
CREATE INDEX idx_wallet ON transactions(wallet);
CREATE INDEX idx_status ON transactions(status);
```

**Fields**:
- `id`: Auto-increment primary key
- `timestamp`: ISO 8601 timestamp
- `wallet`: User's wallet address
- `accounts_closed`: Number of accounts in this transaction
- `total_rent`: Total rent reclaimed (GOR)
- `service_fee`: Total 5% fee (GOR)
- `aether_labs_fee`: 2.5% to Aether Labs (GOR)
- `gor_incinerator_fee`: 2.5% to Gor-incinerator (GOR)
- `tx_hash`: On-chain transaction hash (populated after confirmation)
- `status`: `pending`, `confirmed`, `failed`
- `created_at`: Record creation timestamp

#### **Frontend: Cloudflare Pages**

**Location**: `/frontend` directory (existing)

**Changes Required**:
- Add environment variable for API base URL (`VITE_API_BASE_URL`)
- Update `BurnInterface.tsx` to optionally call backend API
- Add dual-mode support:
  - **Direct mode**: Current behavior (wallet signs directly)
  - **API mode**: Call backend endpoints (for Gorbag Wallet integration)
- Display fee breakdown (50/50 split)

**Deployment**:
- Connect GitHub repo to Cloudflare Pages
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables injected at build time

---

## 3. Implementation Plan

### Phase 1: Backend API Setup

1. **Create Worker Structure**
   - Initialize `api/` directory
   - Set up TypeScript + Wrangler config
   - Install dependencies (@solana/web3.js, @solana/spl-token)

2. **Implement Core Endpoints**
   - `GET /assets/:wallet`
   - `POST /build-burn-tx`
   - API key authentication middleware

3. **Fee Splitting Logic**
   - Modify fee service to create TWO transfer instructions
   - Calculate 2.5% for each vault address

### Phase 2: Database & Logging

1. **Create D1 Database**
   - Initialize database via Wrangler
   - Apply schema migrations

2. **Implement Logging**
   - Log all API requests
   - Store transaction details in D1
   - Add error tracking

3. **Reconciliation Endpoint**
   - Query and aggregate transaction data
   - Generate monthly reports

### Phase 3: Frontend Integration

1. **Environment Configuration**
   - Add API base URL to build config
   - Create separate configs for dev/prod

2. **Update Components**
   - Modify `BurnInterface.tsx` for API calls
   - Display fee breakdown (50/50 split)
   - Add error handling for API failures

### Phase 4: Deployment & Testing

1. **Deploy Workers**
   - Push to Cloudflare Workers
   - Configure secrets (API keys, vault addresses, RPC URL)

2. **Deploy Frontend**
   - Connect to Cloudflare Pages
   - Set environment variables
   - Deploy from GitHub

3. **End-to-End Testing**
   - Test API endpoints with curl/Postman
   - Test frontend integration
   - Verify fee splitting on-chain
   - Test reconciliation reports

---

## 4. Environment Variables

### Cloudflare Workers Secrets

```bash
# API Authentication
API_KEY=<secret_key_for_gorbag_wallet>
ADMIN_API_KEY=<secret_key_for_reconciliation>

# Gorbagana Blockchain
GOR_RPC_URL=https://rpc.gorbagana.com

# Vault Addresses (50/50 split)
GOR_VAULT_ADDRESS_AETHER=<aether_labs_wallet_address>
GOR_VAULT_ADDRESS_INCINERATOR=<gor_incinerator_wallet_address>

# Database
D1_DATABASE_ID=<cloudflare_d1_database_id>
```

### Cloudflare Pages Environment Variables

```bash
# API Backend URL
VITE_API_BASE_URL=https://api.gor-incinerator.fun

# Fee Recipient (for direct mode, optional)
VITE_FEE_RECIPIENT=<gor_incinerator_wallet_address>
```

---

## 5. Security Considerations

1. **API Key Protection**
   - Use Cloudflare Workers Secrets (never commit to repo)
   - Rotate keys regularly
   - Separate keys for wallet vs admin access

2. **No Private Keys on Backend**
   - Backend only builds unsigned transactions
   - User wallet signs on client side
   - No custody of user funds

3. **Rate Limiting**
   - Cloudflare automatic DDoS protection
   - Optional: Add custom rate limiting per API key

4. **Input Validation**
   - Validate wallet addresses (PublicKey format)
   - Limit accounts per transaction (max 14)
   - Sanitize all inputs

5. **CORS Configuration**
   - Allow Gorbag Wallet origin
   - Allow gor-incinerator.fun frontend

---

## 6. Advantages of This Architecture

✅ **Fully Serverless**: Zero server management, auto-scaling
✅ **Global Performance**: 270+ edge locations, <50ms latency worldwide
✅ **Cost-Effective**: Free tier covers 100k requests/day (~3M/month)
✅ **Contract Compliant**: Protected APIs, logging, fee splitting, reconciliation
✅ **Developer-Friendly**: Simple deployment, great DX with Wrangler CLI
✅ **Production-Ready**: Built-in monitoring, logging, and analytics
✅ **Secure**: Secrets management, DDoS protection, no private keys
✅ **Scalable**: Handles traffic spikes automatically

---

## Next Steps

1. Implement Worker API endpoints
2. Set up D1 database and schema
3. Update frontend for API integration
4. Create deployment configs (wrangler.toml)
5. Write deployment documentation
6. Test end-to-end flow
7. Generate usage examples and reconciliation scripts

