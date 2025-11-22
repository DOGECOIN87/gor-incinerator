# Gor Incinerator - Documentation Index

## Quick Links

### Getting Started
- [Main README](../README.md) - Project overview and quick start
- [Project Structure](../PROJECT_STRUCTURE.md) - Codebase organization
- [Environment Setup](.env.example) - Configuration template

### Core Documentation
1. **[Fee Implementation Summary](FEE_IMPLEMENTATION_SUMMARY.md)**
   - Complete overview of the 5% fee system
   - Implementation details and security features
   - Testing results and usage examples

2. **[Blockchain Separation Guide](BLOCKCHAIN_SEPARATION_GUIDE.md)**
   - How RPC_URL determines which blockchain to use
   - Same wallet on Solana vs Gorbagana
   - Network isolation and safety guarantees

3. **[Fee Integration Guide](FEE_INTEGRATION_GUIDE.md)**
   - Front-end integration instructions
   - UI/UX recommendations
   - Component examples and marketing copy

### Technical Documentation

#### Backend
- [Source Code](../src/) - TypeScript backend implementation
- [Services](../src/services/) - Business logic services
  - [Account Service](../src/services/accountService.ts) - Token account discovery
  - [Transaction Service](../src/services/transactionService.ts) - Transaction handling
  - [Fee Service](../src/services/feeService.ts) - Fee calculation & collection
- [Tests](../src/services/__tests__/) - Comprehensive test suite
- [Configuration](../src/config.ts) - Environment and blockchain setup

#### Frontend
- [Frontend README](../frontend/README.md) - Front-end documentation
- [React Components](../frontend/) - UI components
  - [Home Page](../frontend/Home.tsx) - Landing page
  - [App Component](../frontend/App.tsx) - Main app wrapper

## Documentation by Topic

### Fee System
- [Fee Implementation Summary](FEE_IMPLEMENTATION_SUMMARY.md) - Complete overview
- [Fee Integration Guide](FEE_INTEGRATION_GUIDE.md) - Front-end integration
- Fee Recipient: `CeD9epfL2eHfbJxKNdCY5Udaisn1hh3zBMiDGeDJs7BL`
- Default Fee: 5% (configurable 0-100%)

### Multi-Chain Support
- [Blockchain Separation Guide](BLOCKCHAIN_SEPARATION_GUIDE.md) - How it works
- RPC_URL determines which blockchain
- Same wallet, different chains, completely isolated

### Configuration
- [.env.example](../.env.example) - Environment template
- Required: `RPC_URL`, `WALLET`
- Optional: `FEE_RECIPIENT`, `FEE_PERCENTAGE`

### Development
- [Project Structure](../PROJECT_STRUCTURE.md) - Codebase organization
- [package.json](../package.json) - Dependencies and scripts
- [tsconfig.json](../tsconfig.json) - TypeScript configuration
- [jest.config.js](../jest.config.js) - Testing configuration

## Common Tasks

### Setup and Installation
```bash
# 1. Clone repository
git clone https://github.com/DOGECOIN87/gor-incinerator.fun

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your settings

# 4. Build
npm run build

# 5. Run
npm run burn
```

### Running Tests
```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Watch mode
npm run test:watch
```

### Building
```bash
# Compile TypeScript
npm run build

# Output goes to dist/
```

### Execution
```bash
# Run the incinerator
npm run burn

# With custom env file
cp .env.gorbagana .env && npm run burn
```

## Key Concepts

### 1. Blockchain Selection
The `RPC_URL` in your `.env` file determines which blockchain you're operating on:
- Gorbagana: `https://rpc.gorbagana.com`
- Solana: `https://api.mainnet-beta.solana.com`

See: [Blockchain Separation Guide](BLOCKCHAIN_SEPARATION_GUIDE.md)

### 2. Fee Structure
- **Default**: 5% of reclaimed rent
- **Configurable**: 0-100% or disable completely
- **Transparent**: All fees logged and displayed
- **Recipient**: `CeD9epfL2eHfbJxKNdCY5Udaisn1hh3zBMiDGeDJs7BL`

See: [Fee Implementation Summary](FEE_IMPLEMENTATION_SUMMARY.md)

### 3. Safety Features
- Only closes zero-balance accounts
- Blacklist protection for important tokens
- Atomic transactions (all or nothing)
- Comprehensive validation and error handling

### 4. Batch Processing
- Closes up to 14 accounts per transaction
- >90% success rate
- Optimized compute budget
- Automatic retry logic

## Architecture Overview

```
User runs npm run burn
        ↓
Config.initialize() - Loads .env, validates settings
        ↓
AccountService - Discovers empty token accounts
        ↓
FeeService - Calculates fee (if configured)
        ↓
TransactionService - Builds transaction with fee
        ↓
Transaction sent to blockchain (via RPC_URL)
        ↓
Results logged and displayed
```

## File Organization

```
gor-incinerator.fun/
├── src/              # Backend TypeScript code
├── frontend/         # React UI components
├── docs/             # Documentation (you are here)
├── dist/             # Compiled output
└── node_modules/     # Dependencies
```

See: [Project Structure](../PROJECT_STRUCTURE.md)

## Support and Resources

### Documentation
- Main README: [../README.md](../README.md)
- Frontend README: [../frontend/README.md](../frontend/README.md)
- All guides in this directory

### Code
- GitHub: https://github.com/DOGECOIN87/gor-incinerator.fun
- Issues: https://github.com/DOGECOIN87/gor-incinerator.fun/issues

### Configuration
- Example: [../.env.example](../.env.example)
- Fee Recipient: `CeD9epfL2eHfbJxKNdCY5Udaisn1hh3zBMiDGeDJs7BL`

## Version Information

- **Current Version**: 1.0.0
- **Fee Implementation**: Complete ✅
- **Multi-Chain Support**: Yes (via RPC_URL)
- **Test Coverage**: Comprehensive
- **Production Ready**: Yes ✅

## Recent Updates

### November 22, 2024
- ✅ Implemented 5% configurable fee system
- ✅ Added FeeService for fee calculation and collection
- ✅ Integrated fee collection into transaction flow
- ✅ Created comprehensive documentation
- ✅ Updated front-end with fee transparency
- ✅ Organized codebase structure
- ✅ Added blockchain separation guide

## Next Steps

1. **For Users**: See [Main README](../README.md) for setup instructions
2. **For Developers**: See [Project Structure](../PROJECT_STRUCTURE.md) for codebase overview
3. **For Front-End**: See [Fee Integration Guide](FEE_INTEGRATION_GUIDE.md) for UI integration
4. **For Multi-Chain**: See [Blockchain Separation Guide](BLOCKCHAIN_SEPARATION_GUIDE.md) for details

## Contributing

Contributions welcome! Please:
1. Read the documentation
2. Follow the existing code structure
3. Add tests for new features
4. Update documentation as needed

## License

ISC License - See LICENSE file for details

---

**Need help?** Check the relevant guide above or open an issue on GitHub.
