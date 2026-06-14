"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { MOCK_SESSION_COOKIE } from "@/lib/auth-session";
import { verifyMockUser } from "@/lib/mock-auth-store";
import { loginSchema } from "@/lib/schemas";

export async function loginAction(_prevState: unknown, formData: FormData) {
  const result = loginSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors };
  }

  const verifiedUser = await verifyMockUser(
    result.data.email,
    result.data.password
  );

  if (!verifiedUser.ok) {
    if (verifiedUser.reason === "ACCOUNT_NOT_FOUND") {
      return {
        formError: "No account found with this email. Please sign up first.",
      };
    }

    return {
      errors: {
        password: ["Password is incorrect"],
      },
    };
  }

  const cookieStore = await cookies();

  cookieStore.set(MOCK_SESSION_COOKIE, verifiedUser.user.id, {
    httpOnly: true,
    maxAge: 60 * 60 * 24,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  redirect("/Home");
}
