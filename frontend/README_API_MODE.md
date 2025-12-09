# Frontend API Mode Integration

This document explains how to integrate the frontend with the Cloudflare Workers backend API for Gorbag Wallet integration.

## Overview

The frontend supports two modes:

1. **Direct Mode** (default): Frontend builds transactions directly using Backpack wallet
2. **API Mode**: Frontend calls backend API to build transactions (for Gorbag Wallet integration)

## Configuration

### Environment Variables

Create `.env.local` file:

```bash
# API Backend URL
VITE_API_BASE_URL=https://api.gor-incinerator.com

# API Key (if frontend calls API directly)
VITE_API_KEY=your_api_key

# Mode: "direct" or "api"
VITE_MODE=api

# Vault addresses for direct mode (50/50 split)
VITE_GOR_VAULT_ADDRESS_AETHER=AetherLabsVaultAddress...
VITE_GOR_VAULT_ADDRESS_INCINERATOR=GorIncineratorVaultAddress...

# RPC URL for direct mode
VITE_GOR_RPC_URL=https://rpc.gorbagana.com
```

### Using API Mode

To enable API mode, set `VITE_API_BASE_URL` in your environment:

```bash
# Development
echo "VITE_API_BASE_URL=http://localhost:8787" > .env.local

# Production
echo "VITE_API_BASE_URL=https://api.gor-incinerator.com" > .env.local
```

## Components

### BurnInterfaceAPI.tsx

Enhanced burn interface with API mode support:

```tsx
import BurnInterfaceAPI from "@/components/BurnInterfaceAPI";

// Use in your app
<BurnInterfaceAPI
  walletConnected={walletConnected}
  walletAddress={walletAddress}
  onConnectWallet={handleConnect}
/>
```

**Features**:
- Automatic mode detection (API vs Direct)
- Fetches burn-eligible accounts from API
- Builds transactions via API with 50/50 fee split
- Displays fee breakdown (Aether Labs + Gor-incinerator)
- Handles signing and broadcasting

### API Client Service

Located at `src/services/apiClient.ts`:

```typescript
import { fetchAssets, buildBurnTransaction } from "@/services/apiClient";

// Fetch burn-eligible accounts
const assets = await fetchAssets(walletAddress);

// Build burn transaction
const tx = await buildBurnTransaction({
  wallet: walletAddress,
  accounts: ["account1...", "account2..."],
  maxAccounts: 14
});
```

## API Integration Flow

### 1. Scan Accounts

```typescript
// API Mode
const response = await fetchAssets(walletAddress);
// Returns: { accounts, summary }

// Direct Mode
const connection = new Connection(RPC_URL);
const accounts = await connection.getParsedTokenAccountsByOwner(...);
```

### 2. Build Transaction

```typescript
// API Mode
const response = await buildBurnTransaction({
  wallet: walletAddress,
  accounts: selectedAccounts,
  maxAccounts: 14
});
// Returns: { transaction (base64), feeBreakdown, ... }

// Direct Mode
const transaction = new VersionedTransaction(...);
// Build locally with fee instructions
```

### 3. Sign and Send

```typescript
// Both modes use wallet to sign
const signature = await window.backpack.signAndSendTransaction(transaction);
```

## Fee Breakdown Display

API mode provides detailed fee breakdown:

```json
{
  "serviceFee": 0.00142750,
  "feeBreakdown": {
    "aetherLabs": 0.00071375,
    "gorIncinerator": 0.00071375
  }
}
```

Display in UI:

```tsx
<div>
  <p>Service Fee (5%): {serviceFee} GOR</p>
  <p>→ Aether Labs (2.5%): {feeBreakdown.aetherLabs} GOR</p>
  <p>→ Gor-incinerator (2.5%): {feeBreakdown.gorIncinerator} GOR</p>
</div>
```

## Switching Between Modes

### Use Direct Mode

```bash
# Remove or leave empty
VITE_API_BASE_URL=
```

### Use API Mode

```bash
# Set backend URL
VITE_API_BASE_URL=https://api.gor-incinerator.com
VITE_API_KEY=your_api_key
```

## Deployment

### Cloudflare Pages

1. **Connect Repository**:
   - Go to Cloudflare Pages dashboard
   - Connect your GitHub repository
   - Select `gor-incinerator` repo

2. **Build Settings**:
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `frontend`

3. **Environment Variables**:
   ```
   VITE_API_BASE_URL=https://api.gor-incinerator.com
   VITE_API_KEY=<api_key>
   VITE_GOR_VAULT_ADDRESS_AETHER=<aether_vault>
   VITE_GOR_VAULT_ADDRESS_INCINERATOR=<incinerator_vault>
   ```

4. **Deploy**:
   - Push to `main` branch
   - Cloudflare Pages auto-deploys

### Vercel (Alternative)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod

# Set environment variables in Vercel dashboard
```

## Testing

### Test API Mode Locally

```bash
# Terminal 1: Start API backend
cd api
npm run dev

# Terminal 2: Start frontend
cd frontend
echo "VITE_API_BASE_URL=http://localhost:8787" > .env.local
npm run dev
```

### Test Direct Mode

```bash
cd frontend
echo "VITE_API_BASE_URL=" > .env.local
npm run dev
```

## Gorbag Wallet Integration

For Gorbag Wallet integration, the wallet should:

1. **Call API Directly**: Use `x-api-key` header for authentication
2. **Build Transaction**: Call `POST /build-burn-tx` with selected accounts
3. **Sign Transaction**: Deserialize base64 transaction and sign with user's key
4. **Broadcast**: Send signed transaction to Gorbagana blockchain

**Example**:

```typescript
// 1. Fetch burn-eligible accounts
const assets = await fetch(`${API_URL}/assets/${wallet}`, {
  headers: { "x-api-key": API_KEY }
});

// 2. Build transaction
const txData = await fetch(`${API_URL}/build-burn-tx`, {
  method: "POST",
  headers: { "x-api-key": API_KEY, "Content-Type": "application/json" },
  body: JSON.stringify({
    wallet: walletAddress,
    accounts: selectedAccounts,
    maxAccounts: 14
  })
});

// 3. Deserialize and sign
const txBuffer = Buffer.from(txData.transaction, "base64");
const transaction = VersionedTransaction.deserialize(txBuffer);
const signedTx = await wallet.signTransaction(transaction);

// 4. Broadcast
const signature = await connection.sendRawTransaction(signedTx.serialize());
```

## Troubleshooting

### API Not Responding

- Check `VITE_API_BASE_URL` is correct
- Verify API key is valid
- Check CORS settings in API

### Transaction Fails

- Verify wallet has sufficient GOR for fees
- Check account addresses are valid
- Ensure max 14 accounts per transaction

### Fee Split Not Showing

- Verify API mode is enabled
- Check `feeBreakdown` in API response
- Ensure vault addresses are configured

## Support

- **API Issues**: Check `api/README.md`
- **Frontend Issues**: Check browser console for errors
- **Contract Questions**: Refer to partnership agreement

## License

ISC License
