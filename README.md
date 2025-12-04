# Gor-Incinerator.fun - Burn Junk - Get Gor

Premium token burning service for the **Gorbagana** blockchain. Reclaim rent from empty token accounts with a transparent 5% fee.

## Features

- **Web Interface** - Easy-to-use frontend, no command line required
- **Backpack Wallet Integration** - Seamless connection to Gorbagana network
- **Batch Processing** - Close up to 14 token accounts per transaction
- **Transparent Fees** - 5% service fee, you keep 95% of reclaimed rent
- **Safety First** - Only closes zero-balance accounts with blacklist protection

## Project Structure

```
gor-incinerator/
├── src/                    # Backend CLI service (TypeScript)
│   ├── burn.ts             # Entry point for token burning
│   ├── config.ts           # Configuration with validation
│   ├── services/           # Core business logic
│   └── utils/              # Utilities and helpers
├── frontend/               # React + Vite web application
│   ├── src/
│   │   ├── pages/          # Page components
│   │   ├── components/     # UI components
│   │   └── services/       # API client
│   └── public/             # Static assets
├── api/                    # Cloudflare Workers API backend
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   └── services/       # Backend services
│   └── migrations/         # Database schema
└── docs/                   # Documentation
```

## Quick Start

### Web Interface (Recommended)

1. Visit **https://gor-incinerator.fun**
2. Connect your **Backpack wallet**
3. Review accounts to close
4. Confirm transaction and reclaim your GOR

### Development

```bash
# Clone the repository
git clone https://github.com/DOGECOIN87/gor-incinerator.fun
cd gor-incinerator

# Backend CLI
npm install
npm run build
npm run burn           # Requires .env configuration

# Frontend
cd frontend
npm install
npm run dev            # Starts on http://localhost:3000

# API (Cloudflare Workers)
cd api
npm install
npx wrangler dev       # Local development server
```

### Configuration (.env)

```dotenv
# Required
RPC_URL=https://rpc.gorbagana.com
WALLET=[1,2,3,...,64]  # uint8 array format

# Optional
FEE_RECIPIENT=CeD9epfL2eHfbJxKNdCY5Udaisn1hh3zBMiDGeDJs7BL
FEE_PERCENTAGE=5
```

## How It Works

1. Scans wallet for empty token accounts
2. Builds transaction to close up to 14 accounts
3. Calculates and applies configured fee (if enabled)
4. Executes transaction atomically
5. Reports results and fees collected

## Documentation

See the `docs/` folder for detailed guides:

- `DEPLOYMENT_GUIDE.md` - Production deployment instructions
- `QUICK_START_GUIDE.md` - Getting started guide
- `GORBAG_WALLET_INTEGRATION.md` - Wallet integration documentation
- `TESTING_GUIDE.md` - Testing instructions
- `API_DEPLOYMENT_GUIDE.md` - API deployment guide

## Safety Features

- **Blacklist Protection** - Prevent specific tokens from being closed
- **Zero Balance Check** - Never closes accounts with tokens
- **Transaction Validation** - Preflight checks and retry logic
- **Comprehensive Logging** - Full audit trail of operations

## License

ISC License

## Links

- **Website**: https://gor-incinerator.fun
- **GitHub**: https://github.com/DOGECOIN87/gor-incinerator.fun
- **Support**: Contact @mattrickbeats via X.com
