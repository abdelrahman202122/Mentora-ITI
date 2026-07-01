"use client";

import { useState, useEffect, useCallback } from "react";
import { getFinanceStats } from "@/lib/api/admin-finance";
import { getTutorStats } from "@/lib/api/admin-tutors";
import { listUsers } from "@/lib/api/admin-users";

export interface DashboardStats {
  totalLearners: number;
  totalTutors: number;
  totalBookings: number;
  totalRevenue: number;
  pendingApprovals: number;
  withdrawalRequests: number;
}

export function useAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all stats in parallel
      const [usersRes, tutorStats, financeStats] = await Promise.all([
        listUsers({ page: 1, perPage: 1 }),
        getTutorStats(),
        getFinanceStats(),
      ]);

      setStats({
        totalLearners: usersRes.meta.totalItems,
        totalTutors: tutorStats.totalTutors,
        totalBookings: financeStats.bookings.total,
        totalRevenue: financeStats.earnings.totalPaidRevenue,
        pendingApprovals: tutorStats.pendingApproval,
        withdrawalRequests: financeStats.earnings.pending.count,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchDashboardStats,
  };
}