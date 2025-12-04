# Gor-Incinerator API Setup Guide

Complete guide for deploying and configuring the Gor-Incinerator API with Gorbagio NFT support.

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [Cloudflare account](https://dash.cloudflare.com/sign-up)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
- Gorbagana RPC access
- Two vault wallet addresses (Aether Labs + Gor-incinerator)
- Gorbagio NFT collection details

## Installation

### 1. Install Dependencies

```bash
cd api
npm install
```

### 2. Authenticate with Cloudflare

```bash
wrangler login
```

This opens a browser to authenticate your Cloudflare account.

---

## Database Setup

### 1. Create D1 Database

```bash
wrangler d1 create gor-incinerator-logs
```

**Output:**

```
✅ Successfully created DB 'gor-incinerator-logs'
Database ID: abc123-def456-ghi789
```

### 2. Update wrangler.toml

Copy the `database_id` from the output and paste it into `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "gor-incinerator-logs"
database_id = "abc123-def456-ghi789"  # <- Paste here
```

### 3. Run Database Migrations

```bash
wrangler d1 execute gor-incinerator-logs --file=./migrations/0001_create_transactions.sql
```

---

## Environment Configuration

### Required Secrets

Set all secrets using `wrangler secret put`:

#### 1. API Keys

```bash
# Generate API keys (use strong random strings)
wrangler secret put API_KEY
# Enter: [paste strong random string, e.g., from: openssl rand -base64 32]

wrangler secret put ADMIN_API_KEY
# Enter: [paste different strong random string]
```

**Save these API keys securely!** You'll need to provide the regular API_KEY to Gorbag Wallet team.

#### 2. Gorbagana RPC

```bash
wrangler secret put GOR_RPC_URL
# Enter: https://rpc.gorbagana.wtf
```

#### 3. Vault Addresses (Revenue Split)

You need two wallet addresses for the 50/50 revenue split:

```bash
wrangler secret put GOR_VAULT_ADDRESS_AETHER
# Enter: [Aether Labs vault address]

wrangler secret put GOR_VAULT_ADDRESS_INCINERATOR
# Enter: [Gor-incinerator vault address]
```

**IMPORTANT:** These addresses will receive 2.5% each (50/50 split of 5% total fee).

---

## Gorbagio NFT Configuration (Optional)

To enable 0% fees for Gorbagio NFT holders, configure at least one of these:

### Option 1: Collection Mint Address (Recommended)

If Gorbagio is a Metaplex Certified Collection:

```bash
wrangler secret put GORBAGIO_COLLECTION_MINT
# Enter: [Gorbagio collection mint address]
```

### Option 2: Creator Address

```bash
wrangler secret put GORBAGIO_CREATOR_ADDRESS
# Enter: [Gorbagio NFT creator address]
```

### Option 3: Update Authority

```bash
wrangler secret put GORBAGIO_UPDATE_AUTHORITY
# Enter: [Gorbagio update authority address]
```

### Option 4: Verified Mints Whitelist

For specific known Gorbagio NFT mints:

```bash
wrangler secret put GORBAGIO_VERIFIED_MINTS
# Enter: mint1,mint2,mint3  (comma-separated, no spaces)
```

**Note:** If no Gorbagio configuration is provided, the API will work normally but all users will pay 5% fees.

---

## Deployment

### Development Deployment

Test in a development environment first:

```bash
npm run deploy:dev
# or
wrangler deploy --env dev
```

**Dev URL:** `https://gor-incinerator-api-dev.your-subdomain.workers.dev`

### Production Deployment

```bash
npm run deploy
# or
wrangler deploy
```

**Production URL:** `https://gor-incinerator-api.your-subdomain.workers.dev`

---

## Custom Domain Setup

### 1. Add Custom Domain in Cloudflare

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to Workers & Pages > gor-incinerator-api
3. Click **Custom Domains** tab
4. Add: `api.gor-incinerator.fun`

### 2. Update wrangler.toml (Optional)

Uncomment and configure routes:

```toml
routes = [
  { pattern = "api.gor-incinerator.fun/*", zone_name = "gor-incinerator.fun" }
]
```

Redeploy:

```bash
wrangler deploy
```

---

## Verification & Testing

### 1. Health Check

```bash
curl https://api.gor-incinerator.fun/health
```

**Expected Response:**

```json
{
  "service": "Gor-Incinerator API",
  "version": "1.0.0",
  "status": "healthy"
}
```

### 2. Test Assets Endpoint

```bash
curl -H "x-api-key: YOUR_API_KEY" \
  https://api.gor-incinerator.fun/assets/WALLET_ADDRESS
```

### 3. Test with Gorbagio Holder

Use a wallet known to hold a Gorbagio NFT:

```bash
curl -H "x-api-key: YOUR_API_KEY" \
  https://api.gor-incinerator.fun/assets/GORBAGIO_HOLDER_WALLET
```

**Expected:** `gorbagioHolder: true` and `serviceFee: 0`

### 4. Test Transaction Building

```bash
curl -X POST https://api.gor-incinerator.fun/build-burn-tx \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "wallet": "WALLET_ADDRESS",
    "accounts": ["ACCOUNT1", "ACCOUNT2"],
    "maxAccounts": 14
  }'
```

---

## Monitoring & Logs

### View Live Logs

```bash
wrangler tail
```

### View D1 Database

```bash
# Query transactions
wrangler d1 execute gor-incinerator-logs --command "SELECT * FROM transactions LIMIT 10"

# Check totals
wrangler d1 execute gor-incinerator-logs --command "SELECT COUNT(*) as total, SUM(total_rent) as total_rent FROM transactions"
```

### Cloudflare Dashboard Analytics

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to Workers & Pages > gor-incinerator-api
3. View:
   - Request count
   - Error rate
   - CPU time
   - Invocation timeline

---

## Generate API Key for Gorbag Wallet

Use the provided script to generate a properly formatted API key:

```bash
node scripts/generate-api-key.js
```

**Output:**

```
Generated API Key: sk_live_abc123def456ghi789...

Share this API key with Gorbag Wallet team via secure channel.
```

Then set it as a secret:

```bash
wrangler secret put API_KEY
# Paste the generated key
```

---

## Security Checklist

- [ ] Strong random API keys generated (32+ characters)
- [ ] API_KEY shared with Gorbag Wallet team securely (encrypted channel)
- [ ] ADMIN_API_KEY kept private (only for internal reconciliation)
- [ ] Vault addresses verified on Gorbagana blockchain
- [ ] Gorbagio NFT configuration verified (test with known holder)
- [ ] Custom domain configured with HTTPS
- [ ] Rate limiting tested (100 req/min)
- [ ] CORS origins restricted to production domains
- [ ] Database migrations run successfully
- [ ] Monitoring and alerting configured

---

## Troubleshooting

### Error: "Invalid API key"

- Check if secret was set: `wrangler secret list`
- Verify API key in request header: `x-api-key: YOUR_KEY`

### Error: "Missing Aether Labs vault address"

```bash
wrangler secret put GOR_VAULT_ADDRESS_AETHER
wrangler secret put GOR_VAULT_ADDRESS_INCINERATOR
```

### Error: "Cannot connect to RPC"

- Verify GOR_RPC_URL is set correctly
- Test RPC manually: `curl https://rpc.gorbagana.wtf`

### Gorbagio NFT not detected

- Verify at least one Gorbagio configuration is set
- Check cache expiration (5 minute TTL)
- Test with known Gorbagio holder wallet
- Review logs: `wrangler tail`

### Database errors

```bash
# Verify database exists
wrangler d1 list

# Re-run migrations
wrangler d1 execute gor-incinerator-logs --file=./migrations/0001_create_transactions.sql
```

---

## Maintenance

### Update Secrets

```bash
wrangler secret put SECRET_NAME
```

### View All Secrets

```bash
wrangler secret list
```

### Delete Secret

```bash
wrangler secret delete SECRET_NAME
```

### Database Backup

```bash
# Export transactions to CSV
wrangler d1 execute gor-incinerator-logs \
  --command "SELECT * FROM transactions" \
  --output backup-$(date +%Y%m%d).csv
```

---

## Monthly Reconciliation

Use the reconciliation endpoint to generate reports:

```bash
# Get November 2025 report
curl -H "x-api-key: ADMIN_API_KEY" \
  "https://api.gor-incinerator.fun/reconciliation/report?start=2025-11-01&end=2025-11-30"
```

**Output:**

```json
{
  "summary": {
    "totalTransactions": 1250,
    "aetherLabsShare": 0.7647,
    "gorIncineratorShare": 0.7647
  }
}
```

Verify these amounts match on-chain vault balances.

---

## Partner Integration (Gorbag Wallet)

### Share with Gorbag Wallet Team:

1. **API Endpoint:** `https://api.gor-incinerator.fun`
2. **API Key:** `[Your generated API_KEY]`
3. **Documentation:** `/api/API_DOCUMENTATION.md`
4. **Support Contact:** [Your email/Discord]

### Integration Checklist:

- [ ] API endpoint accessible
- [ ] API key provided securely
- [ ] Documentation shared
- [ ] Test wallet transactions successful
- [ ] Gorbagio NFT discount verified
- [ ] Error handling tested
- [ ] Rate limits communicated
- [ ] Monitoring dashboard access (optional)

---

## Next Steps

1. ✅ Deploy API to production
2. ✅ Verify all endpoints work
3. ✅ Share API key with Gorbag Wallet team
4. ✅ Test integration end-to-end
5. ✅ Set up monitoring alerts
6. ✅ Schedule monthly reconciliation
7. ✅ Launch! 🚀

---

## Support

- **GitHub Issues:** [Repository URL]
- **Documentation:** See `API_DOCUMENTATION.md`
- **Logs:** `wrangler tail`
- **Status:** `curl https://api.gor-incinerator.fun/health`
