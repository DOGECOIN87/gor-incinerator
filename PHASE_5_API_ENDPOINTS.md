# Phase 5 — Complete API Endpoints

This phase involved integrating the core logic developed in Phases 2 and 3 into the main API handlers for `/assets` and `/build-burn-tx` in `api/src/index.ts`. The mock responses have been replaced with real logic that interacts with the Solana RPC (via the `blockchainService`) and the transaction builder.

## A. `GET /assets/:wallet` Handler

The handler now correctly implements the required logic:

1.  Uses the `apiKeyAuth` middleware (updated in Phase 4).
2.  Validates the wallet address.
3.  Fetches all token accounts from the Gorbagana RPC.
4.  Uses the new `enrichTokenAccounts` logic (Phase 3) to determine `burnEligible` status, including the mint authority check.
5.  Calculates and returns the required summary fields (`totalAccounts`, `burnEligible`, `totalRent`, `serviceFee`, `youReceive`).

### Final Revised Handler (`api/src/index.ts`)

```typescript
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
```

## B. `POST /build-burn-tx` Handler

The handler now correctly implements the transaction building and logging logic:

1.  Uses the `apiKeyAuth` middleware.
2.  Validates the request body.
3.  Delegates the core transaction building logic to the `buildBurnTransaction` function (Phase 2), which handles all instructions, fee calculations, and transaction serialization.
4.  Logs the transaction details (including the real calculated fees and rent) to the D1 database.
5.  Returns the base64-encoded, unsigned `VersionedTransaction` and the required metadata.

### Final Revised Handler (`api/src/index.ts`)

```typescript
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
```
