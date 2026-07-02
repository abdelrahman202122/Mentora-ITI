"use client";

import Link from "next/link";
import { CreditCard, History } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLocalePath } from "@/utils/i18n/locale-path";

export default function PaymentPage() {
  const locale = useLocale();
  const t = useTranslations("PaymentPage");

  return (
    <div className="min-h-screen bg-white px-4 py-12 text-foreground">
      <Card className="mx-auto max-w-xl">
        <CardHeader>
          <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CreditCard className="size-6" />
          </div>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm leading-6 text-muted-foreground">
            {t("description")}
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href={getLocalePath(locale, "/dashboard")}>
                {t("actions.dashboard")}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={getLocalePath(locale, "/paymentHistory")}>
                <History className="size-4" />
                {t("actions.history")}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
