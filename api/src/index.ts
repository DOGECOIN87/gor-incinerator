import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { env } from 'hono/adapter';
import { createClient } from '@supabase/supabase-js';

// Define the environment variables expected by the Worker
type Bindings = {
  // Cloudflare D1 Binding
  DB: D1Database;
  // Supabase Bindings (for future use or if D1 is not available)
  SUPABASE_URL: string;
  SUPABASE_KEY: string;
  // Other required environment variables
  GOR_RPC_URL: string;
  GOR_VAULT_ADDRESS_AETHER: string;
  GOR_VAULT_ADDRESS_INCINERATOR: string;
  ADMIN_API_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Enable CORS for all origins for now (can be restricted later)
app.use('/*', cors());

// Middleware for API Key Authentication
const apiKeyAuth = async (c: any, next: any) => {
  const apiKey = c.req.header('x-api-key');
  // For MVP, we will use a simple check. In a real app, this would be a lookup.
  if (!apiKey || apiKey !== 'GORBAG_WALLET_API_KEY_PLACEHOLDER') {
    return c.json({ error: 'Unauthorized: Invalid or missing API Key' }, 401);
  }
  await next();
};

// Middleware for Admin API Key Authentication
const adminApiKeyAuth = async (c: any, next: any) => {
  const { ADMIN_API_KEY } = env<Bindings>(c);
  const apiKey = c.req.header('x-api-key');
  if (!apiKey || apiKey !== ADMIN_API_KEY) {
    return c.json({ error: 'Unauthorized: Invalid or missing Admin API Key' }, 401);
  }
  await next();
};

// --- Database Setup (D1 MVP) ---

// Function to initialize the D1 schema if it doesn't exist
async function initializeD1Schema(db: D1Database) {
  const schema = `
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL,
      wallet TEXT NOT NULL,
      accounts_closed INTEGER NOT NULL,
      total_rent REAL NOT NULL,
      service_fee REAL NOT NULL,
      aether_labs_fee REAL NOT NULL,
      gor_incinerator_fee REAL NOT NULL,
      tx_hash TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await db.exec(schema);
    console.log('D1 schema initialized successfully.');
  } catch (e) {
    console.error('Error initializing D1 schema:', e);
    // In a real application, you might want to throw here.
  }
}

// --- Endpoints ---

// Health check endpoint
app.get('/', (c) => c.text('Gor-Incinerator API Worker is running!'));

// 1. GET /assets/:wallet
app.get('/assets/:wallet', apiKeyAuth, async (c) => {
  const { wallet } = c.req.param();
  const { GOR_RPC_URL } = env<Bindings>(c);

  // Placeholder for Solana/Gorbagana RPC logic
  // In a real implementation, you would use a library like @solana/web3.js
  // to connect to GOR_RPC_URL and fetch token accounts.
  // For MVP, we return a mock response.

  // await initializeD1Schema(c.env.DB); // Uncomment this line to ensure schema is created on first request

  const mockResponse = {
    wallet,
    accounts: [
      { pubkey: 'DEF456...', mint: 'GHI789...', balance: '0', burnEligible: true, estimatedRent: 0.00203928 },
      { pubkey: 'JKL012...', mint: 'MNO345...', balance: '0', burnEligible: true, estimatedRent: 0.00203928 },
    ],
    summary: {
      totalAccounts: 2,
      burnEligible: 2,
      totalRent: 0.00407856,
      serviceFee: 0.00020393,
      youReceive: 0.00387463,
    },
  };

  return c.json(mockResponse);
});

// 2. POST /build-burn-tx
app.post('/build-burn-tx', apiKeyAuth, async (c) => {
  const { DB, GOR_VAULT_ADDRESS_AETHER, GOR_VAULT_ADDRESS_INCINERATOR } = env<Bindings>(c);
  const { wallet, accounts, maxAccounts } = await c.req.json();

  if (!wallet || !accounts || accounts.length === 0) {
    return c.json({ error: 'Invalid request body' }, 400);
  }

  // Placeholder for transaction building logic
  // In a real implementation, you would use @solana/web3.js to build the transaction
  // with the two fee transfer instructions.

  const accountsToClose = Math.min(accounts.length, maxAccounts || 14);
  const rentPerAccount = 0.00203928; // Mock value
  const totalRent = accountsToClose * rentPerAccount;
  const serviceFee = totalRent * 0.05;
  const aetherLabsFee = serviceFee * 0.5;
  const gorIncineratorFee = serviceFee * 0.5;

  // 1. Log to D1 database (pending status)
  const timestamp = new Date().toISOString();
  const insertStmt = DB.prepare(
    `INSERT INTO transactions (timestamp, wallet, accounts_closed, total_rent, service_fee, aether_labs_fee, gor_incinerator_fee, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );

  try {
    const result = await insertStmt.bind(
      timestamp,
      wallet,
      accountsToClose,
      totalRent,
      serviceFee,
      aetherLabsFee,
      gorIncineratorFee,
      'pending'
    ).run();
    console.log('Transaction logged to D1:', result);
  } catch (e) {
    console.error('D1 Insert Error:', e);
    // Continue with the transaction build even if logging fails for MVP
  }

  const mockTxResponse = {
    transaction: 'base64_encoded_mock_transaction', // Placeholder
    accountsToClose,
    totalRent,
    serviceFee,
    feeBreakdown: {
      aetherLabs: aetherLabsFee,
      gorIncinerator: gorIncineratorFee,
    },
    youReceive: totalRent - serviceFee,
    blockhash: 'ABC123...',
    requiresSignatures: [wallet],
  };

  return c.json(mockTxResponse);
});

// 3. GET /reconciliation/report
app.get('/reconciliation/report', adminApiKeyAuth, async (c) => {
  const { DB } = env<Bindings>(c);
  const { start, end } = c.req.query();

  // Basic validation
  if (!start || !end) {
    return c.json({ error: 'Missing start and end date query parameters' }, 400);
  }

  // 1. Query D1 for all transactions in date range
  const selectStmt = DB.prepare(
    `SELECT * FROM transactions WHERE timestamp BETWEEN ? AND ? AND status = 'pending'` // Using 'pending' for MVP, should be 'confirmed'
  );

  try {
    const { results } = await selectStmt.bind(start, end).all();

    // 2. Aggregate totals
    const summary = results.reduce((acc: any, tx: any) => {
      acc.totalTransactions += 1;
      acc.totalAccountsClosed += tx.accounts_closed;
      acc.totalRent += tx.total_rent;
      acc.totalFees += tx.service_fee;
      acc.aetherLabsShare += tx.aether_labs_fee;
      acc.gorIncineratorShare += tx.gor_incinerator_fee;
      return acc;
    }, {
      totalTransactions: 0,
      totalAccountsClosed: 0,
      totalRent: 0,
      totalFees: 0,
      aetherLabsShare: 0,
      gorIncineratorShare: 0,
    });

    const report = {
      period: { start, end },
      summary,
      transactions: results,
    };

    return c.json(report);
  } catch (e) {
    console.error('D1 Select Error:', e);
    return c.json({ error: 'Failed to generate report from database' }, 500);
  }
});

// Fallback for 404
app.notFound((c) => c.json({ error: 'Not Found' }, 404));

// Export the Hono app as the Cloudflare Worker handler
export default app;
