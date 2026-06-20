export function getSafeRedirectPath(
  candidate: string | null,
  origin: string,
  fallbackPath: string,
): string {
  if (!candidate?.startsWith("/")) {
    return fallbackPath;
  }

  try {
    const redirectUrl = new URL(candidate, origin);
    return redirectUrl.origin === origin
      ? `${redirectUrl.pathname}${redirectUrl.search}${redirectUrl.hash}`
      : fallbackPath;
  } catch {
    return fallbackPath;
  }
}
