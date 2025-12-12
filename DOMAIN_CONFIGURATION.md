# Custom Domain Configuration Guide

## Overview

This guide covers configuring a custom domain for your Gor-Incinerator deployment. You have two components to configure:

1. **API Domain** - For your Cloudflare Worker
2. **Frontend Domain** - For your web application

## Current Setup

Your current deployment URLs are:

- **API**: `https://gor-incinerator-api.gor-incinerator.workers.dev`
- **Frontend**: Deployed to Cloudflare Pages (URL varies)

## Option 1: Both on gor-incinerator.com (Recommended)

This approach uses subdomains under a main domain:

```
api.gor-incinerator.com    → Your Cloudflare Worker API
gor-incinerator.com        → Your Frontend
```

### Prerequisites

- A domain registered and managed by Cloudflare (or with Cloudflare nameservers)
- Access to Cloudflare dashboard
- Domain: `gor-incinerator.com`

### Step 1: Configure API Domain

#### 1a. In Cloudflare Dashboard

1. Go to: https://dash.cloudflare.com/
2. Navigate to your domain → Workers & Pages → gor-incinerator-api
3. Look for "Triggers" section at the top
4. Click "Add Custom Domain"
5. Enter: `api.gor-incinerator.com`
6. Cloudflare will create a CNAME record automatically

#### 1b. Verify DNS

1. Go to DNS settings for gor-incinerator.com
2. Look for CNAME record pointing to `api.gor-incinerator.com`
3. Verify status shows as "Active" (usually within 15 minutes)

#### 1c. Update Configuration

Update your `api/wrangler.toml` (optional - for documentation):

```toml
# Add to the file for reference
[env.production]
routes = [
  { pattern = "api.gor-incinerator.com/*", zone_name = "gor-incinerator.com" }
]
```

### Step 2: Configure Frontend Domain

#### 2a. Cloudflare Pages Domain

1. Go to: https://dash.cloudflare.com/
2. Navigate to Pages → Your project
3. Go to **Settings** → **Custom Domain**
4. Add custom domain: `gor-incinerator.com` or `www.gor-incinerator.com`
5. Follow DNS instructions if needed

#### 2b. Verify DNS

1. Go to DNS settings
2. CNAME for www should point to Cloudflare Pages
3. Verify status shows as "Active"

### Step 3: Update Frontend Configuration

Update `frontend/.env`:

```bash
VITE_API_BASE_URL=https://api.gor-incinerator.com
VITE_API_KEY=gorincin_a8026612e8c77bc7738ee5de0d1ebd906f21049c9ad2d964ee9a0b6e51c3f2d3
VITE_GOR_VAULT_ADDRESS_AETHER=DvY73fC74Ny33Zu3ScA62VCSwrz1yV8kBysKu3rnLjvD
VITE_GOR_VAULT_ADDRESS_INCINERATOR=BuRnX2HDP8s1CFdYwKpYCCshaZcTvFm3xjbmXPR3QsdG
VITE_MODE=api
```

### Step 4: Rebuild and Redeploy Frontend

```bash
cd frontend
npm run build
# Redeploy to Cloudflare Pages with the updated build
```

---

## Option 2: Custom Domain (Non-Cloudflare Registrar)

If your domain is registered elsewhere:

### Step 1: Point Nameservers to Cloudflare

1. At your domain registrar, update nameservers to Cloudflare's:
   - `aba.ns.cloudflare.com`
   - `bates.ns.cloudflare.com`

2. Wait for propagation (24-48 hours typically)

3. Add domain to Cloudflare dashboard:
   - Go to: https://dash.cloudflare.com/
   - Click "Add a Site"
   - Enter your domain
   - Select plan (Free works)
   - Follow verification steps

### Step 2: Configure API and Frontend

Follow the same steps as Option 1 above.

---

## DNS Configuration Reference

### Final DNS Records Should Include:

```
Type   | Name                    | Value                              | Status
-------|-------------------------|------------------------------------|---------
CNAME  | api                     | api.gor-incinerator.workers.dev   | Active
CNAME  | www                     | [pages-domain]                     | Active
A/AAAA | @ (gor-incinerator.com) | [pages-ip]                        | Active
```

**Note**: Exact values depend on Cloudflare's assignments.

---

## Testing Domain Configuration

### Test API Domain

