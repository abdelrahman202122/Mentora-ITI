"use client";

import { CreditCard, Wallet } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import PageHeader from "@/components/payment/BaymentHeader";
import TransactionsTable from "@/components/payment/FinancialOverview";
import PendingPayoutCard from "@/components/payment/PendingPayoutCard";
import StatCard from "@/components/payment/StatesCard";
import { useEarningsSummary } from "@/hooks/earning/useGetEarningSummery";

function formatAmount(amount: number, locale: string) {
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
    currency: "EGP",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(amount);
}

export default function PaymentsPage() {
  const locale = useLocale();
  const t = useTranslations("payments.statCards");
  const { data, isLoading, isError } = useEarningsSummary();

  const hasSummary = !isLoading && !isError && !!data;
  const emptyValue = "-";

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 py-8">
        <PageHeader />

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <StatCard
            title={t("availableBalance")}
            icon={Wallet}
            value={
              isLoading
                ? emptyValue
                : hasSummary
                  ? formatAmount(data.available.totalAmount, locale)
                  : t("unavailable")
            }
            description={
              hasSummary
                ? t("sessionsCount", { count: data.available.count })
                : emptyValue
            }
          />

          <StatCard
            title={t("paidOut")}
            icon={CreditCard}
            value={
              isLoading
                ? emptyValue
                : hasSummary
                  ? formatAmount(data.paid_out.totalAmount, locale)
                  : t("unavailable")
            }
            description={
              hasSummary
                ? t("sessionsCount", { count: data.paid_out.count })
                : emptyValue
            }
          />

          <PendingPayoutCard
            amount={
              isLoading
                ? emptyValue
                : hasSummary
                  ? formatAmount(data.pending.totalAmount, locale)
                  : t("unavailable")
            }
            count={hasSummary ? data.pending.count : 0}
          />
        </section>

        <TransactionsTable />
      </div>
    </div>
  );
}
