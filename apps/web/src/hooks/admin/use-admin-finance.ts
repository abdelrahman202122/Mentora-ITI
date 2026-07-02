"use client";

import { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  approveAllWithdrawals,
  approveWithdrawal,
  cancelWithdrawal,
  getFinanceStats,
  listWithdrawals,
} from "@/lib/api/admin-finance";

export function useAdminFinance() {
<<<<<<< HEAD
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(true);
  const [withdrawalsError, setWithdrawalsError] = useState<string | null>(null);

  const [mutating, setMutating] = useState(false); // For "Approve All"
  const [mutatingId, setMutatingId] = useState<string | null>(null); // For single row
=======
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [mutating, setMutating] = useState(false);
>>>>>>> 32f0e102fe6dce6b2ec4d2384d639910e77e4e13

  const statsQuery = useQuery({
    queryKey: ["admin", "finance", "stats"],
    queryFn: getFinanceStats,
  });

<<<<<<< HEAD
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  /* ── Fetch withdrawals (ONLY AVAILABLE) ─────────────────────────── */
  const fetchWithdrawals = useCallback(async () => {
    setWithdrawalsLoading(true);
    setWithdrawalsError(null);
    try {
      // ✅ FIX: Only fetch 'available' earnings so admins can act on them
      const result = await listWithdrawals({ limit: 100, status: "available" });
      setWithdrawals(result.withdrawals);
    } catch (err) {
      setWithdrawalsError(
        err instanceof Error ? err.message : "Failed to load withdrawals",
      );
      setWithdrawals([]);
    } finally {
      setWithdrawalsLoading(false);
    }
  }, []);
=======
  const withdrawalsQuery = useQuery({
    queryKey: ["admin", "finance", "withdrawals"],
    queryFn: async () => {
      const result = await listWithdrawals({ limit: 100 });
      return result.withdrawals;
    },
  });
>>>>>>> 32f0e102fe6dce6b2ec4d2384d639910e77e4e13

  const refetchStats = useCallback(async () => {
    await statsQuery.refetch();
  }, [statsQuery]);

  const refetchWithdrawals = useCallback(async () => {
    await withdrawalsQuery.refetch();
  }, [withdrawalsQuery]);

  const handleApproveAll = useCallback(async (): Promise<void> => {
    setMutating(true);
    setMutationError(null);

    try {
      await approveAllWithdrawals();
<<<<<<< HEAD
      // ✅ FIX: Clear the list since all available items are now paid out
      setWithdrawals([]);
      await fetchStats();
    } catch (err) {
      setWithdrawalsError(
=======
      await refetchWithdrawals();
      await refetchStats();
    } catch (err) {
      setMutationError(
>>>>>>> 32f0e102fe6dce6b2ec4d2384d639910e77e4e13
        err instanceof Error ? err.message : "Failed to approve all withdrawals",
      );
    } finally {
      setMutating(false);
    }
<<<<<<< HEAD
  }, [fetchStats]);
=======
  }, [refetchWithdrawals, refetchStats]);
>>>>>>> 32f0e102fe6dce6b2ec4d2384d639910e77e4e13

  const handleApprove = useCallback(
    async (earningId: string): Promise<void> => {
<<<<<<< HEAD
      setMutatingId(earningId);
      try {
        await approveWithdrawal(earningId);
        // ✅ FIX: Remove the item from the list instead of updating status
        setWithdrawals((prev) => prev.filter((w) => w.id !== earningId));
        await fetchStats();
      } catch (err) {
        setWithdrawalsError(
=======
      setMutating(true);
      setMutationError(null);

      try {
        await approveWithdrawal(earningId);
        await refetchWithdrawals();
        await refetchStats();
      } catch (err) {
        setMutationError(
>>>>>>> 32f0e102fe6dce6b2ec4d2384d639910e77e4e13
          err instanceof Error ? err.message : "Failed to approve withdrawal",
        );
      } finally {
        setMutatingId(null);
      }
    },
    [refetchWithdrawals, refetchStats],
  );

  const handleCancel = useCallback(
    async (earningId: string): Promise<void> => {
<<<<<<< HEAD
      setMutatingId(earningId);
      try {
        await cancelWithdrawal(earningId);
        // ✅ FIX: Remove the item from the list
        setWithdrawals((prev) => prev.filter((w) => w.id !== earningId));
        await fetchStats();
      } catch (err) {
        // ✅ FIX: Added missing error handling
        setWithdrawalsError(
=======
      setMutating(true);
      setMutationError(null);

      try {
        await cancelWithdrawal(earningId);
        await refetchWithdrawals();
        await refetchStats();
      } catch (err) {
        setMutationError(
>>>>>>> 32f0e102fe6dce6b2ec4d2384d639910e77e4e13
          err instanceof Error ? err.message : "Failed to cancel withdrawal",
        );
      } finally {
        setMutatingId(null);
      }
    },
    [refetchWithdrawals, refetchStats],
  );

  return {
    stats: statsQuery.data ?? null,
    statsLoading: statsQuery.isPending,
    statsError:
      statsQuery.error instanceof Error ? statsQuery.error.message : null,
    refetchStats: () => {
      void refetchStats();
    },
    withdrawals: withdrawalsQuery.data ?? [],
    withdrawalsLoading: withdrawalsQuery.isPending,
    withdrawalsError:
      mutationError ??
      (withdrawalsQuery.error instanceof Error
        ? withdrawalsQuery.error.message
        : null),
    refetchWithdrawals: () => {
      void refetchWithdrawals();
    },
    approveAll: handleApproveAll,
    approve: handleApprove,
    cancel: handleCancel,
    mutating,
    mutatingId,
  };
}
