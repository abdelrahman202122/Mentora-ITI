import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getCurrentUserServer } from "@/services/auth/auth-server-service";
import type { UserRole } from "@/types/auth/auth-types";
import { hasAnyRole } from "@/utils/auth/role-utils";
import { getLocalePath } from "@/utils/i18n/locale-path";

type ServerAuthGuardProps = {
  allowedRoles?: readonly UserRole[];
  children: React.ReactNode;
  locale: string;
};

export async function ServerAuthGuard({
  allowedRoles,
  children,
  locale,
}: ServerAuthGuardProps) {
  const user = await getCurrentUserServer();

  if (!user) {
    const requestHeaders = await headers();
    const pathname = requestHeaders.get("x-pathname") ?? "";
    const loginPath = getLocalePath(locale, "/login");

    if (pathname) {
      const params = new URLSearchParams({ next: pathname });
      redirect(`${loginPath}?${params.toString()}`);
    }

    redirect(loginPath);
  }

  if (allowedRoles && !hasAnyRole(user, allowedRoles)) {
    redirect(getLocalePath(locale, "/"));
  }

  return children;
}
