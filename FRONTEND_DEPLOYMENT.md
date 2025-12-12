# Frontend Deployment Guide

## Overview

Your frontend has been built and is ready to deploy. This guide covers two deployment options:

1. **Cloudflare Pages** (Recommended - Easiest)
2. **Local Testing** (For verification before production)

## Option A: Deploy to Cloudflare Pages (Recommended)

Cloudflare Pages is the recommended deployment option because:
- Seamless integration with your Cloudflare Worker API
- Automatic HTTPS
- Global CDN
- Zero-cost tier available
- Same dashboard as your Worker

### Steps to Deploy

#### 1. Prepare Your Project

Your frontend is already built. Verify the build output:

```bash
ls -la frontend/dist/
# Should show: index.html, assets/, and other static files
```

#### 2. Deploy via Cloudflare Dashboard

**Method A: Git Integration (Recommended)**

1. Push your repository to GitHub (if not already done)
   ```bash
   cd /home/mattrick/Gor-Incinerator.com/gor-incinerator
   git remote add origin https://github.com/YOUR_USERNAME/gor-incinerator.git
   git branch -M main
   git push -u origin main
   ```

2. Go to Cloudflare Dashboard: https://dash.cloudflare.com/
3. Click **Pages** (on the left sidebar)
4. Click **Create a project**
5. Select **Connect to Git**
6. Authorize GitHub and select your repository
7. Choose branch: `main`
8. Build settings:
   - **Framework**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `frontend/dist`
   - **Root directory (advanced)**: `frontend`

9. Click **Save and Deploy**

**Method B: Direct Upload**

If you don't want to use Git:

1. Go to Cloudflare Dashboard: https://dash.cloudflare.com/
2. Click **Pages** → **Upload assets**
3. Drag and drop the `frontend/dist/` folder
4. Follow the prompts to complete deployment

#### 3. Configure Your Domain (Optional)

After deployment:

1. In Pages project settings
2. Go to **Custom domain**
3. Add your domain (e.g., `gor-incinerator.com`)
4. Update DNS CNAME if needed

#### 4. Update Frontend Configuration

After deployment, update your `frontend/.env` if you have a custom domain:

```bash
VITE_API_BASE_URL=https://api.your-domain.com
# Or use the Cloudflare Pages URL:
VITE_API_BASE_URL=https://gor-incinerator-api.gor-incinerator.workers.dev
```

Then rebuild:
```bash
cd frontend
npm run build
```

Redeploy the new build to Cloudflare Pages.

---

## Option B: Local Testing

Before deploying to production, test locally:

```bash
cd /home/mattrick/Gor-Incinerator.com/gor-incinerator/frontend
npm run dev
```

Open http://localhost:5173 in your browser.

### Local Testing Checklist

- [ ] Frontend loads without errors
- [ ] Can interact with UI
- [ ] API calls succeed (check browser console)
- [ ] No CORS errors
- [ ] Wallet connection works (if applicable)
- [ ] Fee calculations display correctly

---

## Deployment Checklist

### Before Deployment
- [ ] Frontend builds without errors: `npm run build`
- [ ] No console warnings in local dev
- [ ] `frontend/.env` configured correctly
- [ ] API is running and accessible
- [ ] CORS is properly configured

### Deployment
- [ ] Frontend deployed to Cloudflare Pages OR hosting
- [ ] Build completes successfully
- [ ] Site is accessible via deployment URL
- [ ] Custom domain configured (if applicable)

### Post-Deployment Verification
- [ ] Frontend loads successfully
- [ ] Can see the UI
- [ ] API calls return data
- [ ] No 404 errors for assets
- [ ] Error handling works
- [ ] Console has no errors/warnings

---

## Build Output Details

Your production build includes:

```
frontend/dist/
├── index.html ..................... 2.50 kB
├── assets/
│   ├── index-BZXhHHv1.css ........ 28.58 kB (5.70 kB gzip)
│   ├── index-B6zpKDq2.js ......... 2.94 kB (1.15 kB gzip)
│   ├── index.browser.esm-DX2rNjLP.js ... 192.91 kB (60.48 kB gzip)
│   └── index-nQRyB8-C.js ......... 1,328.98 kB (391.53 kB gzip)
└── ... (other static assets)
```

**Note**: The main bundle is large. Consider using dynamic imports for better code splitting.

---

## Environment Configuration

Your `frontend/.env` contains:

```
VITE_API_BASE_URL=https://api.gor-incinerator.com
VITE_API_KEY=REDACTED_USER_API_KEY
VITE_MODE=api
VITE_GOR_VAULT_ADDRESS_AETHER=DvY73fC74Ny33Zu3ScA62VCSwrz1yV8kBysKu3rnLjvD
VITE_GOR_VAULT_ADDRESS_INCINERATOR=BuRnX2HDP8s1CFdYwKpYCCshaZcTvFm3xjbmXPR3QsdG
```

**Important**: This file contains non-sensitive config and the user API key (safe to deploy).

---

## Troubleshooting

### Build Fails
```bash
cd frontend
npm install
npm run build
```

### CORS Errors After Deployment
- Verify `api/src/middleware/cors.ts` allows your frontend domain
- Check API is configured with correct CORS headers

### Blank Page After Deployment
- Check browser console for errors
- Verify `index.html` loads
- Check Network tab for failed requests

### 404 on Assets
- Verify build output includes `assets/` folder
- Check Cloudflare Pages build settings are correct

---

## Next Steps

1. **Deploy**: Choose Cloudflare Pages or your preferred hosting
2. **Verify**: Test all functionality post-deployment
3. **Monitor**: Set up error tracking and monitoring
4. **Configure Domain**: Set up custom domain if desired

---

## Support

For deployment issues:
- Check Cloudflare Pages build logs
- Review browser console for errors
- Check API logs: `cd api && npm run tail`
- Reference: `ENVIRONMENT_SETUP.md` troubleshooting section

---

**Status**: Frontend built and ready to deploy ✅
