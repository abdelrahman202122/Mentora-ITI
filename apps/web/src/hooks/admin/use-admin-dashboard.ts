"use client";

import { useQuery } from "@tanstack/react-query";
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
  const dashboardQuery = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: async (): Promise<DashboardStats> => {
      const [usersRes, tutorStats, financeStats] = await Promise.all([
        listUsers({ page: 1, perPage: 1 }),
        getTutorStats(),
        getFinanceStats(),
      ]);

      return {
        totalLearners: usersRes.meta.totalItems,
        totalTutors: tutorStats.totalTutors,
        totalBookings: financeStats.bookings.total,
        totalRevenue: financeStats.earnings.totalPaidRevenue,
        pendingApprovals: tutorStats.pendingApproval,
        withdrawalRequests: financeStats.earnings.pending.count,
      };
    },
  });

  return {
    stats: dashboardQuery.data ?? null,
    loading: dashboardQuery.isPending,
    error:
      dashboardQuery.error instanceof Error
        ? dashboardQuery.error.message
        : null,
    refetch: () => {
      void dashboardQuery.refetch();
    },
  };
}
