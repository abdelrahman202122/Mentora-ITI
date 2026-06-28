import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";

import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = `/${routing.defaultLocale}`;
    return NextResponse.redirect(url);
  }

  // Clone request headers and inject the pathname so server components
  // can read it via headers().
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  // Run the intl middleware for locale detection & rewrites.
  const intlResponse = intlMiddleware(request);

  // If intl middleware issued a redirect, pass it through unchanged.
  if (intlResponse.headers.has("location")) {
    return intlResponse;
  }

  // Compose: build a response that carries both the custom request
  // headers (visible to server components) and the intl middleware
  // headers (locale cookie, rewrites, etc.).
  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  intlResponse.headers.forEach((value, key) => {
    response.headers.set(key, value);
  });

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
