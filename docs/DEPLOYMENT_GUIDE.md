# Gor Incinerator - Deployment Guide

## Overview

This guide covers deploying Gor Incinerator as a production service for the Gorbagana blockchain network.

## Prerequisites

### Required
- Node.js 16+ and npm
- Gorbagana RPC endpoint access
- Fee recipient wallet (for collecting service fees)
- Domain name (e.g., gor-incinerator.com)
- Web hosting service (Vercel, Netlify, or similar)

### Recommended
- SSL certificate (automatic with most hosting services)
- Analytics setup (Google Analytics, Umami, etc.)
- Error monitoring (Sentry, LogRocket, etc.)

## Environment Configuration

### Production Environment Variables

Create a `.env.production` file:

```bash
# Gorbagana Network
RPC_URL=https://rpc.gorbagana.com

# Service Fee Configuration (Required for business)
FEE_RECIPIENT=YOUR_WALLET_ADDRESS_HERE
FEE_PERCENTAGE=5

# Frontend Configuration
VITE_APP_TITLE=Gor Incinerator
VITE_APP_LOGO=/logo.png
VITE_RPC_URL=https://rpc.gorbagana.com

# Analytics (Optional)
VITE_ANALYTICS_ENDPOINT=https://analytics.yourdomain.com
VITE_ANALYTICS_WEBSITE_ID=your-website-id
```

### Fee Recipient Wallet

**Important**: Set up a dedicated wallet for receiving service fees:

1. Create a new Backpack wallet for business use
2. Securely store the private key
3. Use the public address as `FEE_RECIPIENT`
4. Never share the private key
5. Regularly transfer collected fees to cold storage

## Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Configure Project**
```bash
cd frontend
vercel init
```

3. **Set Environment Variables**
```bash
vercel env add VITE_RPC_URL production
vercel env add VITE_APP_TITLE production
# Add all other variables
```

4. **Deploy**
```bash
vercel --prod
```

5. **Configure Domain**
- Add custom domain in Vercel dashboard
- Point DNS to Vercel servers
- SSL automatically configured

### Option 2: Netlify

1. **Install Netlify CLI**
```bash
npm install -g netlify-cli
```

2. **Build Project**
```bash
cd frontend
npm run build
```

3. **Deploy**
```bash
netlify deploy --prod
```

4. **Configure Environment**
- Set environment variables in Netlify dashboard
- Configure custom domain
- Enable HTTPS

### Option 3: Self-Hosted

1. **Build Frontend**
```bash
cd frontend
npm run build
```

