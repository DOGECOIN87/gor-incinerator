/**
 * GET /assets/:wallet
 * Returns all burn-eligible token accounts for a wallet
 */

import { Env, AssetsResponse, ValidationError } from "../types";
import {
  createConnection,
  fetchTokenAccounts,
  filterBurnEligibleAccounts,
  validateWalletAddress,
} from "../services/blockchainService";
import { calculateFee, lamportsToGor } from "../services/feeService";

/**
 * Handle GET /assets/:wallet request
 * @param request - Incoming request
 * @param env - Environment bindings
 * @param walletAddress - Wallet address from URL parameter
 * @returns JSON response with burn-eligible accounts
 */
export async function handleGetAssets(
  request: Request,
  env: Env,
  walletAddress: string
): Promise<Response> {
  try {
    // Validate wallet address
    const wallet = validateWalletAddress(walletAddress);

    // Create connection to Gorbagana RPC
    const connection = createConnection(env.GOR_RPC_URL);

    // Fetch all token accounts for wallet
    const allAccounts = await fetchTokenAccounts(connection, wallet);

    // Filter for burn-eligible accounts
    const burnEligibleAccounts = filterBurnEligibleAccounts(allAccounts);

    // Calculate summary
    const accountCount = burnEligibleAccounts.length;
    const feeCalc = accountCount > 0 ? calculateFee(accountCount) : null;

    const summary = {
      totalAccounts: allAccounts.length,
      burnEligible: accountCount,
      totalRent: feeCalc ? lamportsToGor(feeCalc.totalRent) : 0,
      serviceFee: feeCalc ? lamportsToGor(feeCalc.serviceFee) : 0,
      youReceive: feeCalc ? lamportsToGor(feeCalc.netAmount) : 0,
    };

    const response: AssetsResponse = {
      wallet: walletAddress,
      accounts: burnEligibleAccounts,
      summary,
    };

    return new Response(JSON.stringify(response, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error in handleGetAssets:", error);

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
