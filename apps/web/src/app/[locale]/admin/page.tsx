"use client";

import StatsCard from "@/components/admin/StatsCard";
import PlatformHealth from "@/components/admin/PlatformHealth";
import FinancialChart from "@/components/admin/FinancialChart";
import { useAdminDashboard } from "@/hooks/admin/use-admin-dashboard";
import { formatCurrency } from "@/lib/api/admin-finance";
import { motion } from "framer-motion";
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
  const { stats, loading, error, refetch } = useAdminDashboard();

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
            System Overview
          </h1>
          <p className="text-sm text-gray-500">Real-time platform metrics</p>
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
          <button
            type="button"
            onClick={refetch}
            className="text-sm font-medium text-red-700 underline hover:text-red-800"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Total Learners"
          value={stats ? stats.totalLearners.toLocaleString() : "—"}
          changeLabel="Total registered users"
          icon={<Users className="h-6 w-6" />}
          trend="neutral"
          delay={0}
        />
        <StatsCard
          title="Total Tutors"
          value={stats ? stats.totalTutors.toLocaleString() : "—"}
          changeLabel="Active and pending"
          icon={<GraduationCap className="h-6 w-6" />}
          trend="neutral"
          delay={0.05}
        />
        <StatsCard
          title="Total Bookings"
          value={stats ? stats.totalBookings.toLocaleString() : "—"}
          changeLabel="All-time bookings"
          icon={<Calendar className="h-6 w-6" />}
          trend="neutral"
          delay={0.1}
        />
        <StatsCard
          title="Revenue"
          value={stats ? formatCurrency(stats.totalRevenue) : "—"}
          changeLabel="Gross revenue"
          icon={<DollarSign className="h-6 w-6" />}
          trend="up"
          delay={0.15}
        />
        <StatsCard
          title="Pending Approvals"
          value={stats ? stats.pendingApprovals.toLocaleString() : "—"}
          changeLabel="Tutors awaiting review"
          icon={<FileCheck className="h-6 w-6" />}
          trend="neutral"
          delay={0.2}
        />
        <StatsCard
          title="Withdrawal Requests"
          value={stats ? stats.withdrawalRequests.toLocaleString() : "—"}
          changeLabel="Pending payouts"
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