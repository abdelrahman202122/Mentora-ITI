export function getSafeRedirectPath(
  candidate: string | null,
  origin: string
): string {
  if (!candidate?.startsWith("/")) {
    return "/Home";
  }

  try {
    const redirectUrl = new URL(candidate, origin);
    return redirectUrl.origin === origin
      ? `${redirectUrl.pathname}${redirectUrl.search}${redirectUrl.hash}`
      : "/Home";
  } catch {
    return "/Home";
  }
}
