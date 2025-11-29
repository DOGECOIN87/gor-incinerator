/**
 * POST /build-burn-tx
 * Builds unsigned burn transaction with fee splits
 */

import {
  ComputeBudgetProgram,
  TransactionMessage,
  VersionedTransaction,
  PublicKey,
} from "@solana/web3.js";
import { createCloseAccountInstruction } from "@solana/spl-token";
import { Env, BuildBurnTxRequest, BuildBurnTxResponse, ValidationError } from "../types";
import { createConnection, validateWalletAddress, validateAccountAddresses } from "../services/blockchainService";
import { calculateFee, createFeeInstructions, lamportsToGor } from "../services/feeService";
import { logTransaction } from "../services/databaseService";

/**
 * Handle POST /build-burn-tx request
 * @param request - Incoming request
 * @param env - Environment bindings
 * @returns JSON response with unsigned transaction
 */
export async function handleBuildBurnTx(request: Request, env: Env): Promise<Response> {
  try {
    // Parse request body
    const body = (await request.json()) as BuildBurnTxRequest;

    // Validate required fields
    if (!body.wallet) {
      throw new ValidationError("Missing required field: wallet");
    }

    if (!body.accounts || !Array.isArray(body.accounts) || body.accounts.length === 0) {
      throw new ValidationError("Missing or empty required field: accounts");
    }

    // Validate wallet address
    const wallet = validateWalletAddress(body.wallet);

    // Validate account addresses
    const accountPubkeys = validateAccountAddresses(body.accounts);

    // Limit to max 14 accounts per transaction (Gorbagana compute limit)
    const maxAccounts = body.maxAccounts || 14;
    if (maxAccounts > 14) {
      throw new ValidationError("maxAccounts cannot exceed 14");
    }

    const accountsToClose = accountPubkeys.slice(0, maxAccounts);
    const accountCount = accountsToClose.length;

    // Calculate fees
    const feeCalc = calculateFee(accountCount);

    // Create connection to Gorbagana RPC
    const connection = createConnection(env.GOR_RPC_URL);

    // Get latest blockhash
    const { blockhash } = await connection.getLatestBlockhash("processed");

    // Build transaction instructions
    const instructions = [
      // Compute budget instructions for optimization
      ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1000 }),
      ComputeBudgetProgram.setComputeUnitLimit({ units: 45000 }),
    ];

    // Add close account instructions
    for (const accountPubkey of accountsToClose) {
      instructions.push(
        createCloseAccountInstruction(
          accountPubkey, // Token account to close
          wallet, // Destination for reclaimed rent
          wallet // Authority (owner of token account)
        )
      );
    }

    // Add fee transfer instructions (50/50 split)
    const feeInstructions = createFeeInstructions(
      accountCount,
      wallet,
      env.GOR_VAULT_ADDRESS_AETHER,
      env.GOR_VAULT_ADDRESS_INCINERATOR
    );
    instructions.push(...feeInstructions);

    // Create transaction message
    const message = new TransactionMessage({
      payerKey: wallet,
      recentBlockhash: blockhash,
      instructions,
    }).compileToV0Message();

    // Create versioned transaction
    const transaction = new VersionedTransaction(message);

    // Serialize transaction to base64
    const serializedTx = Buffer.from(transaction.serialize()).toString("base64");

    // Log transaction to database
    await logTransaction(env.DB, {
      wallet: body.wallet,
      accountsClosed: accountCount,
      totalRent: lamportsToGor(feeCalc.totalRent),
      serviceFee: lamportsToGor(feeCalc.serviceFee),
      aetherLabsFee: lamportsToGor(feeCalc.aetherLabsFee),
      gorIncineratorFee: lamportsToGor(feeCalc.gorIncineratorFee),
    });

    // Build response
    const response: BuildBurnTxResponse = {
      transaction: serializedTx,
      accountsToClose: accountCount,
      totalRent: lamportsToGor(feeCalc.totalRent),
      serviceFee: lamportsToGor(feeCalc.serviceFee),
      feeBreakdown: {
        aetherLabs: lamportsToGor(feeCalc.aetherLabsFee),
        gorIncinerator: lamportsToGor(feeCalc.gorIncineratorFee),
      },
      youReceive: lamportsToGor(feeCalc.netAmount),
      blockhash,
      requiresSignatures: [body.wallet],
    };

    return new Response(JSON.stringify(response, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error in handleBuildBurnTx:", error);

    if (error instanceof ValidationError) {
      return new Response(
        JSON.stringify({
          error: "Validation Error",
          message: error.message,
          status: 400,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Unknown error",
        status: 500,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
