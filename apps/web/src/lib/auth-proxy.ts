/**
 * Proxy/Middleware helper for authentication
 * Supports both mock sessions and API tokens
 *
 * Usage in middleware.ts:
 * ```
 * import { auth } from "@/auth";
 * import { verifyAuthToken } from "@/lib/auth-proxy";
 *
 * export default auth((req) => {
 *   const isAuthenticated = verifyAuthToken(req);
 *   // Handle routing based on authentication
 * });
 * ```
 */

import { cookies as getCookies } from 'next/headers';
import type { NextRequest } from 'next/server';

// Cookie names
export const MOCK_SESSION_COOKIE = 'mentora_session';
export const API_AUTH_TOKEN_COOKIE = 'auth_token';

/**
 * Verify authentication from request cookies
 * Checks both mock session and API token
 */
export async function verifyAuthToken(request: NextRequest): Promise<{
  isAuthenticated: boolean;
  userId?: string;
  authType: 'mock' | 'api' | 'nextauth' | null;
} | null> {
  const cookieStore = await getCookies();

  // Check for Next Auth session (NextAuth.js)
  const nextAuthSession = request.cookies.get('next-auth.session-token');
  if (nextAuthSession?.value) {
    return {
      isAuthenticated: true,
      authType: 'nextauth',
    };
  }

  // Check for API token (JWT)
  const apiToken = cookieStore.get(API_AUTH_TOKEN_COOKIE)?.value;
  if (apiToken) {
    // For JWT tokens, you might want to verify the signature here
    // For now, we trust the httpOnly cookie
    return {
      isAuthenticated: true,
      authType: 'api',
    };
  }

  // Check for mock session (development only)
  const mockSession = cookieStore.get(MOCK_SESSION_COOKIE)?.value;
  if (mockSession) {
    return {
      isAuthenticated: true,
      userId: mockSession, // In mock, this might contain userId
      authType: 'mock',
    };
  }

  return {
    isAuthenticated: false,
    authType: null,
  };
}

/**
 * Get the auth token from cookies
 * Returns either API token or mock session
 */
export async function getActiveAuthToken(): Promise<string | null> {
  const cookieStore = await getCookies();

  // Prefer API token
  const apiToken = cookieStore.get(API_AUTH_TOKEN_COOKIE)?.value;
  if (apiToken) return apiToken;

  // Fall back to mock session
  const mockSession = cookieStore.get(MOCK_SESSION_COOKIE)?.value;
  if (mockSession) return mockSession;

  return null;
}

/**
 * Clear all auth tokens/sessions
 */
export async function clearAllAuth(): Promise<void> {
  const cookieStore = await getCookies();
  cookieStore.delete(API_AUTH_TOKEN_COOKIE);
  cookieStore.delete(MOCK_SESSION_COOKIE);
}
