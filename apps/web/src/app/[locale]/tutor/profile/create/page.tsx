"use client";

import TutorProfileForm from "@/components/tutor/TutorProfileForm";
import { useCurrentUser } from "@/hooks/auth/use-auth";
import { getLocalePath } from "@/utils/i18n/locale-path";
import { Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CreateProfilePage() {
  const { data: user, isLoading } = useCurrentUser();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("tutorProfile.page");
  const loginPath = getLocalePath(locale, "/login");
  const loginHref = `${loginPath}?next=${encodeURIComponent(pathname)}`;

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(loginHref);
    }
  }, [isLoading, loginHref, router, user]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        <Loader2 className="mr-2 size-4 animate-spin" />
        {t("loading")}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        {t("redirecting")}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6 lg:py-10">
        <div className="flex flex-col gap-2">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {t("title")}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              {t("description")}
            </p>
          </div>
        </div>

        <TutorProfileForm
          mode="create"
          data={{
            userData: {
              _id: user.id,
              name: user.name,
              avatar: user.avatar ?? "",
            },
          }}
          tutorId={user.id}
        />
      </div>
    </div>
  );
}