2. **Configure Web Server (Nginx)**
```nginx
server {
    listen 80;
    server_name gor-incinerator.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name gor-incinerator.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    root /var/www/gor-incinerator/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

3. **Deploy Files**
```bash
scp -r dist/* user@server:/var/www/gor-incinerator/
```

## Backend Service (Optional)

If you want to run the backend as a service for monitoring or automation:

### Systemd Service

Create `/etc/systemd/system/gor-incinerator.service`:

```ini
[Unit]
Description=Gor Incinerator Service
After=network.target

[Service]
Type=simple
User=gorincinerator
WorkingDirectory=/opt/gor-incinerator
Environment="NODE_ENV=production"
EnvironmentFile=/opt/gor-incinerator/.env
ExecStart=/usr/bin/node dist/burn.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable gor-incinerator
sudo systemctl start gor-incinerator
```

## Monitoring & Analytics

### Transaction Monitoring

Set up monitoring for:
- Transaction success rate
- Average accounts per transaction
- Total fees collected
- User activity patterns

### Error Tracking

Integrate error monitoring:

```typescript
// Add to frontend
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: "production",
  tracesSampleRate: 1.0,
});
```

### Analytics

Track key metrics:
- Page views
- Wallet connections
- Transactions initiated
- Transactions completed
- Conversion rate

## Security Considerations

### Frontend Security

1. **Content Security Policy**
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';">
```

2. **HTTPS Only**
- Always use HTTPS in production
- Enable HSTS headers
- Use secure cookies

3. **Wallet Security**
- Never request private keys
- Only use wallet's sign methods
- Validate all transactions client-side

### Backend Security

1. **Environment Variables**
- Never commit `.env` files
- Use secure secret management
- Rotate credentials regularly

2. **RPC Security**
- Use authenticated RPC endpoints
- Rate limit requests
- Monitor for abuse

3. **Fee Wallet Security**
- Use hardware wallet for fee recipient
- Regular security audits
- Multi-signature if possible

## Performance Optimization

### Frontend Optimization

1. **Build Optimization**
```bash
# Enable production optimizations
npm run build -- --mode production
```

2. **Asset Optimization**
- Compress images
- Minify CSS/JS
- Enable gzip/brotli compression

3. **Caching**
```nginx
# Cache static assets
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Backend Optimization

1. **Connection Pooling**
- Reuse RPC connections
- Implement connection pooling
- Cache blockchain data when possible

2. **Transaction Optimization**
- Optimize compute budget
- Batch operations efficiently
- Implement retry logic

## Backup & Recovery

### Critical Data

Backup regularly:
- Fee recipient private key (offline, encrypted)
- Environment configuration
- Transaction logs
- User analytics data

### Recovery Plan

1. **Service Outage**
- Have backup RPC endpoints
- Monitor service health
- Automated failover if possible

2. **Data Loss**
- Regular backups
- Disaster recovery plan
- Test recovery procedures

## Maintenance

### Regular Tasks

**Daily**
- Monitor transaction success rate
- Check error logs
- Verify fee collection

**Weekly**
- Review analytics
- Update dependencies
- Security patches

**Monthly**
- Financial reconciliation
- Performance review
- User feedback analysis

### Updates

1. **Frontend Updates**
```bash
cd frontend
npm update
npm audit fix
npm run build
vercel --prod
```

2. **Backend Updates**
```bash
npm update
npm audit fix
npm run build
npm test
```

## Scaling

### Horizontal Scaling

As usage grows:

1. **CDN Integration**
- Use Cloudflare or similar
- Cache static assets globally
- DDoS protection

2. **Load Balancing**
- Multiple frontend instances
- Geographic distribution
- Auto-scaling

3. **RPC Scaling**
- Multiple RPC endpoints
- Load balancing between endpoints
- Fallback providers

### Vertical Scaling

Optimize existing infrastructure:
- Upgrade server resources
- Optimize database queries
- Improve caching strategies

## Cost Management

### Infrastructure Costs

**Hosting**
- Vercel/Netlify: Free tier available, ~$20-50/month for pro
- Self-hosted: $5-20/month VPS

**RPC Access**
- Public endpoints: Free
- Private endpoints: $50-200/month
- Custom node: $100-500/month

**Monitoring**
- Analytics: Free tier available
- Error tracking: $0-50/month
- Uptime monitoring: $0-20/month

### Revenue Tracking

Monitor:
- Total transactions processed
- Total fees collected (in GOR)
- GOR to USD conversion
- Monthly revenue trends

## Legal & Compliance

### Terms of Service

Create clear terms covering:
- Service description
- Fee structure
- User responsibilities
- Liability limitations
- Privacy policy

### Compliance

Consider:
- Local regulations
- Crypto service requirements
- Tax obligations
- User data protection (GDPR, etc.)

## Support

### User Support Channels

Set up:
- GitHub Issues for technical problems
- Email for business inquiries
- FAQ section on website
- Community Discord/Telegram

### Documentation

Maintain:
- User guides
- API documentation
- Troubleshooting guides
- Video tutorials

## Launch Checklist

### Pre-Launch

- [ ] Environment configured
- [ ] Fee recipient wallet secured
- [ ] Frontend deployed and tested
- [ ] Domain configured with SSL
- [ ] Analytics integrated
- [ ] Error monitoring active
- [ ] Terms of service published
- [ ] Support channels ready

### Launch

- [ ] Announce on social media
- [ ] Submit to Gorbagana community
- [ ] Monitor initial transactions
- [ ] Respond to user feedback
- [ ] Track key metrics

### Post-Launch

- [ ] Daily monitoring
- [ ] User feedback collection
- [ ] Performance optimization
- [ ] Marketing campaigns
- [ ] Feature improvements

## Troubleshooting

### Common Issues

**Wallet Connection Fails**
- Check Backpack wallet installed
- Verify network configuration
- Check browser console for errors

**Transaction Fails**
- Verify RPC endpoint working
- Check compute budget settings
- Review transaction logs

**Fee Not Collected**
- Verify FEE_RECIPIENT configured
- Check fee calculation logic
- Review transaction instructions

## Resources

### Documentation
- [Business Model](BUSINESS_MODEL.md)
- [Fee Implementation](FEE_IMPLEMENTATION_SUMMARY.md)
- [Main README](../README.md)

### External Resources
- Gorbagana Documentation
- Backpack Wallet Docs
- Solana Web3.js Docs

## Support

For deployment assistance:
- GitHub Issues: https://github.com/DOGECOIN87/gor-incinerator.com/issues
- Email: support@gor-incinerator.com (if configured)

---

**Ready to deploy?** Follow this guide step-by-step and you'll have a production-ready token burning service!
