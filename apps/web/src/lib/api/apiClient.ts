
const REFRESH_ENDPOINT = "/api/users/refresh-token";

/* ─── Global refresh state (shared across all API calls) ─── */
let refreshPromise: Promise<boolean> | null = null;

/**
 * Refresh the access token. If a refresh is already in progress,
 * wait for it instead of starting a second one.
 */
async function refreshAccessToken(): Promise<boolean> {
  // If a refresh is already running, wait for it
  if (refreshPromise) {
    return refreshPromise;
  }

  // Start a new refresh
  refreshPromise = (async () => {
    try {
      const res = await fetch(REFRESH_ENDPOINT, {
        method: "POST",
        credentials: "include",
      });
      return res.ok;
    } catch {
      return false;
    } finally {
      // Clear the promise so future 401s can trigger a new refresh
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Wrapper around fetch that automatically refreshes the access token
 * and retries the request once if it gets a 401.
 */
export async function apiFetch(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  // First attempt
  let res = await fetch(url, {
    ...options,
    credentials: "include",
  });

  // If 401, try refreshing once and retry
  if (res.status === 401) {
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      // Retry the original request with the new access token cookie
      res = await fetch(url, {
        ...options,
        credentials: "include",
      });
    }
  }

  return res;
}