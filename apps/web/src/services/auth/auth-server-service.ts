import "server-only";

import { cookies } from "next/headers";

import type { ApiSuccess, AuthUser } from "@/types/auth/auth-types";

export async function getCurrentUserServer(): Promise<AuthUser | null> {
  const cookieHeader = (await cookies()).toString();

  if (!cookieHeader) {
    return null;
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!apiBaseUrl) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl.replace(/\/$/, "")}/users/me`, {
      cache: "no-store",
      signal: controller.signal,
      headers: {
        cookie: cookieHeader,
      },
    });
  } catch (error) {
    console.error("Current-user lookup failed", error);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch current user (${response.status})`);
  }

  const body = (await response.json()) as ApiSuccess<AuthUser>;
  return body.data;
}
