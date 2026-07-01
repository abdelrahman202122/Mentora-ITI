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

  const [mutating, setMutating] = useState(false);

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

  /* ── Fetch withdrawals ──────────────────────────────────────────── */
  const fetchWithdrawals = useCallback(async () => {
    setWithdrawalsLoading(true);
    setWithdrawalsError(null);
    try {
      const result = await listWithdrawals({ limit: 100 });
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
      await fetchWithdrawals();
      await fetchStats();
      } catch (err) {
        setWithdrawalsError(
          err instanceof Error ? err.message : "Failed to approve all withdrawals",
        );
    } finally {
      setMutating(false);
    }
  }, [fetchWithdrawals, fetchStats]);

  /* ── Approve single withdrawal ──────────────────────────────────── */
  const handleApprove = useCallback(
    async (earningId: string): Promise<void> => {
      setMutating(true);
      try {
        await approveWithdrawal(earningId);
        setWithdrawals((prev) =>
          prev.map((w) =>
            w.id === earningId ? { ...w, status: "PAID_OUT" } : w,
          ),
        );
        await fetchStats();
        } catch (err) {
          setWithdrawalsError(
          err instanceof Error ? err.message : "Failed to approve withdrawl",
        );
      } finally {
        setMutating(false);
      }
    },
    [fetchStats],
  );

  /* ── Cancel single withdrawal ───────────────────────────────────── */
  const handleCancel = useCallback(
    async (earningId: string): Promise<void> => {
      setMutating(true);
      try {
        await cancelWithdrawal(earningId);
        setWithdrawals((prev) =>
          prev.map((w) =>
            w.id === earningId ? { ...w, status: "CANCELED" } : w,
          ),
        );
        await fetchStats();
      } finally {
        setMutating(false);
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
  };
}