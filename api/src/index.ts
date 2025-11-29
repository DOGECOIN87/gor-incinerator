/**
 * Gor-Incinerator API - Cloudflare Workers
 * Protected API endpoints for Gorbag Wallet integration
 * 
 * Endpoints:
 * - GET /assets/:wallet - List burn-eligible token accounts
 * - POST /build-burn-tx - Build unsigned burn transaction with fee splits
 * - GET /reconciliation/report - Generate reconciliation report (admin only)
 */

import { Env } from "./types";
import { withAuth } from "./middleware/auth";
import { handleCorsPreflightRequest, addCorsHeaders } from "./middleware/cors";
import { handleGetAssets } from "./routes/assets";
import { handleBuildBurnTx } from "./routes/buildBurnTx";
import { handleReconciliationReport } from "./routes/reconciliation";

/**
 * Router for API endpoints
 * @param request - Incoming request
 * @param env - Environment bindings
 * @param ctx - Execution context
 * @returns Response
 */
async function router(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  // Health check endpoint (no auth required)
  if (path === "/" || path === "/health") {
    return new Response(
      JSON.stringify({
        service: "Gor-Incinerator API",
        version: "1.0.0",
        status: "healthy",
        endpoints: [
          "GET /assets/:wallet",
          "POST /build-burn-tx",
          "GET /reconciliation/report",
        ],
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  // GET /assets/:wallet - List burn-eligible accounts
  const assetsMatch = path.match(/^\/assets\/([a-zA-Z0-9]+)$/);
  if (assetsMatch && request.method === "GET") {
    const walletAddress = assetsMatch[1];
    return await withAuth(
      async (req, env) => handleGetAssets(req, env, walletAddress),
      false
    )(request, env, ctx);
  }

  // POST /build-burn-tx - Build burn transaction
  if (path === "/build-burn-tx" && request.method === "POST") {
    return await withAuth(handleBuildBurnTx, false)(request, env, ctx);
  }

  // GET /reconciliation/report - Reconciliation report (admin only)
  if (path === "/reconciliation/report" && request.method === "GET") {
    return await withAuth(handleReconciliationReport, true)(request, env, ctx);
  }

  // 404 Not Found
  return new Response(
    JSON.stringify({
      error: "Not Found",
      message: `Endpoint not found: ${request.method} ${path}`,
      status: 404,
    }),
    {
      status: 404,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

/**
 * Main Worker fetch handler
 * @param request - Incoming request
 * @param env - Environment bindings
 * @param ctx - Execution context
 * @returns Response
 */
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      // Handle CORS preflight requests
      const corsResponse = handleCorsPreflightRequest(request);
      if (corsResponse) {
        return corsResponse;
      }

      // Route request
      const response = await router(request, env, ctx);

      // Add CORS headers to response
      return addCorsHeaders(response);
    } catch (error) {
      console.error("Unhandled error:", error);

      const errorResponse = new Response(
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

      return addCorsHeaders(errorResponse);
    }
  },
};
