"use client";

import { useEffect, useRef } from "react";

/**
 * useSilentTokenRefresh
 * ─────────────────────
 * Calls /api/auth/refresh-token every X minutes to keep the
 * access token fresh. Without this, the user gets logged out
 * the moment their short-lived access token expires.
 *
 * @param intervalMs How often to refresh (default: 13 minutes —
 *                   slightly less than the typical 15-min access
 *                   token lifetime so we refresh BEFORE expiry)
 */

const REFRESH_ENDPOINT = "/api/users/refresh-token"; // adjust to your route

export function useSilentTokenRefresh(intervalMs = 13 * 60 * 1000) {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Don't run during SSR
    if (typeof window === "undefined") return;

    const refresh = async () => {
      try {
        const res = await fetch(REFRESH_ENDPOINT, {
          method: "POST",
          credentials: "include", // send the refreshToken cookie
        });
        if (!res.ok) {
          // Refresh failed — refresh token is gone/expired.
          // User will need to log in again on next 401.
          console.warn("[auth] silent refresh failed:", res.status);
        }
      } catch (err) {
        console.warn("[auth] silent refresh error:", err);
      }
    };

    // Refresh immediately on mount (in case we just loaded the page
    // with an old access token still in the cookie)
    void refresh();

    // Then refresh on a fixed interval
    timerRef.current = setInterval(refresh, intervalMs);

    // Also refresh whenever the tab regains focus (user came back)
    const onVisibility = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [intervalMs]);
}