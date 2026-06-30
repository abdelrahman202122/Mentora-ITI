"use client";
import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
  Globe,
  GraduationCap,
  LayoutDashboard,
  Loader2,
  LogIn,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useCurrentUser, useLogout } from "@/hooks/auth/use-auth";
import { getLocalePath } from "@/utils/i18n/locale-path";

/** Swap the locale prefix in a full pathname, preserving the rest of the path. */
function switchLocalePath(
  pathname: string,
  currentLocale: string,
  targetLocale: string,
): string {
  const withoutLocale = pathname.replace(
    new RegExp(`^/${currentLocale}(?=/|$)`),
    "",
  );
  const rest = withoutLocale || "/";
  return getLocalePath(targetLocale, rest);
}

export default function Header() {
  const locale = useLocale();
  const t = useTranslations("home.header");
  const router = useRouter();
  const pathname = usePathname();
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

  const becomeTutorLoginHref = `${loginPath}?next=${encodeURIComponent(tutorProfilePath)}`;
  const showBecomeTutor = !isPending && (!user || user.role === "learner");

  const targetLocale = locale === "en" ? "ar" : "en";
  const targetLabel = locale === "en" ? "العربية" : "English";

  function handleSwitchLocale() {
    const targetPath = switchLocalePath(pathname, locale, targetLocale);
    const search = typeof window !== "undefined" ? window.location.search : "";
    router.push(`${targetPath}${search}`);
    setIsMenuOpen(false);
  }

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
          <Button
            onClick={handleSwitchLocale}
            variant="ghost"
            size="sm"
            className="gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600"
          >
            <Globe className="size-4" />
            {targetLabel}
          </Button>

          {isPending ? (
            <Loader2 className="size-5 animate-spin text-indigo-600" />
          ) : user ? (
            <>
              {showBecomeTutor && (
                <Button asChild variant="outline">
                  <Link href={tutorProfilePath}>
                    <GraduationCap className="size-4" />
                    {t("becomeTutor")}
                  </Link>
                </Button>
              )}

              <Button asChild variant="outline">
                <Link href={dashboardPath}>
                  <LayoutDashboard className="size-4" />
                  {t("dashboard")}
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
                {isLoggingOut ? t("loggingOut") : t("logOut")}
              </Button>
            </>
          ) : (
            <>
              {showBecomeTutor && (
                <Button asChild variant="outline">
                  <Link href={becomeTutorLoginHref}>
                    <GraduationCap className="size-4" />
                    {t("becomeTutor")}
                  </Link>
                </Button>
              )}

              <Button asChild>
                <Link href={loginPath}>
                  <LogIn className="size-4" />
                  {t("logIn")}
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
            <Button
              onClick={handleSwitchLocale}
              variant="ghost"
              className="justify-start gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600"
            >
              <Globe className="size-4" />
              {targetLabel}
            </Button>

            {isPending ? (
              <div className="flex items-center gap-2 px-2 py-2 text-sm text-gray-600">
                <Loader2 className="size-4 animate-spin text-indigo-600" />
                {t("loadingAccount")}
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
                      {t("becomeTutor")}
                    </Link>
                  </Button>
                )}

                <Button asChild className="justify-start" variant="outline">
                  <Link href={dashboardPath} onClick={() => setIsMenuOpen(false)}>
                    <LayoutDashboard className="size-4" />
                    {t("dashboard")}
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
                  {isLoggingOut ? t("loggingOut") : t("logOut")}
                </Button>
              </>
            ) : (
              <>
                {showBecomeTutor && (
                  <Button asChild className="justify-start" variant="outline">
                    <Link
                      href={becomeTutorLoginHref}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <GraduationCap className="size-4" />
                      {t("becomeTutor")}
                    </Link>
                  </Button>
                )}

                <Button asChild className="justify-start">
                  <Link href={loginPath} onClick={() => setIsMenuOpen(false)}>
                    <LogIn className="size-4" />
                    {t("logIn")}
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
