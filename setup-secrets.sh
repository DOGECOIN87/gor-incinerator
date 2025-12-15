#!/bin/bash

# Gor-Incinerator Cloudflare Worker Secrets Setup Script
# This script automates setting secrets in your Cloudflare Worker

set -e

echo "================================"
echo "Gor-Incinerator Secrets Setup"
echo "================================"
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Error: wrangler CLI is not installed"
    echo "Install it with: npm install -g wrangler"
    exit 1
fi

# Load secrets from .env.secrets if it exists
if [ -f ".env.secrets" ]; then
    echo "✓ Found .env.secrets file"
    set -a
    source .env.secrets
    set +a
else
    echo "⚠️  .env.secrets file not found"
    echo ""
    echo "Please create .env.secrets from the template:"
    echo "  cp .env.secrets.example .env.secrets"
    echo "  # Then edit .env.secrets with your actual values"
    echo ""
    exit 1
fi

# Check for Cloudflare API Token
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "⚠️  CLOUDFLARE_API_TOKEN not set in .env.secrets"
    echo "The wrangler CLI needs this token for authentication."
    echo ""
    echo "Get your token from: https://dash.cloudflare.com/profile/api-tokens"
    echo "Add it to .env.secrets: CLOUDFLARE_API_TOKEN=your_token_here"
    echo ""
    exit 1
fi

# Export for wrangler CLI
export CLOUDFLARE_API_TOKEN

echo "✓ Cloudflare API Token configured"

echo ""
echo "Setting Cloudflare Worker secrets..."
echo ""

# Function to securely set a secret
set_secret() {
    local key=$1
    local value=$2
    if [ -z "$value" ]; then
        echo "❌ Error: $key value is empty"
        return 1
    fi
    echo "$value" | wrangler secret put "$key"
    echo "✓ $key set successfully"
}

# Set all required secrets
echo "1. Setting API_KEY..."
set_secret "API_KEY" "$API_KEY" || exit 1

echo ""
echo "2. Setting ADMIN_API_KEY..."
set_secret "ADMIN_API_KEY" "$ADMIN_API_KEY" || exit 1

echo ""
echo "3. Setting GOR_RPC_URL..."
set_secret "GOR_RPC_URL" "$GOR_RPC_URL" || exit 1

echo ""
echo "4. Setting GOR_VAULT_ADDRESS_AETHER..."
set_secret "GOR_VAULT_ADDRESS_AETHER" "$GOR_VAULT_ADDRESS_AETHER" || exit 1

echo ""
echo "5. Setting GOR_VAULT_ADDRESS_INCINERATOR..."
set_secret "GOR_VAULT_ADDRESS_INCINERATOR" "$GOR_VAULT_ADDRESS_INCINERATOR" || exit 1

echo ""
echo "================================"
echo "✓ All secrets set successfully!"
echo "================================"
echo ""
echo "Next steps:"
echo "1. Verify the database configuration in api/wrangler.toml"
echo "2. Deploy the worker: cd api && npm run deploy"
echo "3. Test the health endpoint: curl https://api.gor-incinerator.com/health"
echo ""
