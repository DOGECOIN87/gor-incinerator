/**
 * Authentication middleware for API endpoints
 * Validates API keys from x-api-key header
 */

import { Env, AuthenticationError } from "../types";

/**
 * Validates API key from request header
 * @param request - Incoming request
 * @param env - Environment bindings
 * @param requireAdmin - Whether to require admin API key
 * @returns True if authenticated
 * @throws AuthenticationError if authentication fails
 */
export function authenticateRequest(
  request: Request,
  env: Env,
  requireAdmin: boolean = false
): boolean {
  const apiKey = request.headers.get("x-api-key");

  if (!apiKey) {
    throw new AuthenticationError("Missing API key. Include x-api-key header.");
  }

  // Check admin key if required
  if (requireAdmin) {
    if (apiKey !== env.ADMIN_API_KEY) {
      throw new AuthenticationError("Invalid admin API key.");
    }
    return true;
  }

  // Check regular API key
  if (apiKey !== env.API_KEY && apiKey !== env.ADMIN_API_KEY) {
    throw new AuthenticationError("Invalid API key.");
  }

  return true;
}

/**
 * Middleware wrapper for authenticated routes
 * @param handler - Route handler function
 * @param requireAdmin - Whether to require admin API key
 * @returns Wrapped handler with authentication
 */
export function withAuth(
  handler: (request: Request, env: Env, ctx: ExecutionContext) => Promise<Response>,
  requireAdmin: boolean = false
) {
  return async (request: Request, env: Env, ctx: ExecutionContext): Promise<Response> => {
    try {
      authenticateRequest(request, env, requireAdmin);
      return await handler(request, env, ctx);
    } catch (error) {
      if (error instanceof AuthenticationError) {
        return new Response(
          JSON.stringify({
            error: "Authentication Failed",
            message: error.message,
            status: 401,
          }),
          {
            status: 401,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
      throw error;
    }
  };
}
