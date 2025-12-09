#!/bin/bash

# Reconciliation script for Gor-Incinerator
# Generates monthly fee split reports for Aether Labs and Gor-incinerator
#
# Usage:
#   ./reconciliation.sh 2025-01-01 2025-01-31
#   ./reconciliation.sh  # Defaults to current month

set -e

# Configuration
API_URL="${API_URL:-https://api.gor-incinerator.com}"
ADMIN_API_KEY="${ADMIN_API_KEY:-}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if ADMIN_API_KEY is set
if [ -z "$ADMIN_API_KEY" ]; then
  echo -e "${RED}Error: ADMIN_API_KEY environment variable is not set${NC}"
  echo "Set it with: export ADMIN_API_KEY=your_admin_api_key"
  exit 1
fi

# Parse date arguments or use current month
if [ $# -eq 2 ]; then
  START_DATE="$1"
  END_DATE="$2"
else
  # Default to current month
  START_DATE=$(date +%Y-%m-01)
  END_DATE=$(date +%Y-%m-%d)
fi

echo -e "${GREEN}Gor-Incinerator Reconciliation Report${NC}"
echo "======================================"
echo "Period: $START_DATE to $END_DATE"
echo ""

# Make API request
RESPONSE=$(curl -s -X GET \
  "$API_URL/reconciliation/report?start=$START_DATE&end=$END_DATE" \
  -H "x-api-key: $ADMIN_API_KEY" \
  -H "Content-Type: application/json")

# Check if request was successful
if echo "$RESPONSE" | jq -e '.error' > /dev/null 2>&1; then
  echo -e "${RED}Error: $(echo "$RESPONSE" | jq -r '.message')${NC}"
  exit 1
fi

# Parse and display summary
echo -e "${YELLOW}Summary Statistics:${NC}"
echo "-------------------"
echo "Total Transactions:    $(echo "$RESPONSE" | jq -r '.summary.totalTransactions')"
echo "Total Accounts Closed: $(echo "$RESPONSE" | jq -r '.summary.totalAccountsClosed')"
echo "Total Rent Reclaimed:  $(echo "$RESPONSE" | jq -r '.summary.totalRent') GOR"
echo "Total Fees Collected:  $(echo "$RESPONSE" | jq -r '.summary.totalFees') GOR"
echo ""
echo -e "${YELLOW}Fee Split (50/50):${NC}"
echo "-------------------"
echo "Aether Labs Share:     $(echo "$RESPONSE" | jq -r '.summary.aetherLabsShare') GOR"
echo "Gor-incinerator Share: $(echo "$RESPONSE" | jq -r '.summary.gorIncineratorShare') GOR"
echo ""

# Save full report to file
REPORT_FILE="reconciliation_${START_DATE}_to_${END_DATE}.json"
echo "$RESPONSE" | jq '.' > "$REPORT_FILE"
echo -e "${GREEN}Full report saved to: $REPORT_FILE${NC}"

# Display transaction count by status
echo ""
echo -e "${YELLOW}Transaction Status Breakdown:${NC}"
echo "-----------------------------"
echo "$RESPONSE" | jq -r '.transactions | group_by(.status) | .[] | "\(.[0].status): \(length) transactions"'

echo ""
echo -e "${GREEN}Reconciliation complete!${NC}"
