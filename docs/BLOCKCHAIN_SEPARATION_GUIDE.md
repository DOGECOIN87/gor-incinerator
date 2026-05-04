# Blockchain Separation: Solana vs Cookie Chain

## How It Works

The Cook Incinerator is **blockchain-specific** based on the `RPC_URL` you configure. The same wallet can exist on both Solana and Cookie Chain, but the program will **only interact with the blockchain specified in your configuration**.

## Key Concept: RPC_URL Determines the Blockchain

```typescript
// In src/config.ts
Config.connection = new Connection(Config.RPC_URL, {
  commitment: "processed",
});
```

The `RPC_URL` is the **only** thing that determines which blockchain you're connecting to:

- **Solana RPC** → Operates on Solana mainnet
- **Cookie Chain RPC** → Operates on Cookie Chain network

## Same Wallet, Different Blockchains

### Understanding Wallet Addresses

When you derive a wallet from a seed/keypair:
```
Seed: [1,2,3,...,64]
↓
Public Key: ABC123...XYZ (same on both chains)
```

The **same public key** exists on both blockchains, but they are **completely separate accounts** with:
- Different token accounts
- Different balances
- Different transaction histories
- Different state

Think of it like having the same email address on Gmail and Outlook - same identifier, completely different inboxes.

## Configuration Examples

### For Cookie Chain (Default)
```dotenv
# .env
RPC_URL=https://rpc.cookiescan.io
WALLET=[1,2,3,...,64]
FEE_RECIPIENT=CeD9epfL2eHfbJxKNdCY5Udaisn1hh3zBMiDGeDJs7BL
FEE_PERCENTAGE=5
```

**Result**: Program connects to Cookie Chain, closes token accounts on Cookie Chain only.

### For Solana Mainnet
```dotenv
# .env
RPC_URL=https://api.mainnet-beta.solana.com
WALLET=[1,2,3,...,64]
FEE_RECIPIENT=CeD9epfL2eHfbJxKNdCY5Udaisn1hh3zBMiDGeDJs7BL
FEE_PERCENTAGE=5
```

**Result**: Program connects to Solana, closes token accounts on Solana only.

## How the Program Queries Accounts

```typescript
// In src/burn.ts
const atas = await Config.connection.getParsedTokenAccountsByOwner(
  Config.cookWallet.publicKey,
  {
    programId: TOKEN_PROGRAM_ID,
  }
);
```

This query goes to **only the RPC endpoint specified** in `Config.connection`, which is determined by your `RPC_URL`.

## Practical Scenarios

### Scenario 1: Wallet with Tokens on Both Chains

**Your Wallet**: `ABC123...XYZ`

**On Solana**:
- 50 token accounts
- 10 empty, 40 with tokens

**On Cookie Chain**:
- 30 token accounts  
- 20 empty, 10 with tokens

**Running with Cookie Chain RPC**:
```bash
# .env has RPC_URL=https://rpc.cookiescan.io
npm run burn
```
**Result**: Closes up to 14 of the 20 empty accounts **on Cookie Chain only**. Solana accounts are untouched.

**Running with Solana RPC**:
```bash
# .env has RPC_URL=https://api.mainnet-beta.solana.com
npm run burn
```
**Result**: Closes up to 14 of the 10 empty accounts **on Solana only**. Cookie Chain accounts are untouched.

### Scenario 2: Using Different Configurations

You can maintain separate `.env` files:

**`.env.cookie chain`**:
```dotenv
RPC_URL=https://rpc.cookiescan.io
WALLET=[your,wallet,bytes]
FEE_RECIPIENT=CeD9epfL2eHfbJxKNdCY5Udaisn1hh3zBMiDGeDJs7BL
FEE_PERCENTAGE=5
```

**`.env.solana`**:
```dotenv
RPC_URL=https://api.mainnet-beta.solana.com
WALLET=[your,wallet,bytes]
FEE_RECIPIENT=CeD9epfL2eHfbJxKNdCY5Udaisn1hh3zBMiDGeDJs7BL
FEE_PERCENTAGE=5
```

Then run with specific config:
```bash
# For Cookie Chain
cp .env.cookie chain .env && npm run burn

# For Solana
cp .env.solana .env && npm run burn
```

## Network Isolation Guarantees

### What Prevents Cross-Chain Operations?

1. **RPC Connection**: The `Connection` object only talks to one RPC endpoint
2. **Transaction Submission**: Transactions are sent to the connected RPC
3. **Account Queries**: All queries go through the single connection
4. **No Cross-Chain Logic**: The code has no mechanism to interact with multiple chains

