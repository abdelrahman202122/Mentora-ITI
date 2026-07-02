"use client";

import { useState } from "react";
import {
  Download,
  DollarSign,
  Percent,
  Clock,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { TransactionsTable } from "@/components/admin/finance/components/TransactionsTable";
import { WithdrawalsTable } from "@/components/admin/finance/components/WithdrawalsTable";
import { PageHeader, StatCard } from "@/components/admin/shared";
import { useAdminFinance } from "@/hooks/admin/use-admin-finance";
import { formatCurrency } from "@/lib/api/admin-finance";
import { Button } from "@/components/ui/button";

export default function FinancePage() {
  const t = useTranslations("admin.finance");
  const [tab, setTab] = useState<"transactions" | "withdrawals">("transactions");

  const {
    stats,
    statsLoading,
    statsError,
    refetchStats,
    withdrawals,
    withdrawalsLoading,
    withdrawalsError,
    refetchWithdrawals,
    approveAll,
    approve,
    cancel,
    mutating,
    mutatingId,
  } = useAdminFinance();

  const statsCards = [
    {
      label: t("stats.grossRevenue"),
      value: stats ? formatCurrency(stats.earnings.totalPaidRevenue) : "—",
      subtext: stats ? t("stats.totalBookings", { count: stats.bookings.total }) : t("loading"),
      icon: DollarSign,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600",
    },
    {
      label: t("stats.platformCommission"),
      value: stats ? formatCurrency(stats.earnings.platformCommissionTotal) : "—",
      subtext: t("stats.commissionDescription"),
      icon: Percent,
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-600",
    },
    {
      label: t("stats.availableForPayout"),
      value: stats ? formatCurrency(stats.earnings.available.amount) : "—",
      subtext: stats
        ? t("stats.earningsReady", { count: stats.earnings.available.count })
        : t("loading"),
      subtextClassName: "text-red-600",
      valueClassName: "text-red-600",
      icon: Clock,
      iconBg: "bg-red-500/10",
      iconColor: "text-red-600",
    },
    {
      label: t("stats.completedPayouts"),
      value: stats ? formatCurrency(stats.earnings.paidOut.amount) : "—",
      subtext: stats
        ? t("stats.payoutsCompleted", { count: stats.earnings.paidOut.count })
        : t("loading"),
      icon: CheckCircle2,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600",
    },
  ];

  return (
    <div className="flex flex-col bg-gray-50 min-h-full">
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 py-6 sm:py-8">
        <PageHeader
          title={t("title")}
          description={t("description")}
          actions={
            <Button
              type="button"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">{t("exportReport")}</span>
            </Button>
          }
        />

        {statsError && (
          <div className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span>{statsError}</span>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={refetchStats}
            >
              {t("retry")}
            </Button>
          </div>
        )}

        <div className="relative mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statsLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-xl">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          )}
          {statsCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>

        <div className="mb-4 flex items-center gap-4 sm:gap-6 border-b border-gray-200 overflow-x-auto">
          <button
            type="button"
            onClick={() => setTab("transactions")}
            className={`-mb-px border-b-2 pb-2 text-sm font-medium transition-colors whitespace-nowrap ${
              tab === "transactions"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t("tabs.transactions")}
          </button>
          <button
            type="button"
            onClick={() => setTab("withdrawals")}
            className={`-mb-px border-b-2 pb-2 text-sm font-medium transition-colors whitespace-nowrap ${
              tab === "withdrawals"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t("tabs.withdrawals")}
          </button>
        </div>

        {tab === "transactions" ? (
          <TransactionsTable stats={stats} loading={statsLoading} />
        ) : (
          <WithdrawalsTable
            withdrawals={withdrawals}
            loading={withdrawalsLoading}
            error={withdrawalsError}
            onRetry={refetchWithdrawals}
            onApproveAll={approveAll}
            onApprove={approve}
            onCancel={cancel}
            mutating={mutating}
            mutatingId={mutatingId}
          />
        )}
      </div>
    </div>
  );
}
