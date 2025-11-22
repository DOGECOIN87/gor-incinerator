# Installation & Running Guide

## Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

This will install the new Solana dependencies required for blockchain integration.

### 2. Configure Fee Recipient (Optional)

Edit `frontend/.env` and add your fee recipient wallet address:

```env
VITE_FEE_RECIPIENT=YourGorWalletAddressHere
```

If you don't set this, no fees will be collected (users keep 100%).

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at http://localhost:5173

### 4. Test the Application

1. Open http://localhost:5173 in your browser
2. Install Backpack wallet extension if you haven't
3. Click "Connect" to connect your wallet
4. The app will automatically scan for empty token accounts
5. You'll see a list of all tokens that will be burned
6. Review the details and click "Burn X Accounts Now"
7. Approve the transaction in Backpack wallet
8. View the transaction on the explorer

## What You'll See

### Before Burning
- List of empty token accounts with mint addresses
- Total rent to reclaim
- 5% service fee
- Net amount you'll receive

### After Burning
- Success message
- Number of accounts closed
- Transaction signature with explorer link
- Option to scan for more accounts

## Troubleshooting

### "Backpack wallet not found"
- Install Backpack wallet extension
- Refresh the page

### "Failed to scan accounts"
- Check your internet connection
- Make sure you're connected to Gorbagana network in Backpack
- Try refreshing the page

### No accounts found
- You don't have any empty token accounts
- All your token accounts have balances

## Production Build

```bash
npm run build
```

The production build will be in `frontend/dist/`

## Environment Variables

- `VITE_APP_TITLE` - App title (default: "Gor Incinerator")
- `VITE_APP_LOGO` - Logo path (default: "/logo.png")
- `VITE_FEE_RECIPIENT` - Wallet address to receive fees (optional)
- `VITE_ANALYTICS_ENDPOINT` - Analytics endpoint (optional)
- `VITE_ANALYTICS_WEBSITE_ID` - Analytics website ID (optional)
