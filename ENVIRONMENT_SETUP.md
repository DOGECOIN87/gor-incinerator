# Gor-Incinerator Environment Setup Guide

This guide walks you through setting up your Gor-Incinerator deployment with all required secrets and environment variables.

## Overview

Your Gor-Incinerator deployment requires:
- **API Keys**: For authentication to the backend API
- **Cloudflare Worker Secrets**: For the deployed backend
- **Frontend Environment Variables**: For the React frontend in API mode
- **Database Configuration**: For transaction logging

## Generated API Keys

Two API keys have been generated for your deployment:

| Purpose | Partner Name | API Key | Key ID |
|---------|-------------|---------|--------|
| User API Key | Gorbag Wallet | `REDACTED_USER_API_KEY` | `2ee20e3c` |
| Admin Key | Admin | `REDACTED_ADMIN_API_KEY` | `11c539f5` |

**IMPORTANT**: 
- Store these values in a password manager or secure secret store
- Never hard-code them in your repository
- Never expose the admin key in client-side code
- The admin key grants access to reconciliation reports

## Step 1: Set Up Cloudflare Worker Secrets

The secrets configuration file (`.env.secrets`) has been created with the required values. This file should **NEVER** be committed to version control.

### Option A: Using the Provided Setup Script

```bash
chmod +x setup-secrets.sh
./setup-secrets.sh
```

This script will:
1. Validate that Wrangler CLI is installed
2. Load secrets from `.env.secrets`
3. Use `wrangler secret put` to set each secret in your Cloudflare Workers environment

### Option B: Manual Secret Configuration

If you prefer to set secrets manually:

```bash
# Navigate to the API directory
cd api

# Set each secret when prompted
wrangler secret put API_KEY
# Paste: REDACTED_USER_API_KEY

wrangler secret put ADMIN_API_KEY
# Paste: REDACTED_ADMIN_API_KEY

wrangler secret put GOR_RPC_URL
# Paste: https://rpc.gorbagana.wtf

wrangler secret put GOR_VAULT_ADDRESS_AETHER
# Paste: DvY73fC74Ny33Zu3ScA62VCSwrz1yV8kBysKu3rnLjvD

wrangler secret put GOR_VAULT_ADDRESS_INCINERATOR
# Paste: BuRnX2HDP8s1CFdYwKpYCCshaZcTvFm3xjbmXPR3QsdG
```

### Vault Addresses

The fee distribution is split 50/50 between:
- **Aether Labs Vault**: `DvY73fC74Ny33Zu3ScA62VCSwrz1yV8kBysKu3rnLjvD`
- **Gor-Incinerator Vault**: `BuRnX2HDP8s1CFdYwKpYCCshaZcTvFm3xjbmXPR3QsdG`

## Step 2: Frontend Environment Variables

The frontend `.env` file has been created at `frontend/.env` with API mode configuration.

**Current values**:
```
VITE_API_BASE_URL=https://api.gor-incinerator.com
VITE_API_KEY=REDACTED_USER_API_KEY
VITE_GOR_VAULT_ADDRESS_AETHER=DvY73fC74Ny33Zu3ScA62VCSwrz1yV8kBysKu3rnLjvD
VITE_GOR_VAULT_ADDRESS_INCINERATOR=BuRnX2HDP8s1CFdYwKpYCCshaZcTvFm3xjbmXPR3QsdG
VITE_MODE=api
```

**Notes**:
- This configuration uses the **user API key**, not the admin key
- The `VITE_MODE=api` tells the frontend to call your backend API
- The vault addresses must match those configured in your Cloudflare Worker secrets
- The frontend will send requests to `VITE_API_BASE_URL` with the API key in the `x-api-key` header

## Step 3: Database Configuration

1. Create a D1 database in the Cloudflare dashboard:
   ```bash
   wrangler d1 create gor-incinerator-logs
   ```

2. Copy the returned database ID and update `api/wrangler.toml`:
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "gor-incinerator-logs"
   database_id = "YOUR_DATABASE_ID"
   ```

3. Apply the initial migration:
   ```bash
   cd api
   wrangler d1 execute gor-incinerator-logs --file ./migrations/0001_initial_schema.sql
   ```

## Step 4: Deploy

### Deploy the API (Cloudflare Worker)

```bash
cd api
npm install
npm run deploy
```

### Deploy the Frontend

For Cloudflare Pages:

```bash
cd frontend
npm install
npm run build
# Deploy the dist/ folder to Cloudflare Pages
```

For local development:

```bash
cd frontend
npm install
npm run dev
# Open http://localhost:5173
```

## Step 5: Verification

### Test Health Endpoint

```bash
curl https://api.gor-incinerator.com/health
```

Expected response: `{"status":"ok","timestamp":"2025-...","environment":"production"}`

### Get Burn-Eligible Assets

```bash
curl -H "x-api-key: REDACTED_USER_API_KEY" \
   https://api.gor-incinerator.com/assets/YOUR_WALLET_ADDRESS
```

### Build a Burn Transaction

```bash
curl -X POST \
     -H "Content-Type: application/json" \
   -H "x-api-key: REDACTED_USER_API_KEY" \
     -d '{"wallet":"YOUR_WALLET_ADDRESS","accounts":["ACC1","ACC2"],"maxAccounts":14}' \
     https://api.gor-incinerator.com/build-burn-tx
```

### Generate Reconciliation Report (Admin Only)

```bash
curl -H "x-api-key: REDACTED_ADMIN_API_KEY" \
   "https://api.gor-incinerator.com/reconciliation/report?start=2025-01-01&end=2025-01-31"
```

## Files Created/Modified

- ✓ `.env.secrets` - Master secrets file (keep private)
- ✓ `frontend/.env` - Frontend environment variables for API mode
- ✓ `setup-secrets.sh` - Automated secrets configuration script

## Security Checklist

- [ ] Stored API keys in a password manager
- [ ] Added `.env.secrets` to `.gitignore` (prevent accidental commits)
- [ ] Verified admin key is NOT in frontend code/environment
- [ ] Configured CORS settings in `api/src/middleware/cors.ts`
- [ ] Set up database backups for D1
- [ ] Reviewed allowed origins in API configuration
- [ ] Tested health endpoint after deployment

## Troubleshooting

### "wrangler: command not found"
Install Wrangler globally: `npm install -g wrangler`

### Secrets Not Available in Worker
- Ensure secrets were set with `wrangler secret put`
- Redeploy the worker after setting secrets: `npm run deploy`
- Check that your environment is logged in: `wrangler whoami`

### Database Connection Errors
- Verify the database ID in `api/wrangler.toml` matches the created database
- Check that migrations have been applied: `wrangler d1 list`
- Ensure your Cloudflare plan supports D1

### Frontend Can't Reach API
- Verify `VITE_API_BASE_URL` matches your deployed worker URL
- Check CORS configuration in `api/src/middleware/cors.ts`
- Verify the API key is correctly set in `VITE_API_KEY`

## Next Steps

1. Review the API documentation in `docs/API_DEPLOYMENT_GUIDE.md`
2. Check the fee implementation details in `docs/FEE_INTEGRATION_GUIDE.md`
3. Set up monitoring and logging for your deployed worker
4. Configure custom domain in Cloudflare if using a custom domain
5. Review CORS and security settings for your specific use case

## Additional Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [D1 Database Documentation](https://developers.cloudflare.com/d1/)
- `api/README.md` - API-specific setup instructions
- `frontend/README_API_MODE.md` - Frontend API mode documentation
- `docs/FEE_IMPLEMENTATION_SUMMARY.md` - Fee calculation details
