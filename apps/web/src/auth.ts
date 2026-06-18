import NextAuth from "next-auth";
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

        const apiUrl =
          process.env.API_URL ??
          process.env.NEXT_PUBLIC_API_URL ??
          "http://localhost:4000/api";
        const response = await fetch(`${apiUrl.replace(/\/$/, "")}/users/login`, {
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

        if (!result.success || !result.data?.id) {
          return null;
        }

        return result.data;
      },
    }),
  ],
});
