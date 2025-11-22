# Deployment Guide - Gor-Incinerator

This guide explains how to deploy the Gor-Incinerator application to GitHub Pages with the custom domain `gor-incinerator.fun`.

## Prerequisites

- Git installed on your machine
- GitHub account
- Domain `gor-incinerator.fun` configured to point to GitHub Pages

## Initial Setup

### 1. Create New GitHub Repository

```bash
# Go to GitHub.com and create a new repository named: gor-incinerator.fun
# Don't initialize with README, .gitignore, or license (we already have these)
```

### 2. Initialize Local Git Repository

```bash
# From the project root directory
git init
git add .
git commit -m "Initial commit: Gor-Incinerator with 3D model"
```

### 3. Connect to GitHub Repository

```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/gor-incinerator.fun.git
git branch -M main
git push -u origin main
```

## Deployment

### Automated Deployment (Recommended)

After pushing your code to GitHub, deploy using:

```bash
cd frontend
npm run deploy
```

This will:
1. Build the production version of your app
2. Create/update the `gh-pages` branch
3. Push the built files to GitHub Pages

### Manual Deployment

If you prefer manual deployment:

```bash
cd frontend
npm run build
# Then manually upload the dist folder to gh-pages branch
```

## GitHub Pages Configuration

### 1. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on "Settings"
3. Scroll to "Pages" section (left sidebar)
4. Under "Source", select:
   - Branch: `gh-pages`
   - Folder: `/ (root)`
5. Click "Save"

### 2. Configure Custom Domain

1. In the same "Pages" section
2. Under "Custom domain", enter: `gor-incinerator.fun`
3. Click "Save"
4. Wait for DNS check to complete
5. Enable "Enforce HTTPS" (recommended)

## DNS Configuration

Configure your domain's DNS settings:

### A Records
Point your apex domain to GitHub Pages:
```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

### CNAME Record (if using www subdomain)
```
www.gor-incinerator.fun → YOUR_USERNAME.github.io
```

## Verification

After deployment:

1. Visit `https://gor-incinerator.fun`
2. Verify the 3D trash can model loads correctly
3. Test wallet connection functionality
4. Check all navigation links work
5. Verify the site works on mobile devices

## Updating the Site

To update the deployed site:

```bash
# Make your changes
git add .
git commit -m "Description of changes"
git push origin main

# Deploy the updates
cd frontend
npm run deploy
```

The site will be updated within a few minutes.

## Troubleshooting

### 404 Error
- Check if GitHub Pages is enabled
- Verify gh-pages branch exists
- Wait a few minutes for deployment to complete

### Custom Domain Not Working
- Verify DNS settings are correct
- Check CNAME file exists in frontend/public/
- Wait for DNS propagation (can take up to 24-48 hours)

### 3D Model Not Loading
- Check browser console for errors
- Verify trash-can.glb is in frontend/public/
- Clear browser cache

### Build Errors
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Support

For issues or questions:
- Check the browser console for errors
- Review build logs during deployment
- Verify all dependencies are installed correctly

## Maintenance

### Regular Updates
```bash
# Update dependencies periodically
cd frontend
npm update
npm audit fix
```

### Backup
- Keep your repository private if it contains sensitive information
- Regularly backup your code to multiple locations

## Security Notes

- The `.env` file is gitignored and won't be deployed
- API keys and secrets should be managed through environment variables
- The CNAME file ensures your custom domain is preserved during deployments
