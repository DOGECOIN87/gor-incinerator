/**
 * CORS middleware for API endpoints
 * Allows requests from Gorbag Wallet and gor-incinerator.com
 */

/**
 * CORS headers for API responses
 */
export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*", // Allow all origins (can be restricted in production)
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-api-key",
  "Access-Control-Max-Age": "86400", // 24 hours
};

/**
 * Handle CORS preflight requests
 * @param request - Incoming request
 * @returns Response for OPTIONS request
 */
export function handleCorsPreflightRequest(request: Request): Response | null {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS,
    });
  }
  return null;
}

/**
 * Add CORS headers to response
 * @param response - Original response
 * @returns Response with CORS headers
 */
export function addCorsHeaders(response: Response): Response {
  const newResponse = new Response(response.body, response);
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    newResponse.headers.set(key, value);
  });
  return newResponse;
}
