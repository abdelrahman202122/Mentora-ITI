import { redirect } from "next/navigation";

import { getCurrentUserServer } from "@/services/auth/auth-server-service";
import type { UserRole } from "@/types/auth/auth-types";
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
    redirect(getLocalePath(locale, "/login"));
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    redirect(getLocalePath(locale, "/"));
  }

  return children;
}
