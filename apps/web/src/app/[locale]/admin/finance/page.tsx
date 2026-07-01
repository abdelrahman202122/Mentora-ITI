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
import { TransactionsTable } from "@/components/admin/finance/components/TransactionsTable";
import { WithdrawalsTable } from "@/components/admin/finance/components/WithdrawalsTable";
import { PageHeader, StatCard } from "@/components/admin/shared";
import { useAdminFinance } from "@/hooks/admin/use-admin-finance";
import { formatCurrency } from "@/lib/api/admin-finance";

export default function FinancePage() {
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
  } = useAdminFinance();

  const statsCards = [
    {
      label: "Gross Revenue",
      value: stats ? formatCurrency(stats.earnings.totalPaidRevenue) : "—",
      subtext: stats ? `${stats.bookings.total} total bookings` : "Loading...",
      icon: DollarSign,
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600",
    },
    {
      label: "Platform Commission",
      value: stats ? formatCurrency(stats.earnings.platformCommissionTotal) : "—",
      subtext: "Commission from all earnings",
      icon: Percent,
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-600",
    },
    {
      label: "Available for Payout",
      value: stats ? formatCurrency(stats.earnings.available.amount) : "—",
      subtext: stats
        ? `${stats.earnings.available.count} earning${stats.earnings.available.count === 1 ? "" : "s"} ready`
        : "Loading...",
      subtextClassName: "text-red-600",
      valueClassName: "text-red-600",
      icon: Clock,
      iconBg: "bg-red-500/10",
      iconColor: "text-red-600",
    },
    {
      label: "Completed Payouts",
      value: stats ? formatCurrency(stats.earnings.paidOut.amount) : "—",
      subtext: stats
        ? `${stats.earnings.paidOut.count} payout${stats.earnings.paidOut.count === 1 ? "" : "s"} completed`
        : "Loading...",
      icon: CheckCircle2,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600",
    },
  ];

  return (
    <div className="flex flex-col bg-gray-50 min-h-full">
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 py-6 sm:py-8">
        <PageHeader
          title="Finance & Payments"
          description="Oversee global revenue flow and manage tutor withdrawal requests."
          actions={
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-3 sm:px-4 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export Report</span>
            </button>
          }
        />

        {statsError && (
          <div className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span>{statsError}</span>
            </div>
            <button
              type="button"
              onClick={refetchStats}
              className="text-sm font-medium text-red-700 underline hover:text-red-800"
            >
              Retry
            </button>
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
            Transactions
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
            Withdrawal Requests
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
          />
        )}
      </div>
    </div>
  );
}