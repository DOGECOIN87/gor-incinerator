/**
 * Database service for transaction logging and reconciliation
 * Uses Cloudflare D1 (SQLite) for persistent storage
 */

import { Env, TransactionRow, TransactionRecord } from "../types";

/**
 * Log a new transaction to the database
 * @param db - D1 Database instance
 * @param data - Transaction data to log
 * @returns Inserted transaction ID
 */
export async function logTransaction(
  db: D1Database,
  data: {
    wallet: string;
    accountsClosed: number;
    totalRent: number;
    serviceFee: number;
    aetherLabsFee: number;
    gorIncineratorFee: number;
  }
): Promise<number> {
  const timestamp = new Date().toISOString();

  const result = await db
    .prepare(
      `INSERT INTO transactions 
       (timestamp, wallet, accounts_closed, total_rent, service_fee, aether_labs_fee, gor_incinerator_fee, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      timestamp,
      data.wallet,
      data.accountsClosed,
      data.totalRent,
      data.serviceFee,
      data.aetherLabsFee,
      data.gorIncineratorFee,
      "pending"
    )
    .run();

  // D1 returns lastRowId as a number
  return result.meta.last_row_id || 0;
}

/**
 * Update transaction status and hash after confirmation
 * @param db - D1 Database instance
 * @param id - Transaction ID
 * @param txHash - On-chain transaction hash
 * @param status - Transaction status
 */
export async function updateTransactionStatus(
  db: D1Database,
  id: number,
  txHash: string,
  status: "confirmed" | "failed"
): Promise<void> {
  await db
    .prepare(`UPDATE transactions SET tx_hash = ?, status = ? WHERE id = ?`)
    .bind(txHash, status, id)
    .run();
}

/**
 * Query transactions for a date range
 * @param db - D1 Database instance
 * @param startDate - Start date (ISO format YYYY-MM-DD)
 * @param endDate - End date (ISO format YYYY-MM-DD)
 * @returns Array of transaction records
 */
export async function queryTransactionsByDateRange(
  db: D1Database,
  startDate: string,
  endDate: string
): Promise<TransactionRecord[]> {
  const result = await db
    .prepare(
      `SELECT * FROM transactions 
       WHERE DATE(timestamp) >= DATE(?) AND DATE(timestamp) <= DATE(?)
       ORDER BY timestamp DESC`
    )
    .bind(startDate, endDate)
    .all<TransactionRow>();

  return (result.results || []).map(rowToRecord);
}

/**
 * Get summary statistics for a date range
 * @param db - D1 Database instance
 * @param startDate - Start date (ISO format YYYY-MM-DD)
 * @param endDate - End date (ISO format YYYY-MM-DD)
 * @returns Summary statistics
 */
export async function getReconciliationSummary(
  db: D1Database,
  startDate: string,
  endDate: string
): Promise<{
  totalTransactions: number;
  totalAccountsClosed: number;
  totalRent: number;
  totalFees: number;
  aetherLabsShare: number;
  gorIncineratorShare: number;
}> {
  const result = await db
    .prepare(
      `SELECT 
         COUNT(*) as total_transactions,
         SUM(accounts_closed) as total_accounts_closed,
         SUM(total_rent) as total_rent,
         SUM(service_fee) as total_fees,
         SUM(aether_labs_fee) as aether_labs_share,
         SUM(gor_incinerator_fee) as gor_incinerator_share
       FROM transactions 
       WHERE DATE(timestamp) >= DATE(?) AND DATE(timestamp) <= DATE(?)`
    )
    .bind(startDate, endDate)
    .first<{
      total_transactions: number;
      total_accounts_closed: number;
      total_rent: number;
      total_fees: number;
      aether_labs_share: number;
      gor_incinerator_share: number;
    }>();

  return {
    totalTransactions: result?.total_transactions || 0,
    totalAccountsClosed: result?.total_accounts_closed || 0,
    totalRent: result?.total_rent || 0,
    totalFees: result?.total_fees || 0,
    aetherLabsShare: result?.aether_labs_share || 0,
    gorIncineratorShare: result?.gor_incinerator_share || 0,
  };
}

/**
 * Convert database row to TransactionRecord
 * @param row - Database row
 * @returns TransactionRecord
 */
function rowToRecord(row: TransactionRow): TransactionRecord {
  return {
    id: row.id,
    timestamp: row.timestamp,
    wallet: row.wallet,
    accountsClosed: row.accounts_closed,
    totalRent: row.total_rent,
    serviceFee: row.service_fee,
    aetherLabsFee: row.aether_labs_fee,
    gorIncineratorFee: row.gor_incinerator_fee,
    txHash: row.tx_hash,
    status: row.status as "pending" | "confirmed" | "failed",
    createdAt: row.created_at,
  };
}

/**
 * Initialize database schema (run once during setup)
 * @param db - D1 Database instance
 */
export async function initializeDatabase(db: D1Database): Promise<void> {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS transactions (
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
      )`
    )
    .run();

  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_timestamp ON transactions(timestamp)`).run();
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_wallet ON transactions(wallet)`).run();
  await db.prepare(`CREATE INDEX IF NOT EXISTS idx_status ON transactions(status)`).run();
}
