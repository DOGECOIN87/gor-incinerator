# API Deployment Guide - Gor-Incinerator

Complete step-by-step guide for deploying the Gor-Incinerator API to Cloudflare Workers.

## 📋 Prerequisites

Before starting deployment, ensure you have:

- [x] Cloudflare account (free tier works)
- [x] Node.js 18+ installed
- [x] Wrangler CLI installed (`npm install -g wrangler`)
- [x] Git repository access
- [x] API key generated for Gorbag Wallet
- [x] Admin API key generated for reconciliation
- [x] Gorbagana RPC URL
- [x] Vault addresses (Aether Labs + Gor-incinerator)

---

## 🚀 Step 1: Initial Setup

### 1.1 Clone Repository

```bash
git clone https://github.com/DOGECOIN87/gor-incinerator.git
cd gor-incinerator/api
```

### 1.2 Install Dependencies

```bash
npm install
```

### 1.3 Verify Installation

```bash
# Check Wrangler version
wrangler --version

# Check Node version
node --version  # Should be 18+
```

---

## 🔑 Step 2: Generate API Keys

### 2.1 Generate API Key for Gorbag Wallet

```bash
cd scripts
node generate-api-key.js --partner "Aether Labs"
```

**Output:**
```
═══════════════════════════════════════════════════════════════════════
  API KEY GENERATED
═══════════════════════════════════════════════════════════════════════

  Key ID:      a1b2c3d4
  Partner:     Aether Labs
  Created:     2025-01-15T10:30:00.000Z
  Length:      72 characters

  API Key:
  gorincin_a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456

═══════════════════════════════════════════════════════════════════════
```

**⚠️ IMPORTANT**: Save this API key securely. It will be shared with Aether Labs.

### 2.2 Generate Admin API Key

```bash
node generate-api-key.js --partner "Gor-Incinerator Admin"
```

**⚠️ IMPORTANT**: Save this admin key securely. It's for reconciliation access only.

---

## 🗄️ Step 3: Database Setup

### 3.1 Create D1 Database

```bash
cd /home/ubuntu/gor-incinerator/api
wrangler d1 create gor-incinerator-logs
```

**Output:**
```
✅ Successfully created DB 'gor-incinerator-logs'

[[d1_databases]]
binding = "DB"
database_name = "gor-incinerator-logs"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 3.2 Update wrangler.toml

Copy the `database_id` from the output and update `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "gor-incinerator-logs"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  # ← Paste your ID here
```

### 3.3 Apply Database Migration

```bash
wrangler d1 execute gor-incinerator-logs --file=./migrations/0001_initial_schema.sql
```

**Output:**
```
🌀 Executing on gor-incinerator-logs (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx):
🌀 To execute on your local development database, pass the --local flag to 'wrangler d1 execute'
🚣 Executed 6 commands in 0.123ms
```

### 3.4 Verify Database Schema

```bash
wrangler d1 execute gor-incinerator-logs --command "SELECT name FROM sqlite_master WHERE type='table';"
```

**Expected Output:**
```
┌──────────────────┐
│ name             │
├──────────────────┤
│ transactions     │
└──────────────────┘
```

---

## 🔐 Step 4: Configure Secrets

### 4.1 Set API Key

```bash
wrangler secret put API_KEY
```

When prompted, paste the API key generated for Gorbag Wallet:
```
gorincin_a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

### 4.2 Set Admin API Key

```bash
wrangler secret put ADMIN_API_KEY
```

Paste the admin API key generated earlier.

### 4.3 Set Gorbagana RPC URL

```bash
wrangler secret put GOR_RPC_URL
```

Enter the Gorbagana RPC endpoint:
```
https://rpc.gorbagana.com
```

### 4.4 Set Aether Labs Vault Address

```bash
wrangler secret put GOR_VAULT_ADDRESS_AETHER
```

Enter the Aether Labs vault address (to be provided by Aether Labs):
```
AetherLabsVault111111111111111111111111111
```

### 4.5 Set Gor-Incinerator Vault Address

```bash
wrangler secret put GOR_VAULT_ADDRESS_INCINERATOR
```

Enter your Gor-incinerator vault address:
```
IncineratorVault11111111111111111111111111
```

### 4.6 Verify Secrets

```bash
wrangler secret list
```

**Expected Output:**
```
[
  {
    "name": "API_KEY",
    "type": "secret_text"
  },
  {
    "name": "ADMIN_API_KEY",
    "type": "secret_text"
  },
  {
    "name": "GOR_RPC_URL",
    "type": "secret_text"
  },
  {
    "name": "GOR_VAULT_ADDRESS_AETHER",
    "type": "secret_text"
  },
  {
    "name": "GOR_VAULT_ADDRESS_INCINERATOR",
    "type": "secret_text"
  }
]
```

---

## 🧪 Step 5: Local Testing

### 5.1 Start Local Dev Server

```bash
npm run dev
```

**Output:**
```
⎔ Starting local server...
[wrangler:inf] Ready on http://localhost:8787
```

