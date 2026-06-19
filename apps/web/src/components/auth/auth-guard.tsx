"use client";

import { Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-auth";
import type { UserRole } from "@/types/auth";

type AuthGuardProps = {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
};

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: user, error, isPending, refetch } = useCurrentUser();
  const hasAllowedRole = !allowedRoles || (user ? allowedRoles.includes(user.role) : false);

  useEffect(() => {
    if (isPending || error) {
      return;
    }

    if (!user) {
      const params = new URLSearchParams({ next: pathname });
      router.replace(`/login?${params.toString()}`);
      return;
    }

    if (!hasAllowedRole) {
      router.replace("/Home");
    }
  }, [error, hasAllowedRole, isPending, pathname, router, user]);

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
