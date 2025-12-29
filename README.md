<p align="center">
  <img src="https://i.ibb.co/bqsvvFv/Logo.png" alt="Gor-Incinerator Logo" width="200">
</p>

<h1 align="center">Gor-Incinerator</h1>

<p align="center">
  <strong>Token Account Cleanup Service for the Gorbagana Blockchain</strong>
</p>

<p align="center">
  <a href="https://api.gor-incinerator.com"><img src="https://img.shields.io/badge/API-Live-success" alt="API Status"></a>
  <a href="https://gorbagana.com"><img src="https://img.shields.io/badge/Blockchain-Gorbagana-blue" alt="Gorbagana"></a>
</p>

---

Gor-Incinerator helps users reclaim rent from empty token accounts on the Gorbagana blockchain. Our service provides a simple, secure way to clean up unused token accounts and recover locked GOR.

---

## What We Do

When you interact with tokens on Gorbagana, each token account requires a small rent deposit (~0.002 GOR). Over time, these empty accounts accumulate and lock up your funds.

**Gor-Incinerator solves this by:**

- Scanning your wallet for empty token accounts
- Building secure transactions to close them
- Returning 95% of the reclaimed rent directly to you

---

## How It Works

```
Connect Wallet  â†’  Scan Accounts  â†’  Select & Burn  â†’  Receive GOR
```

1. **Scan** - We identify all empty token accounts in your wallet
2. **Select** - Choose which accounts to close (up to 14 per transaction)
3. **Sign** - Approve the transaction with your wallet
4. **Receive** - Get 95% of the rent returned instantly

Your private keys never leave your wallet. All transactions are signed locally.

---

## API Integration

We offer API access for wallets and applications looking to integrate token cleanup functionality.

**Base URL:** `https://api.gor-incinerator.com`

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/assets/:wallet` | Get burn-eligible accounts for a wallet |
| `POST` | `/build-burn-tx` | Build an unsigned burn transaction |

### GET /assets/:wallet

Retrieve all empty token accounts eligible for burning.

**Response:**
```json
{
  "wallet": "ABC123...",
  "accounts": [
    {
      "pubkey": "DEF456...",
      "mint": "GHI789...",
      "burnEligible": true,
      "estimatedRent": 0.00203928
    }
  ],
  "summary": {
    "totalAccounts": 15,
    "burnEligible": 15,
    "totalRent": 0.03058920,
    "serviceFee": 0.00152946,
    "youReceive": 0.02905974
  }
}
```

### POST /build-burn-tx

Build an unsigned transaction for closing selected accounts.

**Request:**
```json
{
  "wallet": "ABC123...",
  "accounts": ["DEF456...", "GHI789..."],
  "maxAccounts": 14
}
```

**Response:**
```json
{
  "transaction": "base64_encoded_transaction",
  "accountsToClose": 14,
  "totalRent": 0.02854992,
  "serviceFee": 0.00142750,
  "youReceive": 0.02712242,
  "blockhash": "ABC123...",
  "requiresSignatures": ["ABC123..."]
}
```

API access requires authentication. Contact us for integration details.

---

## Fee Structure

| | |
|---|---|
| **Service Fee** | 5% of reclaimed rent |
| **You Receive** | 95% of reclaimed rent |

**Example:**
| Accounts Closed | Total Rent | Service Fee | You Receive |
|-----------------|------------|-------------|-------------|
| 14 | 0.02855 GOR | 0.00143 GOR | 0.02712 GOR |
| 50 | 0.10196 GOR | 0.00510 GOR | 0.09686 GOR |
| 100 | 0.20393 GOR | 0.01020 GOR | 0.19373 GOR |

---

## Security

| Feature | Description |
|---------|-------------|
| **Non-Custodial** | We never have access to your private keys |
| **Client-Side Signing** | All transactions are signed in your wallet |
| **Atomic Transactions** | Operations complete fully or not at all |
| **Global Infrastructure** | Deployed on Cloudflare's edge network (270+ locations) |
| **DDoS Protected** | Enterprise-grade protection built-in |

---

## For Partners

We offer white-label and integration solutions for:

- **Wallet Providers** - Add token cleanup as a native feature
- **DeFi Platforms** - Help users optimize their accounts
- **Portfolio Trackers** - Display reclaimable rent to users

### Partnership Benefits

- Custom API access and rate limits
- Technical integration support
- Revenue sharing opportunities
- Co-marketing possibilities

---

## Links

| | |
|---|---|
| **Website** | [gor-incinerator.com](https://gor-incinerator.com) |
| **API** | [api.gor-incinerator.com](https://api.gor-incinerator.com) |
| **Gorbagana** | [gorbagana.com](https://gorbagana.com) |

---

## Contact

Interested in integrating Gor-Incinerator or exploring a partnership?

**Get in touch** - [Open an Issue](https://github.com/DOGECOIN87/gor-incinerator/issues) or reach out through our website.

---

<p align="center">
  <img src="https://i.ibb.co/bqsvvFv/Logo.png" alt="Gor-Incinerator" width="80">
  <br>
  <strong>Gor-Incinerator</strong><br>
  Reclaim Your GOR
</p>
