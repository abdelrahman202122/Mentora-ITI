import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role: string;
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
  }

  interface Session {
    user: {
      id: string;
      role?: string;
    } & NonNullable<DefaultSession["user"]>;
    error?: "RefreshAccessTokenError";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    role?: string;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    error?: "RefreshAccessTokenError";
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    userId?: string;
    role?: string;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    error?: "RefreshAccessTokenError";
  }
}
