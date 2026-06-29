"use client";
import { useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import {
  GraduationCap,
  LayoutDashboard,
  Loader2,
  LogIn,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useCurrentUser, useLogout } from "@/hooks/auth/use-auth";
import { getLocalePath } from "@/utils/i18n/locale-path";

export default function Header() {
  const locale = useLocale();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: user, isPending } = useCurrentUser();
  const { mutateAsync: logout, isPending: isLoggingOut } = useLogout();

  const loginPath = getLocalePath(locale, "/login");
  const homePath = getLocalePath(locale, "/");
  const dashboardPath = user
    ? getLocalePath(
        locale,
        user.role === "tutor" ? "/tutor/dashboard" : "/dashboard",
      )
    : "";
  const tutorProfilePath = getLocalePath(locale, "/tutor/profile/create");

  const registerPath = getLocalePath(locale, "/register");

  /** Guest: register first, then login, then redirect to tutor profile creation */
  const becomeTutorRegisterHref = `${registerPath}?next=${encodeURIComponent(tutorProfilePath)}`;

  /** Whether user can see the "Become a Tutor" CTA */
  const showBecomeTutor = !isPending && (!user || user.role === "learner");

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out:", error);
    } finally {
      setIsMenuOpen(false);
      router.push(loginPath);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          href={homePath}
          className="flex min-w-0 items-center gap-2 text-lg font-bold text-indigo-600 sm:text-xl"
          onClick={() => setIsMenuOpen(false)}
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <GraduationCap className="size-5" />
          </span>
          <span className="truncate">Mentora</span>
        </Link>

        {/* ── Desktop nav ── */}
        <div className="hidden items-center gap-2 md:flex">
          {isPending ? (
            <Loader2 className="size-5 animate-spin text-indigo-600" />
          ) : user ? (
            <>
              {showBecomeTutor && (
                <Button asChild variant="outline">
                  <Link href={tutorProfilePath}>
                    <GraduationCap className="size-4" />
                    Become a Tutor
                  </Link>
                </Button>
              )}

              <Button asChild variant="outline">
                <Link href={dashboardPath}>
                  <LayoutDashboard className="size-4" />
                  My dashboard
                </Link>
              </Button>

              <Button
                onClick={handleLogout}
                variant="destructive"
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <LogOut className="size-4" />
                )}
                {isLoggingOut ? "Logging out..." : "Log out"}
              </Button>
            </>
          ) : (
            <>
              {showBecomeTutor && (
                <Button asChild variant="outline">
                  <Link href={becomeTutorRegisterHref}>
                    <GraduationCap className="size-4" />
                    Become a Tutor
                  </Link>
                </Button>
              )}

              <Button asChild>
                <Link href={loginPath}>
                  <LogIn className="size-4" />
                  Log in
                </Link>
              </Button>
            </>
          )}
        </div>

        <Button
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          className="md:hidden"
          onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
          size="icon"
          type="button"
          variant="outline"
        >
          {isMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
        </Button>
      </nav>

      {/* ── Mobile nav ── */}
      {isMenuOpen ? (
        <div className="border-t border-gray-100 bg-white px-4 py-3 shadow-sm md:hidden">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-2">
            {isPending ? (
              <div className="flex items-center gap-2 px-2 py-2 text-sm text-gray-600">
                <Loader2 className="size-4 animate-spin text-indigo-600" />
                Loading account
              </div>
            ) : user ? (
              <>
                {showBecomeTutor && (
                  <Button asChild className="justify-start" variant="outline">
                    <Link
                      href={tutorProfilePath}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <GraduationCap className="size-4" />
                      Become a Tutor
                    </Link>
                  </Button>
                )}

                <Button asChild className="justify-start" variant="outline">
                  <Link href={dashboardPath} onClick={() => setIsMenuOpen(false)}>
                    <LayoutDashboard className="size-4" />
                    My dashboard
                  </Link>
                </Button>

                <Button
                  className="justify-start"
                  disabled={isLoggingOut}
                  onClick={handleLogout}
                  type="button"
                  variant="destructive"
                >
                  {isLoggingOut ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <LogOut className="size-4" />
                  )}
                  {isLoggingOut ? "Logging out..." : "Log out"}
                </Button>
              </>
            ) : (
              <>
                {showBecomeTutor && (
                  <Button asChild className="justify-start" variant="outline">
                    <Link
                      href={becomeTutorRegisterHref}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <GraduationCap className="size-4" />
                      Become a Tutor
                    </Link>
                  </Button>
                )}

                <Button asChild className="justify-start">
                  <Link href={loginPath} onClick={() => setIsMenuOpen(false)}>
                    <LogIn className="size-4" />
                    Log in
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
