#!/bin/bash

# Cook-Incinerator API Testing Script
# Use these commands to test your deployed API endpoints

API_URL="https://cook-incinerator-api.cook-incinerator.workers.dev"
USER_API_KEY="REDACTED_USER_API_KEY"
ADMIN_API_KEY="REDACTED_ADMIN_API_KEY"

echo "=========================================="
echo "Cook-Incinerator API Testing"
echo "=========================================="
echo ""

# Test 1: Health Check
echo "1️⃣  Testing Health Check..."
echo "Command: curl $API_URL/"
echo ""
curl -i "$API_URL/"
echo ""
echo ""

# Test 2: Get Assets with User API Key
echo "2️⃣  Testing GET /assets/:wallet"
echo "Note: Replace YOUR_WALLET_ADDRESS with an actual Solana/Cookie Chain wallet address"
echo "Command: curl -H \"x-api-key: $USER_API_KEY\" $API_URL/assets/YOUR_WALLET_ADDRESS"
echo ""
echo "Example:"
WALLET="2inx2q8P5W6Pr8Xx8mXC6MmJXBBDo5VqLBr99HNvjjgq"
curl -i -H "x-api-key: $USER_API_KEY" "$API_URL/assets/$WALLET" 2>/dev/null | head -20
echo ""
echo "[Output truncated for brevity]"
echo ""

# Test 3: Build Burn Transaction
echo "3️⃣  Testing POST /build-burn-tx"
echo "Command:"
echo "curl -X POST \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -H \"x-api-key: $USER_API_KEY\" \\"
echo "  -d '{\"wallet\":\"YOUR_WALLET\",\"accounts\":[\"ACC1\",\"ACC2\"],\"maxAccounts\":14}' \\"
echo "  $API_URL/build-burn-tx"
echo ""

# Test 4: Get Reconciliation Report (Admin Only)
echo "4️⃣  Testing GET /reconciliation/report (Admin Only)"
echo "Command:"
echo "curl -H \"x-api-key: $ADMIN_API_KEY\" \\"
echo "  \"$API_URL/reconciliation/report?start=2025-01-01&end=2025-01-31\""
echo ""

# Test 5: Test with Missing API Key
echo "5️⃣  Testing Authentication (Missing API Key)"
echo "Command: curl -i $API_URL/assets/someaddress"
echo "Expected: 401 Unauthorized"
echo ""
curl -i "$API_URL/assets/someaddress" 2>/dev/null | head -10
echo ""

# Test 6: Test with Invalid API Key
echo "6️⃣  Testing Authentication (Invalid API Key)"
echo "Command: curl -i -H \"x-api-key: invalid_key\" $API_URL/assets/someaddress"
echo "Expected: 401 Unauthorized"
echo ""
curl -i -H "x-api-key: invalid_key" "$API_URL/assets/someaddress" 2>/dev/null | head -10
echo ""

echo "=========================================="
echo "Testing Complete"
echo "=========================================="
echo ""
echo "📝 Notes:"
echo "- Replace YOUR_WALLET_ADDRESS with a real Solana address"
echo "- The example wallet may not have data; that's normal for testing"
echo "- Check Cloudflare Worker logs for detailed information:"
echo "  cd api && npm run tail"
echo ""
echo "🔗 API Documentation:"
echo "- Health endpoint: GET /"
echo "- Assets endpoint: GET /assets/:wallet"
echo "- Build transaction: POST /build-burn-tx"
echo "- Reconciliation: GET /reconciliation/report (admin only)"
echo ""
echo "✅ All endpoints require the 'x-api-key' header"
echo "⚠️  Use only the user API key in frontend requests"
echo "🔒 Keep the admin API key private and secure"