```bash
# Should return "Gor-Incinerator API Worker is running!"
curl https://api.gor-incinerator.com/

# With authentication
curl -H "x-api-key: gorincin_a8026612e8c77bc7738ee5de0d1ebd906f21049c9ad2d964ee9a0b6e51c3f2d3" \
     https://api.gor-incinerator.com/assets/YOUR_WALLET
```

### Test Frontend Domain

```bash
# Should open your frontend in browser
open https://gor-incinerator.com
# or
curl https://gor-incinerator.com | head -20
```

### Check DNS Propagation

```bash
# Check API CNAME
nslookup api.gor-incinerator.com

# Check frontend CNAME
nslookup gor-incinerator.com
```

---

## Common Issues

### Domain Shows as Pending

- Wait 15-30 minutes for Cloudflare to process
- Clear browser cache
- Check DNS settings in Cloudflare dashboard

### API Domain Not Working

1. Verify CNAME is pointing to workers.dev domain
2. Check Cloudflare Workers route configuration
3. Ensure API is still deployed and accessible

### Frontend Shows 404

1. Verify Pages project is deployed
2. Check custom domain is added to Pages project
3. Verify build output includes index.html
4. Clear Cloudflare cache: Dashboard → Caching → Purge Everything

### CORS Errors on Custom Domain

1. Update `api/src/middleware/cors.ts` to include your domain
2. Redeploy the worker
3. Clear browser cache

### SSL Certificate Issues

Cloudflare automatically handles SSL/TLS certificates. If you see warnings:
1. Go to SSL/TLS settings in dashboard
2. Ensure "Full" or "Full (strict)" is selected
3. Allow 24 hours for certificate issuance

---

## SSL/TLS Configuration

Cloudflare provides free SSL certificates for all domains. Recommended settings:

1. Go to: Dashboard → Domain → SSL/TLS
2. Set Encryption Mode to: **Full (strict)**
3. This ensures all traffic is encrypted end-to-end

---

## Subdomains Advanced Setup (Optional)

If you want multiple subdomains:

```
api.gor-incinerator.com        → Cloudflare Worker
app.gor-incinerator.com        → Frontend alternate
admin.gor-incinerator.com      → Admin dashboard (future)
www.gor-incinerator.com        → Canonical frontend
```

For each subdomain:
1. Add custom domain in respective Cloudflare service
2. Configure CNAME record in DNS
3. Wait for propagation

---

## Environment Variables for Different Domains

You can use different configurations:

### Production (.env.production)
```
VITE_API_BASE_URL=https://api.gor-incinerator.com
```

### Staging (.env.staging)
```
VITE_API_BASE_URL=https://api-staging.gor-incinerator.com
```

### Development (.env.development)
```
VITE_API_BASE_URL=https://gor-incinerator-api.gor-incinerator.workers.dev
```

---

## Monitoring Domain Health

Monitor your domain using:

1. **Cloudflare Dashboard**
   - Analytics tab shows traffic
   - Caching shows performance
   - Security shows threats blocked

2. **External Uptime Monitoring**
   ```bash
   # Using a service like Better Uptime, Pingdom, etc.
   # Set up alerts for your domain
   ```

3. **Local Health Checks**
   ```bash
   # Regular health checks
   curl -f https://api.gor-incinerator.com/ || alert
   curl -f https://gor-incinerator.com/ || alert
   ```

---

## Rollback Procedure

If you need to revert to workers.dev domain:

1. Update `frontend/.env`:
   ```
   VITE_API_BASE_URL=https://gor-incinerator-api.gor-incinerator.workers.dev
   ```

2. Rebuild frontend:
   ```bash
   cd frontend && npm run build
   ```

3. Redeploy to Cloudflare Pages

---

## Next Steps

1. **Register/Verify Domain**: Ensure domain is on Cloudflare
2. **Configure API**: Add custom domain to Worker
3. **Configure Frontend**: Add custom domain to Pages
4. **Update Environment**: Update VITE_API_BASE_URL
5. **Rebuild & Redeploy**: Rebuild frontend and redeploy
6. **Test**: Verify both API and frontend work on new domain
7. **Monitor**: Watch for any issues post-deployment

---

## Support

For domain configuration issues:
- Cloudflare Docs: https://developers.cloudflare.com/
- Check DNS settings: https://dnschecker.org/
- Verify propagation: https://cname-checker.com/

**Status**: Ready for custom domain configuration ✅
