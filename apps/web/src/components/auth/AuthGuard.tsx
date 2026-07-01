"use client";

import { Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/auth/use-auth";
import type { UserRole } from "@/types/auth/auth-types";
import { hasAnyRole } from "@/utils/auth/role-utils";
import { getLocalePath } from "@/utils/i18n/locale-path";

type AuthGuardProps = {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
};

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const { data: user, error, isPending, refetch } = useCurrentUser();
  const hasAllowedRole = !allowedRoles || hasAnyRole(user, allowedRoles);

  useEffect(() => {
    if (isPending || error) {
      return;
    }

    if (!user) {
      const params = new URLSearchParams({ next: pathname });
      router.replace(
        `${getLocalePath(locale, "/login")}?${params.toString()}`,
      );
      return;
    }

    if (!hasAllowedRole) {
      router.replace(getLocalePath(locale, "/"));
    }
  }, [error, hasAllowedRole, isPending, locale, pathname, router, user]);

  if (error) {
    return (
      <AuthState message="We could not verify your session.">
        <Button onClick={() => void refetch()} type="button" variant="outline">
          Try again
        </Button>
      </AuthState>
    );
  }

  if (isPending || !user || !hasAllowedRole) {
    return (
      <AuthState message="Checking your session">
        <Loader2 className="size-5 animate-spin text-indigo-600" />
      </AuthState>
    );
  }

  return children;
}

function AuthState({
  children,
  message,
}: {
  children: React.ReactNode;
  message: string;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f7fb] px-4 text-slate-700">
      <div className="flex items-center gap-3 text-sm font-medium" role="status">
        {children}
        <span>{message}</span>
      </div>
    </main>
  );
}
