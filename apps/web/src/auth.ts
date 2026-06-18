import NextAuth from "next-auth";
import type { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";

import { loginSchema } from "@/lib/schemas";

type LoginResponse = {
  success: boolean;
  data: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
};

const ACCESS_TOKEN_REFRESH_BUFFER_MS = 30_000;
const refreshRequests = new Map<string, Promise<JWT>>();

function getApiUrl(): string {
  return (
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:4000/api"
  ).replace(/\/$/, "");
}

function getSetCookieHeaders(headers: Headers): string[] {
  const headersWithGetSetCookie = headers as Headers & {
    getSetCookie?: () => string[];
  };

  if (headersWithGetSetCookie.getSetCookie) {
    return headersWithGetSetCookie.getSetCookie();
  }

  const setCookie = headers.get("set-cookie");
  return setCookie ? [setCookie] : [];
}

function getCookieValue(headers: Headers, name: string): string | null {
  const pattern = new RegExp(`(?:^|,\\s*)${name}=([^;]+)`);

  for (const header of getSetCookieHeaders(headers)) {
    const match = header.match(pattern);

    if (match?.[1]) {
      return decodeURIComponent(match[1]);
    }
  }

  return null;
}

function getJwtExpiry(token: string): number {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString("utf8")
    ) as { exp?: number };

    if (payload.exp) {
      return payload.exp * 1000;
    }
  } catch {
    // The API remains responsible for validating the token.
  }

  return Date.now() + 15 * 60 * 1000;
}

async function requestNewTokens(token: JWT): Promise<JWT> {
  if (!token.refreshToken) {
    return { ...token, error: "RefreshAccessTokenError" };
  }

  const response = await fetch(`${getApiUrl()}/users/refresh-token`, {
    method: "POST",
    headers: {
      Cookie: `refreshToken=${encodeURIComponent(token.refreshToken)}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Token refresh failed with status ${response.status}`);
  }

  const accessToken = getCookieValue(response.headers, "accessToken");
  const refreshToken = getCookieValue(response.headers, "refreshToken");

  if (!accessToken || !refreshToken) {
    throw new Error("Token refresh response did not include both tokens");
  }

  return {
    ...token,
    accessToken,
    refreshToken,
    accessTokenExpires: getJwtExpiry(accessToken),
    error: undefined,
  };
}

function refreshAccessToken(token: JWT): Promise<JWT> {
  if (!token.refreshToken) {
    return Promise.resolve({ ...token, error: "RefreshAccessTokenError" });
  }

  const existingRequest = refreshRequests.get(token.refreshToken);

  if (existingRequest) {
    return existingRequest;
  }

  const refreshToken = token.refreshToken;
  const request = requestNewTokens(token).catch((error: unknown) => {
    console.error(
      "Failed to refresh access token",
      error instanceof Error ? error.message : "Unknown error"
    );

    return { ...token, error: "RefreshAccessTokenError" as const };
  });

  refreshRequests.set(refreshToken, request);
  void request.finally(() => {
    if (refreshRequests.get(refreshToken) === request) {
      refreshRequests.delete(refreshToken);
    }
  });

  return request;
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsedCredentials = loginSchema.safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const response = await fetch(`${getApiUrl()}/users/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(parsedCredentials.data),
          cache: "no-store",
        });

        if (!response.ok) {
          return null;
        }

        const result = (await response.json()) as LoginResponse;
        const accessToken = getCookieValue(response.headers, "accessToken");
        const refreshToken = getCookieValue(response.headers, "refreshToken");

        if (!result.success || !result.data?.id || !accessToken || !refreshToken) {
          return null;
        }

        return {
          ...result.data,
          accessToken,
          refreshToken,
          accessTokenExpires: getJwtExpiry(accessToken),
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.role = user.role;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.accessTokenExpires = user.accessTokenExpires;
        return token;
      }

      if (
        token.accessTokenExpires &&
        Date.now() < token.accessTokenExpires - ACCESS_TOKEN_REFRESH_BUFFER_MS
      ) {
        return token;
      }

      return refreshAccessToken(token);
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId ?? token.sub ?? "";
        session.user.role = token.role ?? "";
      }

      session.error = token.error;

      return session;
    },
  },
});
