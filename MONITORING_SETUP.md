# Monitoring and Logging Setup Guide

## Overview

This guide covers setting up comprehensive monitoring, logging, and alerting for your Gor-Incinerator deployment.

## Components to Monitor

1. **Cloudflare Worker API** - Performance and errors
2. **D1 Database** - Query performance and storage
3. **Frontend** - User experience and errors
4. **Custom Domain** - DNS and availability

---

## Part 1: Cloudflare Worker Monitoring

### 1.1 Real-time Logs

View live logs from your Worker:

```bash
cd /home/mattrick/Gor-Incinerator.com/gor-incinerator/api
npm run tail
```

This command streams all logs from your deployed Worker in real-time. Great for:
- Debugging requests
- Monitoring errors
- Tracking API usage
- Watching authentication attempts

### 1.2 Cloudflare Dashboard Analytics

1. Go to: https://dash.cloudflare.com/
2. Navigate to: Workers & Pages → gor-incinerator-api
3. View **Analytics** tab showing:
   - Request count
   - Error rate
   - CPU time
   - Status codes distribution

### 1.3 Set Up Error Notifications

#### Option A: Email Alerts (Recommended for starting)

1. Cloudflare Dashboard → Domain
2. Go to: Notifications → Create Notification
3. Select: "Worker Errors"
4. Configure recipients
5. Save

#### Option B: Slack Integration

1. Install Cloudflare app on Slack
2. In Slack: `/cf subscribe` 
3. Select channel for alerts
4. Configure notification types
5. Save

#### Option C: Webhook Integration

Set up webhooks for custom alerting:

1. Third-party service (e.g., PagerDuty, OpsGenie)
2. Get webhook URL from service
3. Cloudflare Dashboard → Notifications → Webhooks
4. Add webhook URL
5. Configure alert conditions

### 1.4 Custom Worker Logging

Add logging to your API code for better insights:

```typescript
// In api/src/index.ts
app.use('/*', async (c, next) => {
  const start = Date.now();
  await next();
  const duration = Date.now() - start;
  
  // Log to browser console (visible in worker logs)
  console.log({
    method: c.req.method,
    path: c.req.path,
    status: c.res.status,
    duration: `${duration}ms`,
    timestamp: new Date().toISOString()
  });
});
```

---

## Part 2: Database Monitoring

### 2.1 D1 Database Performance

Monitor query performance and storage:

```bash
# View database information
cd api
npx wrangler d1 info gor-incinerator-logs-2
```

### 2.2 Database Backups

Set up regular backups:

```bash
# Create a manual backup
npx wrangler d1 backup create gor-incinerator-logs-2

# List backups
npx wrangler d1 backup list gor-incinerator-logs-2
```

**Recommended**: Set up daily backups using Cloudflare's backup feature.

### 2.3 Query Monitoring

Track important database operations:

```sql
-- Check transaction logs
SELECT 
  COUNT(*) as total_transactions,
  SUM(total_rent) as total_rent_collected,
  AVG(service_fee) as avg_fee
FROM transactions
WHERE created_at >= datetime('now', '-1 day');

-- Check by status
SELECT 
  status,
  COUNT(*) as count
FROM transactions
GROUP BY status;
```

Run these queries periodically to monitor activity.

---

## Part 3: Frontend Monitoring

### 3.1 Browser Console Errors

Implement error tracking in frontend:

**Option A: Sentry (Recommended)**

1. Sign up at: https://sentry.io
2. Create a new project for your frontend
3. Get DSN (Data Source Name)
4. Add to frontend code:

```typescript
// frontend/src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: "production",
  tracesSampleRate: 0.1, // Sample 10% of transactions
});
```

5. Install package:
```bash
cd frontend
npm install @sentry/react
```

**Option B: LogRocket**

1. Sign up at: https://logrocket.com
2. Create project and get app ID
3. Add to frontend:

```typescript
import LogRocket from 'logrocket';

if (process.env.NODE_ENV === 'production') {
  LogRocket.init('your-app-id');
}
```

**Option C: Custom Logging Service**

Send errors to your own backend:

```typescript
const logError = async (error: Error) => {
  await fetch('https://api.gor-incinerator.com/logs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.VITE_API_KEY
    },
    body: JSON.stringify({
      type: 'frontend_error',
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href
    })
  });
};
```

### 3.2 Performance Monitoring

Monitor Core Web Vitals:

```typescript
// Add to frontend/src/main.tsx
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

### 3.3 API Performance from Frontend

Track API response times:

```typescript
const measureAPICall = async (endpoint: string) => {
  const start = performance.now();
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: { 'x-api-key': API_KEY }
    });
    
    const duration = performance.now() - start;
    console.log(`${endpoint}: ${duration.toFixed(2)}ms`);
    
    return response;
  } catch (error) {
    const duration = performance.now() - start;
    console.error(`${endpoint} failed after ${duration.toFixed(2)}ms`, error);
    throw error;
  }
};
```

---

## Part 4: Uptime Monitoring

### 4.1 External Uptime Monitors

Use services to monitor your endpoints:

**Option A: Better Uptime (Recommended)**

1. Sign up: https://betteruptime.com
2. Add monitors for:
   - `https://api.gor-incinerator.com/`
   - `https://gor-incinerator.com/`
3. Set check interval: 5-15 minutes
4. Configure alerts: Slack, Email, PagerDuty
5. Enable status page for transparency

**Option B: Uptime Robot**

1. Sign up: https://uptimerobot.com
2. Monitor your API and frontend URLs
3. Set alerts to email/Slack

**Option C: Statuspage.io**

