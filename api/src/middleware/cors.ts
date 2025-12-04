/**
 * CORS middleware for API endpoints
 * Allows requests from Gorbag Wallet and gor-incinerator.fun
 */

/**
 * Allowed origins for CORS
 * Add your production domains here
 */
const ALLOWED_ORIGINS = [
  "https://gor-incinerator.fun",
  "https://www.gor-incinerator.fun",
  "https://app.gorbag.wallet",
  "https://gorbag.wallet",
  "http://localhost:5173", // Local development
  "http://localhost:3000", // Local development
];

/**
 * Get CORS headers for a specific origin
 * @param origin - Request origin
 * @returns CORS headers object
 */
export function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-api-key",
    "Access-Control-Max-Age": "86400", // 24 hours
  };
}

/**
 * CORS headers for API responses (default - use getCorsHeaders for dynamic origin)
 */
export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGINS[0],
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
