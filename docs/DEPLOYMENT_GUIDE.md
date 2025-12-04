# Gor-Incinerator Deployment Guide

Complete step-by-step guide for deploying the Gor-Incinerator API and frontend to Cloudflare Workers + Pages.

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) 18 or higher
- [Cloudflare account](https://dash.cloudflare.com/sign-up) (free tier works)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed globally
- GitHub account (for Pages deployment)
- Gorbagana wallet addresses for vault addresses

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/DOGECOIN87/gor-incinerator.git
cd gor-incinerator

# Deploy API backend
cd api
npm install
wrangler login
wrangler d1 create gor-incinerator-logs
# Update wrangler.toml with database_id
wrangler d1 execute gor-incinerator-logs --file=./migrations/0001_initial_schema.sql
wrangler secret put API_KEY
wrangler secret put ADMIN_API_KEY
wrangler secret put GOR_RPC_URL
wrangler secret put GOR_VAULT_ADDRESS_AETHER
wrangler secret put GOR_VAULT_ADDRESS_INCINERATOR
wrangler deploy

# Deploy frontend
# (Configure via Cloudflare Pages dashboard)
```

---

## Part 1: Backend API Deployment (Cloudflare Workers)

### Step 1: Install Dependencies

```bash
cd api
npm install
```

### Step 2: Authenticate with Cloudflare

```bash
wrangler login
```

This opens a browser window for authentication.

### Step 3: Create D1 Database

```bash
wrangler d1 create gor-incinerator-logs
```

**Output**:
```
✅ Successfully created DB 'gor-incinerator-logs'

[[d1_databases]]
binding = "DB"
database_name = "gor-incinerator-logs"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**Copy the `database_id` and update `wrangler.toml`**:

```toml
[[d1_databases]]
binding = "DB"
database_name = "gor-incinerator-logs"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  # <-- Paste here
```

### Step 4: Apply Database Migrations

```bash
wrangler d1 execute gor-incinerator-logs --file=./migrations/0001_initial_schema.sql
```

**Verify**:
```bash
wrangler d1 execute gor-incinerator-logs --command="SELECT * FROM transactions LIMIT 1"
```

### Step 5: Configure Secrets

Set all required secrets via Wrangler CLI:

#### API_KEY (for Gorbag Wallet)

```bash
wrangler secret put API_KEY
```

Enter a secure random string (e.g., generate with `openssl rand -hex 32`).

#### ADMIN_API_KEY (for reconciliation)

```bash
wrangler secret put ADMIN_API_KEY
```

Enter a different secure random string.

#### GOR_RPC_URL (Gorbagana RPC endpoint)

```bash
wrangler secret put GOR_RPC_URL
```

Enter: `https://rpc.gorbagana.com` (or your custom RPC URL)

#### GOR_VAULT_ADDRESS_AETHER (Aether Labs vault)

```bash
wrangler secret put GOR_VAULT_ADDRESS_AETHER
```

Enter Aether Labs' Gorbagana wallet address for receiving 2.5% fee.

#### GOR_VAULT_ADDRESS_INCINERATOR (Gor-incinerator vault)

```bash
wrangler secret put GOR_VAULT_ADDRESS_INCINERATOR
```

Enter your Gorbagana wallet address for receiving 2.5% fee.

### Step 6: Test Locally

```bash
npm run dev
```

**Test endpoints**:

```bash
# Health check
curl http://localhost:8787/health

# Test assets endpoint (replace with real wallet and API key)
curl -X GET "http://localhost:8787/assets/YOUR_WALLET_ADDRESS" \
  -H "x-api-key: YOUR_API_KEY"
```

### Step 7: Deploy to Production

```bash
npm run deploy
```

**Output**:
```
✨ Successfully deployed to https://gor-incinerator-api.YOUR_SUBDOMAIN.workers.dev
```

### Step 8: Configure Custom Domain (Optional)

1. Go to [Cloudflare Workers Dashboard](https://dash.cloudflare.com/)
2. Select your worker: `gor-incinerator-api`
3. Go to **Settings** → **Triggers** → **Custom Domains**
4. Click **Add Custom Domain**
5. Enter: `api.gor-incinerator.fun`
6. Click **Add Custom Domain**

Cloudflare automatically provisions SSL certificate.

### Step 9: Verify Deployment

```bash
# Health check
curl https://api.gor-incinerator.fun/health

# Test with real API key
curl -X GET "https://api.gor-incinerator.fun/assets/YOUR_WALLET" \
  -H "x-api-key: YOUR_API_KEY"
```

### Step 10: Save API Keys

**Save these securely** (you'll need them for frontend and Gorbag Wallet):

```bash
# API Key (for Gorbag Wallet)
API_KEY=<your_api_key>

# Admin API Key (for reconciliation)
ADMIN_API_KEY=<your_admin_api_key>

# API URL
API_URL=https://api.gor-incinerator.fun
```

---

## Part 2: Frontend Deployment (Cloudflare Pages)

### Method A: Deploy via Cloudflare Dashboard (Recommended)

#### Step 1: Connect GitHub Repository

1. Go to [Cloudflare Pages Dashboard](https://dash.cloudflare.com/?to=/:account/pages)
2. Click **Create a project**
3. Click **Connect to Git**
4. Select **GitHub** and authorize Cloudflare
5. Select repository: `DOGECOIN87/gor-incinerator`
6. Click **Begin setup**

#### Step 2: Configure Build Settings

**Project name**: `gor-incinerator`

**Production branch**: `main`

**Framework preset**: `Vite`

**Build command**: `npm run build`

**Build output directory**: `dist`

**Root directory**: `frontend`

#### Step 3: Set Environment Variables

Click **Add environment variable** for each:

```bash
VITE_API_BASE_URL=https://api.gor-incinerator.fun
VITE_API_KEY=<your_api_key>
VITE_GOR_VAULT_ADDRESS_AETHER=<aether_vault_address>
VITE_GOR_VAULT_ADDRESS_INCINERATOR=<incinerator_vault_address>
VITE_GOR_RPC_URL=https://rpc.gorbagana.com
VITE_MODE=api
```

#### Step 4: Deploy

Click **Save and Deploy**

Cloudflare Pages will:
- Clone your repository
- Install dependencies
- Build the frontend
- Deploy to global CDN

**Deployment URL**: `https://gor-incinerator.pages.dev`

#### Step 5: Configure Custom Domain

1. Go to **Custom domains** tab
2. Click **Set up a custom domain**
3. Enter: `gor-incinerator.fun`
4. Click **Continue**
5. Follow DNS instructions (add CNAME record)

### Method B: Deploy via Wrangler CLI

```bash
cd frontend

# Install dependencies
npm install

# Build
npm run build

# Deploy
wrangler pages deploy dist --project-name=gor-incinerator
```

---

## Part 3: Verification & Testing

### Test Backend API

#### 1. Health Check

```bash
curl https://api.gor-incinerator.fun/health
```

**Expected**:
```json
{
  "service": "Gor-Incinerator API",
  "version": "1.0.0",
  "status": "healthy"
}
```

#### 2. Test GET /assets/:wallet

```bash
curl -X GET "https://api.gor-incinerator.fun/assets/YOUR_WALLET_ADDRESS" \
  -H "x-api-key: YOUR_API_KEY"
```

**Expected**:
```json
{
  "wallet": "ABC123...",
  "accounts": [...],
  "summary": {
    "totalAccounts": 15,
    "burnEligible": 15,
    "totalRent": 0.03058920,
    "serviceFee": 0.00152946,
    "youReceive": 0.02905974
  }
}
```

#### 3. Test POST /build-burn-tx

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

**Expected**:
```json
{
  "transaction": "base64_encoded_transaction",
  "accountsToClose": 2,
  "totalRent": 0.00407856,
  "serviceFee": 0.00020393,
  "feeBreakdown": {
    "aetherLabs": 0.00010196,
    "gorIncinerator": 0.00010196
  },
  "youReceive": 0.00387463,
  "blockhash": "...",
  "requiresSignatures": ["YOUR_WALLET_ADDRESS"]
}
```

#### 4. Test Reconciliation (Admin)

```bash
curl -X GET "https://api.gor-incinerator.fun/reconciliation/report?start=2025-01-01&end=2025-01-31" \
  -H "x-api-key: YOUR_ADMIN_API_KEY"
```

### Test Frontend

1. Visit `https://gor-incinerator.fun`
2. Click **Connect Backpack Wallet**
3. Authorize connection
4. Frontend should scan for empty accounts
5. Click **Burn X Accounts**
6. Sign transaction in wallet
7. Verify transaction on Gorbagana explorer

### Test End-to-End Flow

1. **Scan**: Frontend calls `GET /assets/:wallet`
2. **Build**: Frontend calls `POST /build-burn-tx`
3. **Sign**: User signs transaction in wallet
4. **Broadcast**: Transaction sent to Gorbagana blockchain
5. **Verify**: Check transaction on explorer
6. **Reconciliation**: Run reconciliation script to verify fee split

---

## Part 4: Monitoring & Maintenance

### View Logs

```bash
# Real-time logs
wrangler tail gor-incinerator-api

# Filter by status
wrangler tail gor-incinerator-api --status error
```

### Query Database

```bash
# View recent transactions
wrangler d1 execute gor-incinerator-logs --command="SELECT * FROM transactions ORDER BY created_at DESC LIMIT 10"

# Count by status
wrangler d1 execute gor-incinerator-logs --command="SELECT status, COUNT(*) as count FROM transactions GROUP BY status"
```

### Run Reconciliation

```bash
cd api/scripts

# Set admin API key
export ADMIN_API_KEY=your_admin_api_key

# Generate report
./reconciliation.sh 2025-01-01 2025-01-31

# Or use Python version
python3 reconciliation.py 2025-01-01 2025-01-31
```

### Update Secrets

```bash
# Rotate API key
wrangler secret put API_KEY

# Update vault address
wrangler secret put GOR_VAULT_ADDRESS_AETHER
```

### Redeploy

```bash
# Backend
cd api
wrangler deploy

# Frontend (auto-deploys on git push)
git push origin main
```

---

## Part 5: Troubleshooting

### API Returns 401 Unauthorized

- Verify API key is correct
- Check `x-api-key` header is included
- Ensure secret was set: `wrangler secret list`

### Database Errors

- Verify database_id in `wrangler.toml`
- Check migrations applied: `wrangler d1 execute gor-incinerator-logs --command="SELECT name FROM sqlite_master WHERE type='table'"`

### Frontend Not Connecting

- Check `VITE_API_BASE_URL` is correct
- Verify CORS headers in API
- Check browser console for errors

### Transaction Fails

- Verify wallet has sufficient GOR
- Check RPC URL is correct
- Ensure vault addresses are valid Gorbagana addresses

### Reconciliation Script Fails

- Verify `ADMIN_API_KEY` is set
- Check API URL is correct
- Ensure date format is YYYY-MM-DD

---

## Part 6: Production Checklist

Before going live:

- [ ] API deployed to Cloudflare Workers
- [ ] D1 database created and migrated
- [ ] All secrets configured (API_KEY, ADMIN_API_KEY, RPC_URL, vault addresses)
- [ ] Custom domain configured (api.gor-incinerator.fun)
- [ ] API endpoints tested (health, assets, build-burn-tx, reconciliation)
- [ ] Frontend deployed to Cloudflare Pages
- [ ] Frontend environment variables set
- [ ] Custom domain configured (gor-incinerator.fun)
- [ ] End-to-end flow tested (scan → build → sign → broadcast)
- [ ] Reconciliation script tested
- [ ] API keys shared with Aether Labs (for Gorbag Wallet)
- [ ] Vault addresses confirmed in writing
- [ ] Monitoring and logging enabled

---

## Part 7: Sharing with Aether Labs

Provide Aether Labs with:

### API Credentials

```
API Base URL: https://api.gor-incinerator.fun
API Key: <your_api_key>
```

### API Documentation

Share `api/README.md` with:
- Endpoint specifications
- Request/response examples
- Authentication details
- Error handling

### Integration Guide

Share `frontend/README_API_MODE.md` with:
- Integration flow
- Code examples
- Fee breakdown format

### Vault Addresses

Confirm in writing:
```
Aether Labs Vault: <aether_vault_address>
Gor-incinerator Vault: <incinerator_vault_address>
```

---

## 📚 Additional Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [Solana Web3.js Docs](https://solana-labs.github.io/solana-web3.js/)

## 🤝 Support

- **API Issues**: Check `api/README.md`
- **Frontend Issues**: Check `frontend/README_API_MODE.md`
- **Deployment Issues**: Check Cloudflare dashboard logs
- **Contract Questions**: Refer to partnership agreement

## 📄 License

ISC License