### 5.2 Test Health Endpoint

```bash
curl http://localhost:8787/health
```

**Expected Response:**
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

### 5.3 Test Assets Endpoint

```bash
curl -H "x-api-key: YOUR_API_KEY" \
  http://localhost:8787/assets/8xKZFz7qJR2H9PmVJW3nN4kLdMqY6tBsC1rEfGhUiSoP
```

### 5.4 Test Build Transaction Endpoint

```bash
curl -X POST http://localhost:8787/build-burn-tx \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "wallet": "8xKZFz7qJR2H9PmVJW3nN4kLdMqY6tBsC1rEfGhUiSoP",
    "accounts": ["DzP3K8vQZ2nM5xLrT9wY1jH4sB6cF8dE7gA2hN9pK3qR"],
    "maxAccounts": 14
  }'
```

---

## 🌐 Step 6: Deploy to Production

### 6.1 Deploy Worker

```bash
npm run deploy
```

**Output:**
```
⛅️ wrangler 3.x.x
------------------
Total Upload: xx.xx KiB / gzip: xx.xx KiB
Uploaded gor-incinerator-api (x.xx sec)
Published gor-incinerator-api (x.xx sec)
  https://gor-incinerator-api.YOUR_SUBDOMAIN.workers.dev
```

### 6.2 Test Production Deployment

```bash
# Test health endpoint
curl https://gor-incinerator-api.YOUR_SUBDOMAIN.workers.dev/health

# Test with API key
curl -H "x-api-key: YOUR_API_KEY" \
  https://gor-incinerator-api.YOUR_SUBDOMAIN.workers.dev/assets/8xKZFz7qJR2H9PmVJW3nN4kLdMqY6tBsC1rEfGhUiSoP
```

---

## 🌍 Step 7: Custom Domain Setup

### 7.1 Add Custom Domain in Cloudflare Dashboard

1. Go to **Cloudflare Dashboard** → **Workers & Pages**
2. Click on **gor-incinerator-api**
3. Go to **Settings** → **Domains & Routes**
4. Click **Add Custom Domain**
5. Enter: `api.gor-incinerator.fun`
6. Click **Add Domain**

### 7.2 Verify DNS Configuration

Cloudflare will automatically create the necessary DNS records. Verify:

```bash
dig api.gor-incinerator.fun
```

### 7.3 Test Custom Domain

```bash
curl https://api.gor-incinerator.fun/health
```

---

## 📊 Step 8: Monitoring Setup

### 8.1 View Logs

```bash
# Tail logs in real-time
npm run tail

# Or with wrangler directly
wrangler tail
```

### 8.2 Check Metrics in Dashboard

1. Go to **Cloudflare Dashboard** → **Workers & Pages**
2. Click on **gor-incinerator-api**
3. View **Metrics** tab for:
   - Requests per second
   - Success rate
   - Error rate
   - CPU time
   - Duration

### 8.3 Set Up Alerts

1. Go to **Notifications** in Cloudflare Dashboard
2. Create alerts for:
   - Error rate > 5%
   - Request rate spike
   - Worker failure

---

## 🧪 Step 9: Post-Deployment Testing

### 9.1 Test All Endpoints

```bash
# Health check
curl https://api.gor-incinerator.fun/health

# Get assets
curl -H "x-api-key: YOUR_API_KEY" \
  https://api.gor-incinerator.fun/assets/WALLET_ADDRESS

# Build transaction
curl -X POST https://api.gor-incinerator.fun/build-burn-tx \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"wallet": "WALLET", "accounts": ["ACCOUNT"]}'

# Reconciliation (admin only)
curl -H "x-api-key: YOUR_ADMIN_API_KEY" \
  "https://api.gor-incinerator.fun/reconciliation/report?start=2025-01-01&end=2025-01-31"
```

### 9.2 Test Error Handling

```bash
# Test invalid API key
curl -H "x-api-key: invalid" \
  https://api.gor-incinerator.fun/assets/WALLET_ADDRESS
# Expected: 401 Unauthorized

# Test invalid wallet
curl -H "x-api-key: YOUR_API_KEY" \
  https://api.gor-incinerator.fun/assets/invalid
# Expected: 400 Bad Request
```

### 9.3 Test Rate Limiting

```bash
# Make 101 requests in quick succession
for i in {1..101}; do
  curl -H "x-api-key: YOUR_API_KEY" \
    https://api.gor-incinerator.fun/health
done
# Last request should return 429 (if rate limiting is implemented)
```

---

## 📝 Step 10: Documentation & Handoff

### 10.1 Provide to Aether Labs

Create a document with:

1. **API Base URL**: `https://api.gor-incinerator.fun`
2. **API Key**: `gorincin_[generated_key]`
3. **Rate Limit**: 100 requests per minute
4. **Integration Guide**: Link to `GORBAG_WALLET_INTEGRATION.md`
5. **Support Contact**: GitHub Issues or email

### 10.2 Internal Documentation

Document for your team:

