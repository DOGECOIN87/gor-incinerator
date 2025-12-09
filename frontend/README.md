# Gor Incinerator - Premium Token Burning Service
### Professional Web Service with Transparent 5% Fee

The easiest way to reclaim rent from empty token accounts on the **Gorbagana** blockchain. Our user-friendly web interface with Backpack wallet integration makes token burning effortless. Professional service with industry-low 5% fee.

## 🔥 Key Features

- **Easy Web Interface**: No command line required - simple point-and-click
- **Backpack Wallet Integration**: Seamless connection to Gorbagana network
- **Batch Processing**: Close up to 14 token accounts in a single transaction
- **High Success Rate**: >90% transaction success rate with optimized compute budget
- **Safety First**: Only closes accounts with zero balance to prevent accidental token loss
- **Transparent 5% Fee**: Industry-low service fee - you keep 95% of reclaimed rent
- **Professional Service**: Comprehensive error handling and reliable execution

## 💰 Service Fee

Gor Incinerator offers the **lowest fees in the industry**:

- **5% Service Fee**: Industry-leading low rate
- **You Keep 95%**: More than competitors charging 15%+
- **Transparent**: All fees displayed upfront before transaction
- **No Hidden Costs**: What you see is what you pay
- **Safe Implementation**: Fee transfer happens atomically with account closures

### Fee Calculation

When closing token accounts, the program:
1. Calculates total rent to be reclaimed (~0.00203928 GOR per account)
2. Applies the configured fee percentage (default 5%)
3. Transfers the fee to the designated recipient wallet
4. User receives the remaining 95% of reclaimed rent

**Example**: Closing 14 accounts
- Total rent reclaimed: ~0.0285 GOR
- Fee (5%): ~0.00143 GOR
- User receives: ~0.0271 GOR

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- A Gorbagana wallet with some GOR for transaction fees
- Access to a Gorbagana RPC endpoint

### Installation

```bash
# Clone the repository
git clone https://github.com/DOGECOIN87/gor-incinerator.com
cd gor-incinerator.com

# Install dependencies
npm install

# Build the project
npm run build
```

### Configuration

Create a `.env` file in the project root:

```dotenv
# Required: RPC endpoint URL - THIS DETERMINES WHICH BLOCKCHAIN YOU USE
# For Gorbagana:
RPC_URL=https://rpc.gorbagana.com
# For Solana Mainnet:
# RPC_URL=https://api.mainnet-beta.solana.com

# Required: Wallet keypair in uint8 array format (64 bytes)
# This is the wallet whose token accounts will be closed
# NOTE: Same wallet can exist on both Solana and Gorbagana, but this program
# will ONLY operate on the blockchain specified by RPC_URL
WALLET=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64]

# Optional: Fee recipient wallet address (Gorbagana/Solana public key)
# If not provided, NO fees will be collected (100% goes to user)
FEE_RECIPIENT=CeD9epfL2eHfbJxKNdCY5Udaisn1hh3zBMiDGeDJs7BL

# Optional: Fee percentage to collect from rent reclaimed (0-100)
# Defaults to 5 if not provided
# Set to 0 to disable fees even with FEE_RECIPIENT configured
FEE_PERCENTAGE=5
```

### ⚠️ Important: Blockchain Separation

The `RPC_URL` is the **only** thing that determines which blockchain you're operating on:

- **Gorbagana RPC** → Operates on Gorbagana network only
- **Solana RPC** → Operates on Solana network only

Your wallet can exist on both blockchains with the same address, but they are **completely separate accounts**. The program will only interact with the blockchain specified in your `RPC_URL`. 

For detailed explanation, see `BLOCKCHAIN_SEPARATION_GUIDE.md`.

### Running the Incinerator

```bash
npm run burn
```

The program will:
1. Connect to your Gorbagana RPC endpoint
2. Scan for empty token accounts in your wallet
3. Build a transaction to close up to 14 accounts
4. Apply the configured fee (if enabled)
5. Execute the transaction
6. Display results including accounts closed and fees collected

**Output Example**:
```
[2024-11-22T10:30:45.123Z] [INFO] Starting Gor Incinerator {"wallet":"ABC...XYZ","feePercentage":5,"feeRecipient":"DEF...UVW"}
[2024-11-22T10:30:45.456Z] [INFO] Found token accounts {"count":47}
[2024-11-22T10:30:46.789Z] [INFO] Fee will be collected {"accountsToClose":14,"feeAmount":0.00143,"feePercentage":5}
[2024-11-22T10:30:47.012Z] [INFO] Transaction successful {"accountsClosed":14,"signature":"5h6x...P123"}
14 token accounts successfully closed
Fee collected: 0.00143 GOR (5%)
```

### Continuous Operation

To maximize GOR recovery, run the program repeatedly:

```bash
# Run multiple times to close all empty accounts
npm run burn
npm run burn
npm run burn
```

Each execution closes up to 14 accounts. Continue running until no more empty accounts remain.

## 🛡️ Safety Features

### Blacklist Protection

Prevent specific token mints from being closed by adding them to the blacklist in `src/burn.ts`:

```typescript
const blacklist = [
  "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm", // Example: USDC
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // Example: USDT
  // Add your important token mints here
];
```

### Zero Balance Verification

The program automatically skips any account with a non-zero balance, ensuring you never accidentally lose tokens.

### Transaction Validation

- Preflight checks enabled by default
- Automatic retry logic (up to 10 attempts)
- 60-second confirmation timeout
- Comprehensive error logging

## 🏗️ Architecture

### Project Structure

