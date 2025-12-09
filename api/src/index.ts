import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { env } from 'hono/adapter';
import { createClient } from '@supabase/supabase-js';
import {
  createConnection,
  validateWalletAddress,
  fetchTokenAccounts,
  enrichTokenAccounts,
} from './services/blockchainService';
import { buildBurnTransaction } from './services/transactionBuilder';
import {
  AssetsResponse,
  BuildBurnTxRequest,
  BuildBurnTxResponse,
  ValidationError,
  BlockchainError,
} from './types';

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
  const { API_KEY } = env<Bindings>(c);
  const apiKey = c.req.header('x-api-key');
  if (!apiKey || apiKey !== API_KEY) {
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

  try {
    // 1. Validate wallet address
    const walletPubkey = validateWalletAddress(wallet);

    // 2. Create connection
    const connection = createConnection(GOR_RPC_URL);

    // 3. Fetch all token accounts
    const parsedAccounts = await fetchTokenAccounts(connection, walletPubkey);

    // 4. Enrich accounts with burn eligibility (uses new logic from Phase 3)
    const enrichedAccounts = await enrichTokenAccounts(
      connection,
      walletPubkey,
      parsedAccounts
    );

    // 5. Calculate summary
    const burnEligibleAccounts = enrichedAccounts.filter((a) => a.burnEligible);
    const totalRent = burnEligibleAccounts.reduce(
      (sum, a) => sum + a.estimatedRent,
      0
    );
    const serviceFee = totalRent * 0.05;
    const youReceive = totalRent - serviceFee;

    const response: AssetsResponse = {
      wallet,
      accounts: enrichedAccounts,
      summary: {
        totalAccounts: enrichedAccounts.length,
        burnEligible: burnEligibleAccounts.length,
        totalRent: totalRent,
        serviceFee: serviceFee,
        youReceive: youReceive,
      },
    };

    return c.json(response);
  } catch (error) {
    if (error instanceof ValidationError || error instanceof BlockchainError) {
      return c.json({ error: error.message }, 400);
    }
    console.error('Error in /assets:', error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

// 2. POST /build-burn-tx
app.post('/build-burn-tx', apiKeyAuth, async (c) => {
  const { DB, GOR_RPC_URL } = env<Bindings>(c);

  try {
    const requestBody = (await c.req.json()) as BuildBurnTxRequest;
    const { wallet, accounts } = requestBody;

    if (!wallet || !accounts || accounts.length === 0) {
      throw new ValidationError('Invalid request body: wallet and accounts are required.');
    }

    // 1. Create connection
    const connection = createConnection(GOR_RPC_URL);

    // 2. Build the transaction (uses new logic from Phase 2)
    const txResponse: BuildBurnTxResponse = await buildBurnTransaction(
      connection,
      env<Bindings>(c),
      requestBody
    );

    // 3. Log to D1 database (pending status)
    const timestamp = new Date().toISOString();
    const insertStmt = DB.prepare(
      `INSERT INTO transactions (timestamp, wallet, accounts_closed, total_rent, service_fee, aether_labs_fee, gor_incinerator_fee, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );

    try {
      await insertStmt.bind(
        timestamp,
        wallet,
        txResponse.accountsToClose,
        txResponse.totalRent,
        txResponse.serviceFee,
        txResponse.feeBreakdown.aetherLabs,
        txResponse.feeBreakdown.gorIncinerator,
        'pending'
      ).run();
    } catch (e) {
      console.error('D1 Insert Error:', e);
      // Continue with the transaction build even if logging fails
    }

    // 4. Return the transaction response
    return c.json(txResponse);
  } catch (error) {
    if (error instanceof ValidationError || error instanceof BlockchainError) {
      return c.json({ error: error.message }, 400);
    }
    console.error('Error in /build-burn-tx:', error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
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