### Code Flow
```
User runs program
    ↓
Config.initialize() reads RPC_URL
    ↓
Creates Connection to that specific RPC
    ↓
All operations use that Connection
    ↓
Transactions sent to that blockchain only
```

## Safety Considerations

### ✅ Safe Operations

**Using same wallet on both chains**: Completely safe. The program only touches the chain you specify.

**Running program multiple times**: Safe. Each run is independent and blockchain-specific.

**Switching between chains**: Safe. Just change `RPC_URL` and run again.

### ⚠️ Important Notes

**Fee Recipient Address**: The fee recipient address (`CeD9epfL2eHfbJxKNdCY5Udaisn1hh3zBMiDGeDJs7BL`) is the same public key on both chains, but:
- On Cookie Chain: Receives COOK tokens
- On Solana: Would receive SOL tokens (if you ran it there)

**Token Program ID**: Cookie Chain uses a **different** Token Program ID than Solana:
- **Cookie Chain**: `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`
- **Solana**: `TokenkegQfeZyiNwAJbPVwwQQfuM32jneSYP1daM`

This code is configured specifically for Cookie Chain. The same transaction structure and instruction format work on both chains, but you must use the correct Program IDs for each chain.

## Verification: How to Check Which Chain You're On

Add this to your `.env` file and check the logs:

```typescript
// The program logs this on startup
Logger.info("Starting Cook Incinerator", {
  wallet: Config.cookWallet.publicKey.toString(),
  rpcUrl: Config.RPC_URL, // This shows which chain
  feePercentage: Config.feePercentage,
});
```

Output will show:
```
[INFO] Starting Cook Incinerator {
  "wallet":"ABC123...XYZ",
  "rpcUrl":"https://rpc.cookiescan.io",  ← This confirms the chain
  "feePercentage":5
}
```

## Common RPC Endpoints

### Cookie Chain
- `https://rpc.cookiescan.io`
- `https://rpc.cookiescan.io`
- Custom Cookie Chain RPC endpoints

### Solana Mainnet
- `https://api.mainnet-beta.solana.com` (public, rate-limited)
- `https://solana-api.projectserum.com`
- Custom Solana RPC endpoints (Helius, QuickNode, etc.)

### Solana Devnet (for testing)
- `https://api.devnet.solana.com`

## Best Practices

### 1. Always Verify Your RPC_URL
Before running, double-check which blockchain you're targeting:
```bash
cat .env | grep RPC_URL
```

### 2. Use Descriptive .env Files
```bash
.env.cookie chain.mainnet
.env.solana.mainnet
.env.solana.devnet
```

### 3. Log Everything
The program logs the RPC URL on startup - always check this before confirming transactions.

### 4. Test on Devnet First
If you're unsure, test on Solana devnet first:
```dotenv
RPC_URL=https://api.devnet.solana.com
```

## Technical Deep Dive

### How Blockchains Are Isolated

```typescript
// Each Connection instance is bound to ONE RPC endpoint
class Connection {
  constructor(endpoint: string, commitment?: Commitment) {
    this._rpcEndpoint = endpoint; // Locked to this endpoint
    // All methods use this._rpcEndpoint
  }
  
  async getParsedTokenAccountsByOwner(...) {
    // Makes HTTP request to this._rpcEndpoint only
    return fetch(this._rpcEndpoint, ...);
  }
  
  async sendTransaction(...) {
    // Sends transaction to this._rpcEndpoint only
    return fetch(this._rpcEndpoint, ...);
  }
}
```

### Why Same Code Works on Both Chains

Cookie Chain is a **fork of Solana**, meaning:
- Same account structure
- Same transaction format
- Same program IDs (Token Program, System Program, etc.)
- Same RPC API interface
- Same cryptographic primitives

The only difference is the **network** - different validators, different state, different tokens.

## Summary

**Q: How does it work when a wallet has tokens on both Solana and Cookie Chain?**

**A**: The program operates on **only one blockchain at a time**, determined by your `RPC_URL`:

1. **RPC_URL** = Cookie Chain → Only touches Cookie Chain accounts
2. **RPC_URL** = Solana → Only touches Solana accounts
3. **Same wallet address** on both chains = **Completely separate accounts**
4. **No cross-chain interaction** - physically impossible with this architecture
5. **Safe to use same wallet** on both chains - they're isolated

To manage accounts on both chains, you would:
1. Run with Cookie Chain RPC → Closes Cookie Chain accounts
2. Change RPC_URL to Solana
3. Run again → Closes Solana accounts

Each run is completely independent and blockchain-specific.

---

**Bottom Line**: The `RPC_URL` is your blockchain selector. Change it to change which blockchain you're operating on. The program has no way to interact with multiple chains simultaneously.
