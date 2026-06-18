import { auth } from "@/auth";
import { MOCK_SESSION_COOKIE, verifySession } from "@/lib/auth-session";
import { isUserIdValidSync } from "@/lib/mock-auth-store";
import { NextResponse } from "next/server";

export default auth((req) => {
  const hasNextAuth = !!req.auth;
  const hasApiSession = !!req.cookies.get("accessToken")?.value;
  const mockSessionCookie = req.cookies.get(MOCK_SESSION_COOKIE)?.value;
  const verifiedUserId = mockSessionCookie ? verifySession(mockSessionCookie) : null;
  const isMockLoggedIn = verifiedUserId ? isUserIdValidSync(verifiedUserId) : false;
  const isLoggedIn = hasNextAuth || hasApiSession || isMockLoggedIn;
  const { nextUrl } = req;

  const isAuthRoute =
    nextUrl.pathname === "/Login" ||
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
    const loginUrl = new URL("/Login", nextUrl);
    loginUrl.searchParams.set("next", nextUrl.pathname);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
