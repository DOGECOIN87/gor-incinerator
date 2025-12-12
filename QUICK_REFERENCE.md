# Gor-Incinerator Quick Reference

## API Keys (Store in Password Manager)

```
User API Key:  gorincin_a8026612e8c77bc7738ee5de0d1ebd906f21049c9ad2d964ee9a0b6e51c3f2d3
Admin API Key: gorincin_b911b5a0f3782b209ad493df12819893458844a4d42dbbce483c24e86cf12101
```

## Configuration Files

| File | Purpose | Status |
|------|---------|--------|
| `.env.secrets` | Master secrets (KEEP PRIVATE) | ✓ Created |
| `frontend/.env` | Frontend env vars (API mode) | ✓ Created |
| `api/wrangler.toml` | Worker config | Needs database ID |
| `setup-secrets.sh` | Auto secrets setup | ✓ Created |

## Vault Addresses (Fee Distribution)

- **Aether Labs**: `DvY73fC74Ny33Zu3ScA62VCSwrz1yV8kBysKu3rnLjvD`
- **Gor-Incinerator**: `BuRnX2HDP8s1CFdYwKpYCCshaZcTvFm3xjbmXPR3QsdG`

## Deployment Steps

```bash
# 1. Set Cloudflare Worker secrets
./setup-secrets.sh

# 2. Create D1 database
cd api
wrangler d1 create gor-incinerator-logs
# Copy the returned database ID and update wrangler.toml

# 3. Apply database migration
wrangler d1 execute gor-incinerator-logs --file ./migrations/0001_initial_schema.sql

# 4. Deploy API
npm install
npm run deploy

# 5. Deploy Frontend
cd ../frontend
npm install
npm run build
# Deploy dist/ to Cloudflare Pages

# 6. Test health endpoint
curl https://api.gor-incinerator.com/health
```

## Common API Calls

### Get Assets
```bash
curl -H "x-api-key: gorincin_a8026612e8c77bc7738ee5de0d1ebd906f21049c9ad2d964ee9a0b6e51c3f2d3" \
     https://api.gor-incinerator.com/assets/WALLET_ADDRESS
```

### Build Burn Tx
```bash
curl -X POST \
     -H "Content-Type: application/json" \
     -H "x-api-key: gorincin_a8026612e8c77bc7738ee5de0d1ebd906f21049c9ad2d964ee9a0b6e51c3f2d3" \
     -d '{"wallet":"ADDRESS","accounts":["ACC1"],"maxAccounts":14}' \
     https://api.gor-incinerator.com/build-burn-tx
```

### Get Reconciliation (Admin)
```bash
curl -H "x-api-key: gorincin_b911b5a0f3782b209ad493df12819893458844a4d42dbbce483c24e86cf12101" \
     "https://api.gor-incinerator.com/reconciliation/report?start=2025-01-01&end=2025-01-31"
```

## Environment Variables

**Frontend (.env)**:
- `VITE_API_BASE_URL` - Backend API URL
- `VITE_API_KEY` - User API key (NOT admin key)
- `VITE_MODE` - Set to "api" for API mode
- `VITE_GOR_VAULT_ADDRESS_AETHER` - Aether vault address
- `VITE_GOR_VAULT_ADDRESS_INCINERATOR` - Incinerator vault address

**Cloudflare Worker Secrets**:
- `API_KEY` - User API key
- `ADMIN_API_KEY` - Admin API key
- `GOR_RPC_URL` - Gorbagana RPC endpoint
- `GOR_VAULT_ADDRESS_AETHER` - Aether vault address
- `GOR_VAULT_ADDRESS_INCINERATOR` - Incinerator vault address

## Important Notes

⚠️ **SECURITY**:
- Never commit `.env.secrets` or `frontend/.env` to git
- Never expose the admin API key in client-side code
- Store all API keys in a password manager
- Regenerate keys if compromised

📝 **After Deployment**:
1. Verify health endpoint responds
2. Test each API route with sample wallet
3. Check that fees are correctly distributed
4. Review logs in Cloudflare dashboard
5. Set up monitoring/alerts

## Documentation

- `ENVIRONMENT_SETUP.md` - Full setup guide
- `docs/API_DEPLOYMENT_GUIDE.md` - API deployment details
- `api/README.md` - API service documentation
- `frontend/README_API_MODE.md` - Frontend API mode docs
- `docs/FEE_IMPLEMENTATION_SUMMARY.md` - Fee calculation details

## Support

If you encounter issues:
1. Check the Troubleshooting section in `ENVIRONMENT_SETUP.md`
2. Review Cloudflare Worker logs in the dashboard
3. Verify all environment variables are correctly set
4. Ensure database migration was applied successfully
