/**
 * GET /reconciliation/report
 * Returns reconciliation report for date range
 * Requires admin API key
 */

import { Env, ReconciliationResponse, ValidationError } from "../types";
import { queryTransactionsByDateRange, getReconciliationSummary } from "../services/databaseService";

/**
 * Validate date string format (YYYY-MM-DD)
 * @param dateStr - Date string to validate
 * @returns True if valid
 */
function isValidDateFormat(dateStr: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) {
    return false;
  }

  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Handle GET /reconciliation/report request
 * @param request - Incoming request
 * @param env - Environment bindings
 * @returns JSON response with reconciliation report
 */
export async function handleReconciliationReport(request: Request, env: Env): Promise<Response> {
  try {
    // Parse query parameters
    const url = new URL(request.url);
    const startDate = url.searchParams.get("start");
    const endDate = url.searchParams.get("end");

    // Validate required parameters
    if (!startDate) {
      throw new ValidationError("Missing required query parameter: start (format: YYYY-MM-DD)");
    }

    if (!endDate) {
      throw new ValidationError("Missing required query parameter: end (format: YYYY-MM-DD)");
    }

    // Validate date formats
    if (!isValidDateFormat(startDate)) {
      throw new ValidationError(`Invalid start date format: ${startDate}. Expected YYYY-MM-DD`);
    }

    if (!isValidDateFormat(endDate)) {
      throw new ValidationError(`Invalid end date format: ${endDate}. Expected YYYY-MM-DD`);
    }

    // Validate date range
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      throw new ValidationError("Start date must be before or equal to end date");
    }

    // Query database for transactions in date range
    const transactions = await queryTransactionsByDateRange(env.DB, startDate, endDate);

    // Get summary statistics
    const summary = await getReconciliationSummary(env.DB, startDate, endDate);

    // Build response
    const response: ReconciliationResponse = {
      period: {
        start: startDate,
        end: endDate,
      },
      summary: {
        totalTransactions: summary.totalTransactions,
        totalAccountsClosed: summary.totalAccountsClosed,
        totalRent: summary.totalRent,
        totalFees: summary.totalFees,
        aetherLabsShare: summary.aetherLabsShare,
        gorIncineratorShare: summary.gorIncineratorShare,
      },
      transactions,
    };

    return new Response(JSON.stringify(response, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error in handleReconciliationReport:", error);

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
