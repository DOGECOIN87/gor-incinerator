# Gor-Incinerator.fun - Burn Junk - Get Gor - Premium Token Burning Service

The easiest way to reclaim rent from empty token accounts on the **Gorbagana** blockchain. Professional service with a transparent 5% fee.

## 🔥 Features

- **Easy-to-use web interface** - No command line required
- **Backpack wallet integration** - Seamless connection to Gorbagana network
- Close up to 14 token accounts per transaction
- >90% success rate with optimized compute budget
- **Transparent 5% service fee** - You keep 95% of reclaimed rent
- Safety: Only closes zero-balance accounts
- Professional service with comprehensive logging

## 💰 Service Fee

- **5% of reclaimed rent** - Industry-leading low fee
- **You keep 95%** - More than other services charging 15%+
- **Transparent** - All fees clearly displayed before transaction
- **No hidden costs** - What you see is what you pay

## 🚀 Quick Start

### Web Interface (Recommended)

1. Visit **https://gor-incinerator.fun**
2. Connect your **Backpack wallet**
3. Review accounts to close
4. Confirm transaction and reclaim your GOR

### Command Line (Advanced)

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

## 📝 Fee Implementation

The 5% fee is implemented with:
- Accurate rent calculation (~0.00203928 GOR per account)
- Atomic execution with account closures
- Full transparency and logging
- User control (can be disabled)
- Comprehensive validation

See `src/services/feeService.ts` for implementation details.

## 🌐 About Gorbagana

Gorbagana is a high-performance Solana fork designed for speed, efficiency, and scalability. The Gor Incinerator provides the easiest way for users to reclaim rent from unused token accounts.

## 💼 Why Choose Gor Incinerator?

- **Lowest fees in the industry** - Only 5% vs 15%+ from competitors
- **0% fees** for Gorbagio NFT holders-
- **Backpack wallet support** - The only wallet compatible with Gorbagana
- **Gorbag Wallet** support coming soon!
- **User-friendly interface** - No technical knowledge required
- **Proven reliability** - >90% success rate
- **Transparent pricing** - See exactly what you'll receive before confirming

## 📄 License

ISC License

## 🔗 Links

- **Website**: https://gor-incinerator.com
- **GitHub**: https://github.com/DOGECOIN87/gor-incinerator.com
- **Support**: Contact @mattrickbeats via X.com

---

**Gor Incinerator** - The professional token burning service for Gorbagana network users.
