"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { LayoutDashboard, Loader2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useCurrentUser, useLogout } from "@/hooks/auth/use-auth";
import { getLocalePath } from "@/utils/i18n/locale-path";

export default function Header() {
  const locale = useLocale();
  const router = useRouter();
  const { data: user, isPending } = useCurrentUser();
  const { mutateAsync: logout, isPending: isLoggingOut } = useLogout();

  const loginPath = getLocalePath(locale, "/login");
  const tutorProfilePath = getLocalePath(locale, "/tutor/CreateProfile");
  const becomeTutorHref = `${loginPath}?next=${encodeURIComponent(tutorProfilePath)}`;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out:", error);
    } finally {
      router.push(loginPath);
    }
  };

  const handleBecomeTutor = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out before becoming a tutor:", error);
    } finally {
      router.push(becomeTutorHref);
    }
  };

  return (
    <nav className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-4 sm:px-8">
      <Link
        href={getLocalePath(locale, "/")}
        className="text-xl font-bold text-indigo-600"
      >
        Mentora
      </Link>

      <div className="flex items-center gap-3 sm:gap-4">
        {isPending ? (
          <Loader2 className="size-5 animate-spin text-indigo-600" />
        ) : user ? (
          <>
            {user.role === "learner" && (
              <Button
                onClick={handleBecomeTutor}
                disabled={isLoggingOut}
                variant="outline"
                className="flex cursor-pointer items-center gap-2 rounded-lg border-indigo-600 bg-transparent px-3 py-2 text-indigo-600 transition hover:bg-indigo-50 sm:px-4"
              >
                {isLoggingOut && <Loader2 className="size-4 animate-spin" />}
                <span>Become a Tutor</span>
              </Button>
            )}

            <Button
              asChild
              variant="outline"
              className="flex items-center gap-2 rounded-lg border-indigo-600 bg-transparent px-3 py-2 text-indigo-600 transition hover:bg-indigo-50 sm:px-4"
            >
              <Link
                href={getLocalePath(
                  locale,
                  user.role === "tutor" ? "/tutor/dashboard" : "/dashboard",
                )}
              >
                <LayoutDashboard className="size-4" />
                <span className="xs:inline">My dashboard</span>
              </Link>
            </Button>

            <Button
              onClick={handleLogout}
              variant="destructive"
              disabled={isLoggingOut}
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-white transition hover:bg-red-700 sm:px-4"
            >
              {isLoggingOut ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <LogOut className="size-4" />
              )}
              <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
            </Button>
          </>
        ) : (
          <>
            <Button
              asChild
              variant="outline"
              className="rounded-lg border-indigo-600 bg-transparent px-3 py-2 text-indigo-600 transition hover:bg-indigo-50 sm:px-4"
            >
              <Link href={becomeTutorHref}>Become a Tutor</Link>
            </Button>

            <Button
              asChild
              className="cursor-pointer rounded-lg bg-indigo-600 px-3 py-2 text-white transition hover:bg-indigo-700 sm:px-4"
            >
              <Link href={loginPath}>Log in</Link>
            </Button>
          </>
        )}
      </div>
    </nav>
  );
}
