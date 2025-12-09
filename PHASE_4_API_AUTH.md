# Phase 4 — Secure API Key Authentication (CLOUDFLARE)

This phase secured the API endpoints by replacing the placeholder API key logic with authentication against Cloudflare Worker environment variables (`env.API_KEY` and `env.ADMIN_API_KEY`).

## 1. Updated Middleware Code

The authentication logic in `api/src/index.ts` was modified to read the required API key from the environment bindings, ensuring the keys are securely managed as Cloudflare secrets.

### `api/src/index.ts` (Diff)

```typescript
// ... (omitted existing code)

// Middleware for API Key Authentication
const apiKeyAuth = async (c: any, next: any) => {
  const { API_KEY } = env<Bindings>(c); // <-- Reads from env.API_KEY
  const apiKey = c.req.header('x-api-key');
  if (!apiKey || apiKey !== API_KEY) {
    return c.json({ error: 'Unauthorized: Invalid or missing API Key' }, 401);
  }
  await next();
};

// Middleware for Admin API Key Authentication
const adminApiKeyAuth = async (c: any, next: any) => {
  const { ADMIN_API_KEY } = env<Bindings>(c); // <-- Reads from env.ADMIN_API_KEY
  const apiKey = c.req.header('x-api-key');
  if (!apiKey || apiKey !== ADMIN_API_KEY) {
    return c.json({ error: 'Unauthorized: Invalid or missing Admin API Key' }, 401);
  }
  await next();
};

// ... (omitted existing code)
```

## 2. Operator Instructions for Deployment

The following steps must be performed by the operator to securely set the API keys in the Cloudflare Worker environment.

### A. Generated Secure API Keys

We have generated two secure, random API keys for you. **These keys should be treated as secrets and not committed to the repository.**

| Key Name | Generated Value | Purpose |
| :--- | :--- | :--- |
| `API_KEY` | `Gz0ZGECRF5j5eTfV3UFIheLx61fgwGShLbazMGyXDbs=` | Used for public-facing endpoints (`/assets`, `/build-burn-tx`). |
| `ADMIN_API_KEY` | `7v508AUTSpGU+BCHHeEnzrh937gpeaYXA/QdrauA4p4=` | Used for administrative endpoints (`/reconciliation/report`). |

### B. Cloudflare Secret Setup

You must use the `wrangler secret put` command to securely store these values as secrets in your Cloudflare Worker. This ensures they are available as environment variables (`env.API_KEY`, `env.ADMIN_API_KEY`) at runtime and are not stored in plain text.

**Execute the following commands in your terminal, from the `api/` directory:**

```bash
# 1. Set the regular API Key
echo "Gz0ZGECRF5j5eTfV3UFIheLx61fgwGShLbazMGyXDbs=" | wrangler secret put API_KEY

# 2. Set the Admin API Key
echo "7v508AUTSpGU+BCHHeEnzrh937gpeaYXA/QdrauA4p4=" | wrangler secret put ADMIN_API_KEY
```

After setting these secrets, you can proceed with the deployment of the worker. The deployed worker will automatically use these secure keys for authentication.
