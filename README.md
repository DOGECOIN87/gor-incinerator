# Gor Incinerator - Gorbagana Token Account Manager

A production-ready dApp for efficiently closing empty token accounts on the **Gorbagana** blockchain with an optional 5% fee structure.

## 📚 Documentation

- **[Project Structure](PROJECT_STRUCTURE.md)** - Complete codebase organization
- **[Documentation Index](docs/INDEX.md)** - All guides and references
- **[Fee Implementation](docs/FEE_IMPLEMENTATION_SUMMARY.md)** - Fee system details
- **[Blockchain Guide](docs/BLOCKCHAIN_SEPARATION_GUIDE.md)** - Multi-chain explanation
- **[Frontend README](frontend/README.md)** - UI documentation

## 🔥 Features

- Close up to 14 token accounts per transaction
- >90% success rate with optimized compute budget
- Optional 5% fee (fully configurable or can be disabled)
- Safety: Only closes zero-balance accounts
- Full TypeScript implementation with comprehensive tests
- Professional logging and error handling

## 💰 Fee Structure

- **Default**: 5% of reclaimed rent
- **Optional**: Disable by not setting `FEE_RECIPIENT`
- **Configurable**: Adjust from 0% to 100%
- **Transparent**: All fees logged and displayed

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Create .env file (see below)
# Run the incinerator
npm run burn
```

### Configuration (.env)

```dotenv
# Required - Determines which blockchain to use
RPC_URL=https://rpc.gorbagana.com  # For Gorbagana
# RPC_URL=https://api.mainnet-beta.solana.com  # For Solana

WALLET=[1,2,3,...,64]  # uint8 array format

# Optional - Fee Configuration
FEE_RECIPIENT=CeD9epfL2eHfbJxKNdCY5Udaisn1hh3zBMiDGeDJs7BL
FEE_PERCENTAGE=5  # Default is 5, set 0-100
```

**Important**: The `RPC_URL` determines which blockchain you're operating on. The same wallet can exist on both Solana and Gorbagana, but the program will **only interact with the blockchain specified by your RPC_URL**. See `BLOCKCHAIN_SEPARATION_GUIDE.md` for details.

## 📊 How It Works

1. Scans wallet for empty token accounts
2. Builds transaction to close up to 14 accounts
3. Calculates and applies configured fee (if enabled)
4. Executes transaction atomically
5. Reports results and fees collected

**Example Output**:
```
14 token accounts successfully closed
Fee collected: 0.00143 GOR (5%)
```

## 🛡️ Safety Features

- **Blacklist Protection**: Prevent specific tokens from being closed
- **Zero Balance Check**: Never closes accounts with tokens
- **Transaction Validation**: Preflight checks and retry logic
- **Comprehensive Logging**: Full audit trail of operations

## 🏗️ Architecture

```
src/
├── burn.ts                    # Main script
├── config.ts                  # Configuration with fee support
├── services/
│   ├── accountService.ts      # Account discovery
│   ├── transactionService.ts  # Transaction building with fees
│   ├── feeService.ts          # Fee calculation & collection
│   └── __tests__/             # Complete test coverage
└── utils/
    ├── errors.ts              # Error handling
    ├── logger.ts              # Structured logging
    └── validators.ts          # Input validation
```

## 🧪 Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
```

## 📝 Fee Implementation

The 5% fee is implemented with:
- Accurate rent calculation (~0.00203928 GOR per account)
- Atomic execution with account closures
- Full transparency and logging
- User control (can be disabled)
- Comprehensive validation

See `src/services/feeService.ts` for implementation details.

## 🎨 Front-End

Modern React UI included in `Adapting Solana Code for Gorbagana Fork and Front-End Design/`:
- Responsive design with Tailwind CSS
- Dark theme optimized for crypto
- Step-by-step user guide
- Feature highlights

## 🌐 About Gorbagana

Gorbagana is a high-performance Solana fork designed for speed, efficiency, and scalability. The Gor Incinerator helps users reclaim rent from unused token accounts.

## 📄 License

ISC License

## 🔗 Links

- **GitHub**: https://github.com/DOGECOIN87/gor-incinerator.fun
- **Website**: https://gor-incinerator.fun

---

**Note**: The 5% fee is optional and fully configurable. Users maintain complete control over their assets.
