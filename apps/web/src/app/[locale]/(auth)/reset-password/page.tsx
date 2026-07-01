/**
 * This route is handled by a permanent server-level redirect in next.config.ts:
 *   /en/reset-password → /en/forgot-password
 *   /ar/reset-password → /ar/forgot-password
 *
 * The file must exist so Next.js registers the route segment, but the redirect
 * fires before any page component renders so this export is never used.
 */
export default function ResetPasswordPage() {
  return null;
}