1. Create public status page
2. Set up monitors
3. Share status page with users
4. Automatic incident notifications

### 4.2 Health Check Script

Create automated health checks:

```bash
#!/bin/bash
# health-check.sh

API_URL="https://api.gor-incinerator.com"
FRONTEND_URL="https://gor-incinerator.com"
LOG_FILE="/var/log/gor-incinerator-health.log"

check_endpoint() {
  local url=$1
  local name=$2
  
  if curl -f -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200\|301"; then
    echo "[$(date)] ✓ $name is UP" >> "$LOG_FILE"
  else
    echo "[$(date)] ✗ $name is DOWN" >> "$LOG_FILE"
    # Send alert
    send_alert "$name is down!"
  fi
}

send_alert() {
  # Send to Slack, email, PagerDuty, etc.
  curl -X POST https://hooks.slack.com/services/YOUR/WEBHOOK/URL \
    -d "{\"text\": \"$1\"}"
}

check_endpoint "$API_URL/" "API"
check_endpoint "$FRONTEND_URL/" "Frontend"
```

Schedule with cron:
```bash
# Every 5 minutes
*/5 * * * * /usr/local/bin/health-check.sh
```

---

## Part 5: Metrics and Dashboards

### 5.1 Create Custom Dashboard

Track important metrics:

```
┌─ Gor-Incinerator Metrics ─────────────────┐
│                                            │
│ Last 24 Hours:                             │
│ • Total Requests: 1,234                    │
│ • Error Rate: 0.2%                         │
│ • Avg Response Time: 145ms                 │
│ • DB Queries: 5,678                        │
│                                            │
│ Recent Errors: 2                           │
│ Database Size: 2.1 MB                      │
│ API Uptime: 99.99%                         │
│                                            │
└────────────────────────────────────────────┘
```

### 5.2 Metrics to Track

**API Metrics:**
- Request count per endpoint
- Error rate
- Response time (p50, p95, p99)
- Authentication failures
- Rate limit hits

**Database Metrics:**
- Query count
- Query duration (avg, max)
- Database size
- Row count (transactions table)

**Frontend Metrics:**
- Page load time
- Error count
- User engagement
- Conversion metrics

**Business Metrics:**
- Total rent collected
- Total accounts burned
- Fee distribution
- Active users

---

## Part 6: Alerting Rules

### 6.1 Set Up Alerts For

1. **API Errors** (> 1% error rate)
   - Action: Page on-call engineer
   - Severity: High

2. **High Response Times** (> 1000ms p95)
   - Action: Notify team
   - Severity: Medium

3. **Database Storage** (> 80% full)
   - Action: Alert ops team
   - Severity: Medium

4. **Downtime** (Any endpoint down)
   - Action: Page on-call
   - Severity: Critical

5. **Authentication Failures** (> 10 in 5 mins)
   - Action: Review logs
   - Severity: Medium

---

## Part 7: Incident Response

### 7.1 Runbook for Common Issues

#### Issue: API Returns 500 Errors

```
1. Check Worker logs:
   cd api && npm run tail

2. Look for stack traces
3. Check database connection:
   npx wrangler d1 info gor-incinerator-logs-2

4. Check environment variables in Cloudflare dashboard
5. Redeploy if needed:
   npm run deploy

6. Document the incident
```

#### Issue: High Response Times

```
1. Check Worker logs for slow queries
2. Review database performance
3. Check Cloudflare analytics
4. Identify slow endpoints
5. Optimize code if needed
6. Redeploy
```

#### Issue: Database Full

```
1. Check database size:
   npx wrangler d1 info gor-incinerator-logs-2

2. Archive old transactions:
   DELETE FROM transactions WHERE created_at < date_sub(now(), interval 90 day);

3. Backup data first:
   npx wrangler d1 backup create gor-incinerator-logs-2

4. Monitor growth and plan scaling
```

### 7.2 Escalation Path

```
Level 1: Automated alerts to Slack
  ↓
Level 2: Page on-call engineer (PagerDuty)
  ↓
Level 3: Escalate to team lead
  ↓
Level 4: CEO/CTO involvement (critical outage)
```

---

## Part 8: Regular Maintenance

### Daily Tasks
- [ ] Check error logs
- [ ] Monitor response times
- [ ] Verify no unusual traffic patterns

### Weekly Tasks
- [ ] Review performance metrics
- [ ] Check database growth
- [ ] Backup database
- [ ] Update dependency vulnerabilities

### Monthly Tasks
- [ ] Deep-dive performance analysis
- [ ] Capacity planning review
- [ ] Security audit
- [ ] Disaster recovery test
- [ ] Cost optimization review

### Quarterly Tasks
- [ ] Architecture review
- [ ] Scaling assessment
- [ ] Documentation update
- [ ] Team training on runbooks

---

## Implementation Checklist

- [ ] Set up real-time worker logs
- [ ] Configure Cloudflare Dashboard alerts
- [ ] Implement frontend error tracking (Sentry/LogRocket)
- [ ] Set up uptime monitoring (Better Uptime/Uptime Robot)
- [ ] Create health check script
- [ ] Configure database backups
- [ ] Set up incident response runbooks
- [ ] Train team on monitoring systems
- [ ] Document escalation procedures
- [ ] Schedule regular maintenance tasks

---

## Resources

- Cloudflare Workers Observability: https://developers.cloudflare.com/workers/observability/
- D1 Database Docs: https://developers.cloudflare.com/d1/
- Sentry Docs: https://docs.sentry.io/
- Better Uptime: https://betteruptime.com/docs/

---

**Status**: Monitoring setup guide complete ✅
