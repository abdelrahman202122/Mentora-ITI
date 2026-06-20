"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/auth/use-auth";
import { getSafeRedirectPath } from "@/utils/auth/safe-redirect";
import { getLocalePath } from "@/utils/i18n/locale-path";

export function GuestGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const locale = useLocale();
  const { data: user, error, isPending, refetch } = useCurrentUser();

  useEffect(() => {
    if (!isPending && !error && user) {
      const nextPath = new URLSearchParams(window.location.search).get("next");
      router.replace(
        getSafeRedirectPath(
          nextPath,
          window.location.origin,
          getLocalePath(locale, "/"),
        ),
      );
    }
  }, [error, isPending, locale, router, user]);

  if (error) {
    return (
      <GuestState message="We could not check your session.">
        <Button onClick={() => void refetch()} type="button" variant="outline">
          Try again
        </Button>
      </GuestState>
    );
  }

  if (isPending || user) {
    return (
      <GuestState message="Checking your session">
        <Loader2 className="size-5 animate-spin text-indigo-600" />
      </GuestState>
    );
  }

  return children;
}

function GuestState({
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