1. **Admin API Key**: (stored securely)
2. **Vault Addresses**: Both Aether Labs and Gor-incinerator
3. **Cloudflare Account**: Login details
4. **Database ID**: D1 database identifier
5. **Deployment Process**: This guide
6. **Monitoring Dashboard**: Cloudflare Workers dashboard link

---

## 🔄 Updating the API

### Update Code

```bash
# Pull latest changes
git pull origin main

# Install dependencies
cd api
npm install

# Test locally
npm run dev

# Deploy to production
npm run deploy
```

### Update Secrets

```bash
# Update a secret
wrangler secret put SECRET_NAME

# Delete a secret
wrangler secret delete SECRET_NAME
```

### Update Database Schema

```bash
# Create new migration file
# api/migrations/0002_add_new_field.sql

# Apply migration
wrangler d1 execute gor-incinerator-logs --file=./migrations/0002_add_new_field.sql
```

---

## 🚨 Troubleshooting

### Issue: Deployment fails

**Solution:**
```bash
# Check wrangler version
wrangler --version

# Update wrangler
npm install -g wrangler@latest

# Clear cache and retry
rm -rf node_modules package-lock.json
npm install
npm run deploy
```

### Issue: Database not accessible

**Solution:**
```bash
# Verify database exists
wrangler d1 list

# Check database ID in wrangler.toml
cat wrangler.toml | grep database_id

# Re-apply migrations
wrangler d1 execute gor-incinerator-logs --file=./migrations/0001_initial_schema.sql
```

### Issue: Secrets not working

**Solution:**
```bash
# List secrets
wrangler secret list

# Delete and re-add secret
wrangler secret delete SECRET_NAME
wrangler secret put SECRET_NAME

# Verify deployment after updating secrets
npm run deploy
```

### Issue: CORS errors

**Solution:**
Check `api/src/middleware/cors.ts` and ensure allowed origins are configured correctly.

### Issue: High error rate

**Solution:**
```bash
# Check logs
wrangler tail

# Check Cloudflare dashboard for error details
# Review recent deployments
# Rollback if necessary
```

---

## 📊 Monitoring & Maintenance

### Daily Tasks

- [ ] Check error rate in Cloudflare dashboard
- [ ] Review logs for any issues
- [ ] Monitor transaction success rate

### Weekly Tasks

- [ ] Review API usage metrics
- [ ] Check database size
- [ ] Update dependencies if needed
- [ ] Review and respond to GitHub issues

### Monthly Tasks

- [ ] Generate reconciliation report
- [ ] Review fee distribution
- [ ] Security audit
- [ ] Performance optimization review
- [ ] Update documentation

---

## 🔒 Security Best Practices

1. **Never commit secrets to Git**
2. **Rotate API keys every 90 days**
3. **Use separate keys for dev/prod**
4. **Monitor for unusual API usage**
5. **Keep dependencies updated**
6. **Review logs regularly**
7. **Enable Cloudflare security features**
8. **Implement rate limiting**
9. **Use HTTPS only**
10. **Backup database regularly**

---

## 📞 Support

### Internal Support

- **Deployment Issues**: Check this guide
- **Code Issues**: Review GitHub repository
- **Infrastructure Issues**: Check Cloudflare dashboard

### External Support

- **Cloudflare Workers**: https://developers.cloudflare.com/workers/
- **Wrangler CLI**: https://developers.cloudflare.com/workers/wrangler/
- **D1 Database**: https://developers.cloudflare.com/d1/

---

## ✅ Deployment Checklist

### Pre-Deployment

- [ ] Repository cloned
- [ ] Dependencies installed
- [ ] API keys generated
- [ ] D1 database created
- [ ] Database migration applied
- [ ] Secrets configured
- [ ] Local testing completed

### Deployment

- [ ] Deployed to Cloudflare Workers
- [ ] Custom domain configured
- [ ] DNS verified
- [ ] Production testing completed
- [ ] Error handling tested
- [ ] Rate limiting verified

### Post-Deployment

- [ ] Monitoring set up
- [ ] Alerts configured
- [ ] Documentation provided to Aether Labs
- [ ] Internal documentation updated
- [ ] Team notified
- [ ] Backup procedures documented

---

## 📄 Appendix: Environment Variables

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `API_KEY` | Secret | API key for Gorbag Wallet | `gorincin_abc123...` |
| `ADMIN_API_KEY` | Secret | Admin key for reconciliation | `gorincin_xyz789...` |
| `GOR_RPC_URL` | Secret | Gorbagana RPC endpoint | `https://rpc.gorbagana.com` |
| `GOR_VAULT_ADDRESS_AETHER` | Secret | Aether Labs vault address | `AetherVault111...` |
| `GOR_VAULT_ADDRESS_INCINERATOR` | Secret | Gor-incinerator vault | `IncineratorVault111...` |
| `ENVIRONMENT` | Variable | Environment name | `production` |

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Deployed By**: [Your Name]  
**Deployment Date**: [Date]
