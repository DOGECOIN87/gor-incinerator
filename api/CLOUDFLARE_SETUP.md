# Cloudflare API Setup

## Authentication Configured

The Cloudflare API token has been successfully configured for the `gor-incinerator-api` worker.

### Account Details
- **Account Name**: Gor-Incinerator
- **Account ID**: bc7193edb20db7abc93d823fe0e6feff
- **Worker Name**: gor-incinerator-api

### API Token
The Cloudflare API token is stored in `api/.env`:
```
CLOUDFLARE_API_TOKEN=HtoDV27MNPneJHGeeT5XBhqKywj2nY4IOmJ5x8IL
```

**Important**: This token should never be committed to version control. The `.env` file is already listed in `.gitignore`.

### Usage

To use the Cloudflare API with Wrangler CLI:

```bash
# The token is automatically loaded from .env file when in the api directory
cd api

# Check authentication status
npx wrangler whoami

# Deploy the worker
npx wrangler deploy

# Tail logs
npx wrangler tail

# List deployments
npx wrangler deployments list

# Manage secrets
npx wrangler secret put SECRET_NAME
npx wrangler secret list
```

### Configuration Changes

Updated `api/wrangler.toml`:
- Changed `node_compat = true` to `compatibility_flags = ["nodejs_compat"]` for Wrangler v4 compatibility

### Token Permissions

The API token has access to:
- Workers deployment and management
- D1 database operations
- Account settings

To view full token permissions, visit:
https://dash.cloudflare.com/bc7193edb20db7abc93d823fe0e6feff/api-tokens

### Troubleshooting

If authentication fails:
1. Verify the token in the `.env` file
2. Check that you're in the `api` directory when running wrangler commands
3. Ensure the token has the necessary permissions in the Cloudflare dashboard
4. Try: `export CLOUDFLARE_API_TOKEN=$(grep CLOUDFLARE_API_TOKEN .env | cut -d '=' -f2)`

### Next Steps

1. Deploy the worker: `npx wrangler deploy`
2. Set up worker secrets (if not already configured)
3. Verify the worker is accessible at your custom domain
4. Monitor deployments and logs through the Cloudflare dashboard

## Links

- Cloudflare Dashboard: https://dash.cloudflare.com/bc7193edb20db7abc93d823fe0e6feff
- Worker Settings: https://dash.cloudflare.com/ → Workers & Pages → gor-incinerator-api
- API Tokens: https://dash.cloudflare.com/bc7193edb20db7abc93d823fe0e6feff/api-tokens
