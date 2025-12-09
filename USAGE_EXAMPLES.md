# Gor-Incinerator API Usage Examples

Complete examples for integrating with the Gor-Incinerator API.

## 🔑 Authentication

All API requests require the `x-api-key` header:

```bash
curl -H "x-api-key: YOUR_API_KEY" https://api.gor-incinerator.com/health
```

---

## 📋 Example 1: GET /assets/:wallet

Fetch all burn-eligible token accounts for a wallet.

### cURL

```bash
curl -X GET "https://api.gor-incinerator.com/assets/7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

### JavaScript/TypeScript

```typescript
async function fetchBurnEligibleAccounts(walletAddress: string) {
  const response = await fetch(
    `https://api.gor-incinerator.com/assets/${walletAddress}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.API_KEY!,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return await response.json();
}

// Usage
const assets = await fetchBurnEligibleAccounts("7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU");
console.log(`Found ${assets.summary.burnEligible} burn-eligible accounts`);
console.log(`Total rent: ${assets.summary.totalRent} GOR`);
console.log(`Service fee: ${assets.summary.serviceFee} GOR`);
console.log(`You receive: ${assets.summary.youReceive} GOR`);
```

### Python

```python
import requests
import os

def fetch_burn_eligible_accounts(wallet_address):
    url = f"https://api.gor-incinerator.com/assets/{wallet_address}"
    headers = {
        "Content-Type": "application/json",
        "x-api-key": os.getenv("API_KEY")
    }
    
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    return response.json()

# Usage
assets = fetch_burn_eligible_accounts("7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU")
print(f"Found {assets['summary']['burnEligible']} burn-eligible accounts")
print(f"Total rent: {assets['summary']['totalRent']} GOR")
print(f"Service fee: {assets['summary']['serviceFee']} GOR")
print(f"You receive: {assets['summary']['youReceive']} GOR")
```

### Response Example

```json
{
  "wallet": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "accounts": [
    {
      "pubkey": "8sLbNZoA1cfnvMJLPfp98ZLAnFSYCFApfJKMbiXNLwxj",
      "mint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "balance": "0",
      "burnEligible": true,
      "estimatedRent": 0.00203928
    },
    {
      "pubkey": "9vJXKxGqVXFJzqXqGZXqKqVXFJzqXqGZXqKqVXFJzqXq",
      "mint": "So11111111111111111111111111111111111111112",
      "balance": "0",
      "burnEligible": true,
      "estimatedRent": 0.00203928
    }
  ],
  "summary": {
    "totalAccounts": 20,
    "burnEligible": 15,
    "totalRent": 0.03058920,
    "serviceFee": 0.00152946,
    "youReceive": 0.02905974
  }
}
```

---

## 🔥 Example 2: POST /build-burn-tx

Build an unsigned burn transaction with fee splits.

### cURL

```bash
curl -X POST "https://api.gor-incinerator.com/build-burn-tx" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "wallet": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    "accounts": [
      "8sLbNZoA1cfnvMJLPfp98ZLAnFSYCFApfJKMbiXNLwxj",
      "9vJXKxGqVXFJzqXqGZXqKqVXFJzqXqGZXqKqVXFJzqXq"
    ],
    "maxAccounts": 14
  }'
```

### JavaScript/TypeScript

```typescript
import { VersionedTransaction } from "@solana/web3.js";

async function buildBurnTransaction(
  walletAddress: string,
  accounts: string[]
) {
  const response = await fetch(
    "https://api.gor-incinerator.com/build-burn-tx",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.API_KEY!,
      },
      body: JSON.stringify({
        wallet: walletAddress,
        accounts: accounts,
        maxAccounts: 14,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return await response.json();
}

async function signAndSendTransaction(txData: any, wallet: any) {
  // Deserialize transaction
  const txBuffer = Buffer.from(txData.transaction, "base64");
  const transaction = VersionedTransaction.deserialize(txBuffer);

  // Sign with wallet
  const signedTx = await wallet.signTransaction(transaction);

  // Send to blockchain
  const signature = await wallet.connection.sendRawTransaction(
    signedTx.serialize()
  );

  // Wait for confirmation
  await wallet.connection.confirmTransaction(signature, "processed");

  return signature;
}

// Usage
const txData = await buildBurnTransaction(
  "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  [
    "8sLbNZoA1cfnvMJLPfp98ZLAnFSYCFApfJKMbiXNLwxj",
    "9vJXKxGqVXFJzqXqGZXqKqVXFJzqXqGZXqKqVXFJzqXq",
  ]
);

console.log(`Closing ${txData.accountsToClose} accounts`);
console.log(`Total rent: ${txData.totalRent} GOR`);
console.log(`Service fee: ${txData.serviceFee} GOR`);
console.log(`  → Aether Labs: ${txData.feeBreakdown.aetherLabs} GOR`);
console.log(`  → Gor-incinerator: ${txData.feeBreakdown.gorIncinerator} GOR`);
console.log(`You receive: ${txData.youReceive} GOR`);

const signature = await signAndSendTransaction(txData, wallet);
console.log(`Transaction: ${signature}`);
```

### Python

```python
import requests
import os
import base64
from solders.transaction import VersionedTransaction

def build_burn_transaction(wallet_address, accounts):
    url = "https://api.gor-incinerator.com/build-burn-tx"
    headers = {
        "Content-Type": "application/json",
        "x-api-key": os.getenv("API_KEY")
    }
    data = {
        "wallet": wallet_address,
        "accounts": accounts,
        "maxAccounts": 14
    }
    
    response = requests.post(url, headers=headers, json=data)
    response.raise_for_status()
    return response.json()

# Usage
tx_data = build_burn_transaction(
    "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    [
        "8sLbNZoA1cfnvMJLPfp98ZLAnFSYCFApfJKMbiXNLwxj",
        "9vJXKxGqVXFJzqXqGZXqKqVXFJzqXqGZXqKqVXFJzqXq"
    ]
)

print(f"Closing {tx_data['accountsToClose']} accounts")
print(f"Total rent: {tx_data['totalRent']} GOR")
print(f"Service fee: {tx_data['serviceFee']} GOR")
print(f"  → Aether Labs: {tx_data['feeBreakdown']['aetherLabs']} GOR")
print(f"  → Gor-incinerator: {tx_data['feeBreakdown']['gorIncinerator']} GOR")
print(f"You receive: {tx_data['youReceive']} GOR")

# Deserialize transaction
tx_bytes = base64.b64decode(tx_data['transaction'])
transaction = VersionedTransaction.from_bytes(tx_bytes)

# Sign and send (requires wallet integration)
# signature = wallet.sign_and_send_transaction(transaction)
```

### Response Example

```json
{
  "transaction": "AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAEDBQZHiJ...",
  "accountsToClose": 2,
  "totalRent": 0.00407856,
  "serviceFee": 0.00020393,
  "feeBreakdown": {
    "aetherLabs": 0.00010196,
    "gorIncinerator": 0.00010196
  },
  "youReceive": 0.00387463,
  "blockhash": "9sHcv6xwn9YkB8nxTUGKDwPwNnmqVp5oAXxU8Fdkm4J5",
  "requiresSignatures": [
    "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
  ]
}
```

---

## 📊 Example 3: GET /reconciliation/report

Generate monthly reconciliation report (admin only).

### cURL

```bash
curl -X GET "https://api.gor-incinerator.com/reconciliation/report?start=2025-01-01&end=2025-01-31" \
  -H "x-api-key: YOUR_ADMIN_API_KEY" \
  -H "Content-Type: application/json"
```

### JavaScript/TypeScript

```typescript
async function getReconciliationReport(startDate: string, endDate: string) {
  const url = new URL("https://api.gor-incinerator.com/reconciliation/report");
  url.searchParams.append("start", startDate);
  url.searchParams.append("end", endDate);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ADMIN_API_KEY!,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return await response.json();
}

// Usage
const report = await getReconciliationReport("2025-01-01", "2025-01-31");

console.log(`\n=== Reconciliation Report ===`);
console.log(`Period: ${report.period.start} to ${report.period.end}`);
console.log(`\nSummary:`);
console.log(`  Total Transactions: ${report.summary.totalTransactions}`);
console.log(`  Total Accounts Closed: ${report.summary.totalAccountsClosed}`);
console.log(`  Total Rent: ${report.summary.totalRent} GOR`);
console.log(`  Total Fees: ${report.summary.totalFees} GOR`);
console.log(`\nFee Split:`);
console.log(`  Aether Labs: ${report.summary.aetherLabsShare} GOR`);
console.log(`  Gor-incinerator: ${report.summary.gorIncineratorShare} GOR`);

// Export to CSV
const csv = [
  "ID,Timestamp,Wallet,Accounts Closed,Total Rent,Service Fee,Aether Labs Fee,Gor-incinerator Fee,TX Hash,Status",
  ...report.transactions.map((tx: any) =>
    [
      tx.id,
      tx.timestamp,
      tx.wallet,
      tx.accountsClosed,
      tx.totalRent,
      tx.serviceFee,
      tx.aetherLabsFee,
      tx.gorIncineratorFee,
      tx.txHash || "",
      tx.status,
    ].join(",")
  ),
].join("\n");

console.log(`\nCSV Export:\n${csv}`);
```

### Python

```python
import requests
import os
import csv
from datetime import datetime

def get_reconciliation_report(start_date, end_date):
    url = "https://api.gor-incinerator.com/reconciliation/report"
    params = {
        "start": start_date,
        "end": end_date
    }
    headers = {
        "Content-Type": "application/json",
        "x-api-key": os.getenv("ADMIN_API_KEY")
    }
    
    response = requests.get(url, params=params, headers=headers)
    response.raise_for_status()
    return response.json()

def export_to_csv(report, filename):
    with open(filename, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow([
            "ID", "Timestamp", "Wallet", "Accounts Closed",
            "Total Rent", "Service Fee", "Aether Labs Fee",
            "Gor-incinerator Fee", "TX Hash", "Status"
        ])
        
        for tx in report['transactions']:
            writer.writerow([
                tx['id'],
                tx['timestamp'],
                tx['wallet'],
                tx['accountsClosed'],
                tx['totalRent'],
                tx['serviceFee'],
                tx['aetherLabsFee'],
                tx['gorIncineratorFee'],
                tx['txHash'] or '',
                tx['status']
            ])

# Usage
report = get_reconciliation_report("2025-01-01", "2025-01-31")

print("\n=== Reconciliation Report ===")
print(f"Period: {report['period']['start']} to {report['period']['end']}")
print("\nSummary:")
print(f"  Total Transactions: {report['summary']['totalTransactions']}")
print(f"  Total Accounts Closed: {report['summary']['totalAccountsClosed']}")
print(f"  Total Rent: {report['summary']['totalRent']} GOR")
print(f"  Total Fees: {report['summary']['totalFees']} GOR")
print("\nFee Split:")
print(f"  Aether Labs: {report['summary']['aetherLabsShare']} GOR")
print(f"  Gor-incinerator: {report['summary']['gorIncineratorShare']} GOR")

# Export to CSV
export_to_csv(report, f"reconciliation_{report['period']['start']}_to_{report['period']['end']}.csv")
print("\nReport exported to CSV")
```

### Response Example

```json
{
  "period": {
    "start": "2025-01-01",
    "end": "2025-01-31"
  },
  "summary": {
    "totalTransactions": 1250,
    "totalAccountsClosed": 15000,
    "totalRent": 30.5892,
    "totalFees": 1.52946,
    "aetherLabsShare": 0.76473,
    "gorIncineratorShare": 0.76473
  },
  "transactions": [
    {
      "id": 1,
      "timestamp": "2025-01-15T10:30:00Z",
      "wallet": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
      "accountsClosed": 14,
      "totalRent": 0.02854992,
      "serviceFee": 0.00142750,
      "aetherLabsFee": 0.00071375,
      "gorIncineratorFee": 0.00071375,
      "txHash": "5j7s8t9u0v1w2x3y4z5a6b7c8d9e0f1g2h3i4j5k6l7m8n9o0p1q2r3s4t5u6v7w8x9y0z",
      "status": "confirmed",
      "createdAt": "2025-01-15T10:29:55Z"
    }
  ]
}
```

---

## 🔄 Complete Integration Example

### Gorbag Wallet Integration

```typescript
import { Connection, VersionedTransaction, PublicKey } from "@solana/web3.js";

class GorIncineratorClient {
  private apiUrl: string;
  private apiKey: string;

  constructor(apiUrl: string, apiKey: string) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.apiUrl}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "API request failed");
    }

    return response.json();
  }

  async fetchBurnEligibleAccounts(walletAddress: string) {
    return this.request(`/assets/${walletAddress}`);
  }

  async buildBurnTransaction(
    walletAddress: string,
    accounts: string[],
    maxAccounts: number = 14
  ) {
    return this.request("/build-burn-tx", {
      method: "POST",
      body: JSON.stringify({
        wallet: walletAddress,
        accounts,
        maxAccounts,
      }),
    });
  }

  async executeBurn(
    walletAddress: string,
    accounts: string[],
    signTransaction: (tx: VersionedTransaction) => Promise<VersionedTransaction>,
    connection: Connection
  ) {
    // 1. Build transaction via API
    const txData = await this.buildBurnTransaction(walletAddress, accounts);

    console.log(`Burning ${txData.accountsToClose} accounts`);
    console.log(`Total rent: ${txData.totalRent} GOR`);
    console.log(`Service fee: ${txData.serviceFee} GOR`);
    console.log(`  → Aether Labs: ${txData.feeBreakdown.aetherLabs} GOR`);
    console.log(`  → Gor-incinerator: ${txData.feeBreakdown.gorIncinerator} GOR`);
    console.log(`You receive: ${txData.youReceive} GOR`);

    // 2. Deserialize transaction
    const txBuffer = Buffer.from(txData.transaction, "base64");
    const transaction = VersionedTransaction.deserialize(txBuffer);

    // 3. Sign transaction
    const signedTx = await signTransaction(transaction);

    // 4. Send to blockchain
    const signature = await connection.sendRawTransaction(signedTx.serialize());

    // 5. Wait for confirmation
    await connection.confirmTransaction(signature, "processed");

    return {
      signature,
      accountsClosed: txData.accountsToClose,
      totalRent: txData.totalRent,
      serviceFee: txData.serviceFee,
      feeBreakdown: txData.feeBreakdown,
      youReceive: txData.youReceive,
    };
  }
}

// Usage in Gorbag Wallet
const client = new GorIncineratorClient(
  "https://api.gor-incinerator.com",
  process.env.API_KEY!
);

// Scan for burn-eligible accounts
const assets = await client.fetchBurnEligibleAccounts(wallet.publicKey.toString());

// Show user the accounts and fee breakdown
showBurnDialog({
  accounts: assets.accounts,
  totalRent: assets.summary.totalRent,
  serviceFee: assets.summary.serviceFee,
  youReceive: assets.summary.youReceive,
});

// Execute burn
const result = await client.executeBurn(
  wallet.publicKey.toString(),
  assets.accounts.map((a) => a.pubkey),
  (tx) => wallet.signTransaction(tx),
  connection
);

console.log(`Burn complete! Transaction: ${result.signature}`);
```

---

## 📄 License

ISC License
