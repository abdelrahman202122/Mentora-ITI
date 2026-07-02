"use client";

import StatsCard from "@/components/admin/StatsCard";
import PlatformHealth from "@/components/admin/PlatformHealth";
import FinancialChart from "@/components/admin/FinancialChart";
import { useAdminDashboard } from "@/hooks/admin/use-admin-dashboard";
import { formatCurrency } from "@/lib/api/admin-finance";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Users,
  GraduationCap,
  Calendar,
  DollarSign,
  FileCheck,
  Wallet,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function Dashboard() {
  const locale = useLocale();
  const t = useTranslations("admin.dashboard");
  const { stats, loading, error, refetch } = useAdminDashboard();
  const numberFormat = new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US");

  if (loading && !stats) {
    return (
      <div className="flex h-full min-h-[calc(100vh-100px)] items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {t("title")}
          </h1>
          <p className="text-sm text-gray-500">{t("description")}</p>
        </div>
        {loading && stats && (
          <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
        )}
      </motion.div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-red-700">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            onClick={refetch}
          >
            {t("retry")}
          </Button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title={t("stats.learners.title")}
          value={stats ? numberFormat.format(stats.totalLearners) : "-"}
          changeLabel={t("stats.learners.description")}
          icon={<Users className="h-6 w-6" />}
          trend="neutral"
          delay={0}
        />
        <StatsCard
          title={t("stats.tutors.title")}
          value={stats ? numberFormat.format(stats.totalTutors) : "-"}
          changeLabel={t("stats.tutors.description")}
          icon={<GraduationCap className="h-6 w-6" />}
          trend="neutral"
          delay={0.05}
        />
        <StatsCard
          title={t("stats.bookings.title")}
          value={stats ? numberFormat.format(stats.totalBookings) : "-"}
          changeLabel={t("stats.bookings.description")}
          icon={<Calendar className="h-6 w-6" />}
          trend="neutral"
          delay={0.1}
        />
        <StatsCard
          title={t("stats.revenue.title")}
          value={stats ? formatCurrency(stats.totalRevenue) : "-"}
          changeLabel={t("stats.revenue.description")}
          icon={<DollarSign className="h-6 w-6" />}
          trend="up"
          delay={0.15}
        />
        <StatsCard
          title={t("stats.approvals.title")}
          value={stats ? numberFormat.format(stats.pendingApprovals) : "-"}
          changeLabel={t("stats.approvals.description")}
          icon={<FileCheck className="h-6 w-6" />}
          trend="neutral"
          delay={0.2}
        />
        <StatsCard
          title={t("stats.withdrawals.title")}
          value={stats ? numberFormat.format(stats.withdrawalRequests) : "-"}
          changeLabel={t("stats.withdrawals.description")}
          icon={<Wallet className="h-6 w-6" />}
          trend="neutral"
          delay={0.25}
        />
      </div>

      {/* Performance + Health */}
      <div className="grid grid-cols-1 gap-6">
        <PlatformHealth />
      </div>

      {/* Financial Chart */}
      <FinancialChart />
    </div>
  );
}
