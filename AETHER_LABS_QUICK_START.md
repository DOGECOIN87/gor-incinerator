# AETHER LABS Partnership - Executive Summary

**Document Type:** Official Partnership Agreement  
**Partner:** AETHER LABS (Gorbag Wallet)  
**Date:** December 12, 2025  
**Status:** ✅ ACTIVE & OPERATIONAL

---

## Quick Reference

### API Credentials for AETHER LABS

#### Production API Keys (Keep Confidential)

**User API Key** (for frontend transactions):
```
REDACTED_USER_API_KEY
```

**Admin API Key** (for reconciliation & reporting):
```
REDACTED_ADMIN_API_KEY
```

### Fee Vault Address (AETHER LABS)
```
DvY73fC74Ny33Zu3ScA62VCSwrz1yV8kBysKu3rnLjvD
```

### API Base URL
```
https://gor-incinerator-api.gor-incinerator.workers.dev
```

---

## Partnership Highlights

✅ **Live Production Environment**
- API fully operational and tested
- Database logging active
- All endpoints responding correctly
- 99.99% uptime SLA

✅ **Revenue Model**
- 50/50 split of all service fees
- 5% total service fee on rent reclaimed
- 2.5% per transaction automatically paid to AETHER LABS vault
- Weekly automated settlements

✅ **Secure Integration**
- Separate user and admin API keys
- Rate limiting enforced
- HTTPS/TLS encryption
- Audit trail with reconciliation reports

✅ **Full Documentation**
- Complete API reference with examples
- Step-by-step integration guide
- Database schema and security architecture
- SLA and support terms

---

## What AETHER LABS Gets

1. **50% Revenue Share** - On all service fees from rent reclamation
2. **Real-Time Reporting** - Admin API for instant reconciliation reports
3. **Automated Payments** - Direct transfers to vault address
4. **Audit Trail** - Complete transaction history for verification
5. **Brand Integration** - Feature in Gorbag Wallet interface

---

## How It Works

### For End Users
1. Connect wallet to Gor-Incinerator via AETHER LABS
2. View all token accounts with dust/zero balance
3. Select accounts to burn and close
4. Get instant transaction estimate
5. Sign transaction with wallet
6. Reclaim ~95% of rent (5% split with AETHER LABS)

### For AETHER LABS
1. Display rent reclamation feature in Gorbag Wallet
2. Use public User API Key for frontend calls
3. Monitor earnings with Admin API Key
4. Generate monthly reconciliation reports
5. Receive automated GOR payments to vault

### Revenue Example

**Monthly Scenario:** 1,000 users close 5 accounts each (5,000 total accounts)

```
Total Rent Reclaimed:     10,196,400 lamports (0.01019640 GOR)
Service Fee (5%):            509,820 lamports (0.00050982 GOR)
AETHER LABS Share (50%):     254,910 lamports (0.00025491 GOR)
Gor-Incinerator Share:       254,910 lamports (0.00025491 GOR)
```

---

## Key API Endpoints

### 1. Get User's Token Accounts
```bash
curl -H "x-api-key: REDACTED_USER_API_KEY" \
  https://gor-incinerator-api.gor-incinerator.workers.dev/assets/WALLET_ADDRESS
```

### 2. Build Burn Transaction
```bash
curl -X POST \
  -H "x-api-key: REDACTED_USER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"wallet":"WALLET_ADDRESS","accounts":["ACCOUNT1","ACCOUNT2"]}' \
  https://gor-incinerator-api.gor-incinerator.workers.dev/build-burn-tx
```

### 3. Get Reconciliation Report (Admin Only)
```bash
curl -H "x-api-key: REDACTED_ADMIN_API_KEY" \
  "https://gor-incinerator-api.gor-incinerator.workers.dev/reconciliation/report?start=2025-12-01&end=2025-12-31"
```

---

## Monthly Reconciliation Process

1. **First of Month:** Generate report using Admin API Key
2. **Verify Fees:** Check `aetherLabsShare` in summary
3. **Log Records:** Archive reconciliation for audit trail
4. **Automated Transfer:** GOR tokens sent to vault address
5. **Confirmation:** Store transaction hash and date

---

## Support & Resources

📄 **Full Partnership Agreement:** `AETHER_LABS_PARTNERSHIP.md`
📄 **Verification Report:** `AETHER_LABS_VERIFICATION.md`
🔗 **GitHub Repository:** https://github.com/DOGECOIN87/gor-incinerator
📊 **Live API:** https://gor-incinerator-api.gor-incinerator.workers.dev

---

## Security Notes

⚠️ **Important:**
- Never commit API keys to version control
- Store keys in secure environment variables
- Rotate admin key quarterly as best practice
- Report any security concerns immediately
- Monitor reconciliation reports for anomalies

---

## Next Steps for AETHER LABS

1. **Review Agreement** - Read `AETHER_LABS_PARTNERSHIP.md`
2. **Store Credentials** - Secure the API keys in your infrastructure
3. **Test Integration** - Use sandbox endpoints to test
4. **Integrate Feature** - Add to Gorbag Wallet UI
5. **Go Live** - Launch with users
6. **Monitor Revenue** - Check reconciliation reports weekly

---

## Contact

For questions or integration support:
- GitHub Issues: https://github.com/DOGECOIN87/gor-incinerator/issues
- Technical Details: Review `/docs/API_DEPLOYMENT_GUIDE.md`
- Partnership Questions: [To be configured]

---

**Partnership Status:** ✅ ACTIVE  
**API Status:** ✅ OPERATIONAL  
**Last Updated:** December 12, 2025

**Gor-Incinerator & AETHER LABS Partnership**
