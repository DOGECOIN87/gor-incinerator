-- Initial database schema for Gor-Incinerator transaction logging
-- Cloudflare D1 (SQLite) database

-- Transactions table
-- Stores all burn transactions for reconciliation and analytics
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

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_timestamp ON transactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_wallet ON transactions(wallet);
CREATE INDEX IF NOT EXISTS idx_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_created_at ON transactions(created_at);

-- Insert sample data for testing (optional, remove in production)
-- INSERT INTO transactions (timestamp, wallet, accounts_closed, total_rent, service_fee, aether_labs_fee, gor_incinerator_fee, tx_hash, status)
-- VALUES 
--   ('2025-01-15T10:30:00Z', 'ABC123...', 10, 0.0203928, 0.00101964, 0.00050982, 0.00050982, 'tx123...', 'confirmed'),
--   ('2025-01-16T14:20:00Z', 'DEF456...', 14, 0.02854992, 0.00142750, 0.00071375, 0.00071375, 'tx456...', 'confirmed');