```
gor-incinerator.com/
├── src/
│   ├── burn.ts                 # Main execution script
│   ├── config.ts               # Configuration management
│   ├── services/
│   │   ├── accountService.ts   # Token account discovery
│   │   ├── transactionService.ts # Transaction building & execution
│   │   ├── feeService.ts       # Fee calculation & collection
│   │   └── __tests__/          # Comprehensive test suite
│   ├── types/
│   │   └── index.ts            # TypeScript type definitions
│   └── utils/
│       ├── errors.ts           # Custom error classes
│       ├── logger.ts           # Structured logging
│       └── validators.ts       # Input validation
├── Adapting Solana Code for Gorbagana Fork and Front-End Design/
│   ├── App.tsx                 # React app component
│   ├── Home.tsx                # Landing page UI
│   ├── burn.ts                 # Front-end burn logic
│   └── config.ts               # Front-end configuration
└── package.json
```

### Core Services

#### FeeService (`src/services/feeService.ts`)
- Calculates fees based on account count and percentage
- Creates fee transfer instructions
- Validates fee configuration
- Provides transparent fee reporting

#### TransactionService (`src/services/transactionService.ts`)
- Builds optimized transactions with compute budget
- Integrates fee collection seamlessly
- Handles transaction signing and sending
- Implements retry logic with exponential backoff
- Confirms transactions with "processed" commitment

#### AccountService (`src/services/accountService.ts`)
- Discovers token accounts for a wallet
- Filters empty accounts
- Applies blacklist rules
- Handles malformed account data gracefully

## 🧪 Testing

Run the comprehensive test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

Test coverage includes:
- Fee calculation accuracy
- Transaction building with fees
- Account filtering logic
- Error handling scenarios
- Configuration validation

## 🎨 Front-End Design

The project includes a modern, responsive front-end built with React and Tailwind CSS:

- **Hero Section**: Eye-catching introduction with key metrics
- **Features Grid**: Highlights benefits and capabilities
- **Step-by-Step Guide**: Clear instructions for users
- **Dark Theme**: Professional appearance optimized for crypto users
- **Responsive Design**: Works seamlessly on desktop and mobile

### Front-End Files

Located in `Adapting Solana Code for Gorbagana Fork and Front-End Design/`:
- `Home.tsx` - Main landing page component
- `App.tsx` - Application wrapper with routing
- `index.css` - Tailwind CSS styles and custom gradients

## 📊 Fee Implementation Details

### Technical Implementation

The 5% fee is implemented safely and transparently:

1. **Configuration** (`src/config.ts`):
   - Validates `FEE_RECIPIENT` as a valid public key
   - Validates `FEE_PERCENTAGE` is between 0-100
   - Defaults to 5% if not specified

2. **Calculation** (`src/services/feeService.ts`):
   - Uses accurate rent constant (0.00203928 GOR per account)
   - Calculates fee in lamports for precision
   - Rounds down to ensure user never pays more than specified

3. **Integration** (`src/services/transactionService.ts`):
   - Fee instruction added after close instructions
   - Atomic execution - all or nothing
   - Logged for transparency

4. **Execution** (`src/burn.ts`):
   - Displays fee information before transaction
   - Reports fee collected after success
   - Handles cases where no fee is configured

### Security Considerations

- **No Hidden Fees**: All fees are explicitly configured and logged
- **User Control**: Users can disable fees by not setting `FEE_RECIPIENT`
- **Atomic Transactions**: Fee transfer and account closures happen together
- **Validation**: Extensive input validation prevents misconfiguration
- **Open Source**: All code is auditable and transparent

## 🔧 Advanced Configuration

### Custom Fee Percentage

Set any fee percentage from 0% to 100%:

```dotenv
# No fee
FEE_PERCENTAGE=0

# Standard fee
FEE_PERCENTAGE=5

# Higher fee for premium service
FEE_PERCENTAGE=10
```

### Disabling Fees Completely

Simply omit or leave empty the `FEE_RECIPIENT`:

```dotenv
# Fees disabled - user keeps 100% of reclaimed rent
FEE_RECIPIENT=
```

### Custom RPC Endpoints

Use your own Gorbagana RPC for better performance:

```dotenv
RPC_URL=https://your-custom-rpc.gorbagana.com
```

## 📝 Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `RPC_URL` | ✅ Yes | - | Gorbagana RPC endpoint URL |
| `WALLET` | ✅ Yes | - | Wallet keypair (uint8 array, 64 bytes) |
| `FEE_RECIPIENT` | ❌ No | - | Fee recipient public key (if omitted, no fees) |
| `FEE_PERCENTAGE` | ❌ No | `5` | Fee percentage (0-100) |

## 🌐 About Gorbagana

Gorbagana is a high-performance blockchain fork of Solana, engineered for:
- **Speed**: Lightning-fast transaction processing
- **Efficiency**: Low transaction costs
- **Scalability**: High throughput for dApps
- **Compatibility**: Solana-compatible tooling and libraries

The Gor Incinerator leverages Gorbagana's architecture to provide efficient token account management, helping users reclaim valuable rent from unused accounts.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## 📄 License

ISC License - See LICENSE file for details

## 🔗 Links

- **GitHub**: [https://github.com/DOGECOIN87/gor-incinerator.com](https://github.com/DOGECOIN87/gor-incinerator.com)
- **Website**: [https://gor-incinerator.com](https://gor-incinerator.com)

---

**Note**: This is a production-ready implementation with proper fee handling, error management, and user transparency. The 5% fee is optional and fully configurable, ensuring users maintain control over their assets while supporting the development and maintenance of this tool.
