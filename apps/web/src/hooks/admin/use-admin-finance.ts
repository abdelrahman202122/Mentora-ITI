"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getFinanceStats,
  listWithdrawals,
  approveAllWithdrawals,
  approveWithdrawal,
  cancelWithdrawal,
  type FinanceStats,
  type Withdrawal,
} from "@/lib/api/admin-finance";

export function useAdminFinance() {
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(true);
  const [withdrawalsError, setWithdrawalsError] = useState<string | null>(null);

  const [mutating, setMutating] = useState(false); // For "Approve All"
  const [mutatingId, setMutatingId] = useState<string | null>(null); // For single row

  /* ── Fetch stats ────────────────────────────────────────────────── */
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const data = await getFinanceStats();
      setStats(data);
    } catch (err) {
      setStatsError(err instanceof Error ? err.message : "Failed to load stats");
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  /* ── Fetch withdrawals (ONLY AVAILABLE) ─────────────────────────── */
  const fetchWithdrawals = useCallback(async () => {
    setWithdrawalsLoading(true);
    setWithdrawalsError(null);
    try {
      // Only fetch 'available' earnings so admins can act on them
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

  useEffect(() => {
    fetchWithdrawals();
  }, [fetchWithdrawals]);

  /* ── Approve all withdrawals ────────────────────────────────────── */
  const handleApproveAll = useCallback(async (): Promise<void> => {
    setMutating(true);
    try {
      await approveAllWithdrawals();
      // Clear the list since all available items are now paid out
      setWithdrawals([]);
      await fetchStats();
    } catch (err) {
      setWithdrawalsError(
        err instanceof Error ? err.message : "Failed to approve all withdrawals",
      );
    } finally {
      setMutating(false);
    }
  }, [fetchStats]);

  /* ── Approve single withdrawal ──────────────────────────────────── */
  const handleApprove = useCallback(
    async (earningId: string): Promise<void> => {
      setMutatingId(earningId);
      try {
        await approveWithdrawal(earningId);
        // Remove the item from the list instead of updating status
        setWithdrawals((prev) => prev.filter((w) => w.id !== earningId));
        await fetchStats();
      } catch (err) {
        setWithdrawalsError(
          err instanceof Error ? err.message : "Failed to approve withdrawal",
        );
      } finally {
        setMutatingId(null);
      }
    },
    [fetchStats],
  );

  /* ── Cancel single withdrawal ───────────────────────────────────── */
  const handleCancel = useCallback(
    async (earningId: string): Promise<void> => {
      setMutatingId(earningId);
      try {
        await cancelWithdrawal(earningId);
        // Remove the item from the list
        setWithdrawals((prev) => prev.filter((w) => w.id !== earningId));
        await fetchStats();
      } catch (err) {
        setWithdrawalsError(
          err instanceof Error ? err.message : "Failed to cancel withdrawal",
        );
      } finally {
        setMutatingId(null);
      }
    },
    [fetchStats],
  );

  return {
    // stats
    stats,
    statsLoading,
    statsError,
    refetchStats: fetchStats,
    // withdrawals
    withdrawals,
    withdrawalsLoading,
    withdrawalsError,
    refetchWithdrawals: fetchWithdrawals,
    // mutations
    approveAll: handleApproveAll,
    approve: handleApprove,
    cancel: handleCancel,
    mutating,
    mutatingId,
  };
}