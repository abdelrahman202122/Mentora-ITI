"use client";

import StatsCard from "@/components/admin/StatsCard";
import PlatformHealth from "@/components/admin/PlatformHealth";
import FinancialChart from "@/components/admin/FinancialChart";
import { useAdminDashboard } from "@/hooks/admin/use-admin-dashboard";
import { formatCurrency } from "@/lib/api/admin-finance";
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
      <div className="flex h-full items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Overview</h1>
          <p className="text-gray-500">Real-time platform metrics</p>
        </div>
        {loading && stats && (
          <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
        )}
      </div>

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard
          title="Total Learners"
          value={stats ? stats.totalLearners.toLocaleString() : "—"}
          changeLabel="Total registered users"
          icon={<Users className="h-5 w-5" />}
          trend="neutral"
        />

        <StatsCard
          title="Total Tutors"
          value={stats ? stats.totalTutors.toLocaleString() : "—"}
          changeLabel="Active and pending"
          icon={<GraduationCap className="h-5 w-5" />}
          trend="neutral"
        />

        <StatsCard
          title="Total Bookings"
          value={stats ? stats.totalBookings.toLocaleString() : "—"}
          changeLabel="All-time bookings"
          icon={<Calendar className="h-5 w-5" />}
          trend="neutral"
        />

        <StatsCard
          title="Revenue"
          value={stats ? formatCurrency(stats.totalRevenue) : "—"}
          changeLabel="Gross revenue"
          icon={<DollarSign className="h-5 w-5" />}
          trend="up"
        />

        <StatsCard
          title="Pending Approvals"
          value={stats ? stats.pendingApprovals.toLocaleString() : "—"}
          changeLabel="Tutors awaiting review"
          icon={<FileCheck className="h-5 w-5" />}
          trend="neutral"
        />

        <StatsCard
          title="Withdrawal Requests"
          value={stats ? stats.withdrawalRequests.toLocaleString() : "—"}
          changeLabel="Pending payouts"
          icon={<Wallet className="h-5 w-5" />}
          trend="neutral"
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