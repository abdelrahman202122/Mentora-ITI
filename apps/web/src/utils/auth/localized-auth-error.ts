/**
 * Maps raw backend error messages to localized translations.
 *
 * `t` should be `useTranslations("auth.errors")` from next-intl.
 * Unknown messages fall back to `t("generic")` so raw English is never
 * shown to the user.
 */
export function getLocalizedAuthError(
  errorMessage: string | undefined,
  t: (key: string) => string,
): string {
  if (!errorMessage) {
    return t("generic");
  }

  const lower = errorMessage.toLowerCase();

  if (
    lower.includes("invalid credentials") ||
    lower.includes("invalid email or password") ||
    lower.includes("incorrect password") ||
    lower.includes("user not found")
  ) {
    return t("invalidCredentials");
  }

  if (
    lower.includes("duplicate") ||
    lower.includes("already exists") ||
    lower.includes("already registered") ||
    lower.includes("email already")
  ) {
    return t("emailAlreadyExists");
  }

  if (lower.includes("unauthorized") || lower.includes("not authorized")) {
    return t("unauthorized");
  }

  return t("generic");
}
