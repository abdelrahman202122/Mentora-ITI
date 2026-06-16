import { auth } from "@/auth";
import createMiddleware from "next-intl/middleware";
import { MOCK_SESSION_COOKIE, verifySession } from "@/lib/auth-session";
import { isUserIdValidSync } from "@/lib/mock-auth-store";
import { routing } from "./i18n/routing";
import { NextResponse } from "next/server";

const handleI18nRouting = createMiddleware(routing);

export default auth((req) => {
  const hasNextAuth = !!req.auth;
  const mockSessionCookie = req.cookies.get(MOCK_SESSION_COOKIE)?.value;
  const verifiedUserId = mockSessionCookie ? verifySession(mockSessionCookie) : null;
  const isMockLoggedIn = verifiedUserId ? isUserIdValidSync(verifiedUserId) : false;
  const isLoggedIn = hasNextAuth || isMockLoggedIn;
  const { nextUrl } = req;

  const isAuthRoute =
    nextUrl.pathname === "/login" ||
    nextUrl.pathname === "/register";
  const isProtected =
    nextUrl.pathname.startsWith("/Home") ||
    nextUrl.pathname.startsWith("/my-account");

  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/Home", nextUrl));
    }

    return NextResponse.next();
  }

  if (!isLoggedIn && isProtected) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("next", nextUrl.pathname);

    return NextResponse.redirect(loginUrl);
  }

  return handleI18nRouting(req);
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
