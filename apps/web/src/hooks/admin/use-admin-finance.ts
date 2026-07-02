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
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [mutating, setMutating] = useState(false);

  const statsQuery = useQuery({
    queryKey: ["admin", "finance", "stats"],
    queryFn: getFinanceStats,
  });

  const withdrawalsQuery = useQuery({
    queryKey: ["admin", "finance", "withdrawals"],
    queryFn: async () => {
      const result = await listWithdrawals({ limit: 100 });
      return result.withdrawals;
    },
  });

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
      await refetchWithdrawals();
      await refetchStats();
    } catch (err) {
      setMutationError(
        err instanceof Error ? err.message : "Failed to approve all withdrawals",
      );
    } finally {
      setMutating(false);
    }
  }, [refetchWithdrawals, refetchStats]);

  const handleApprove = useCallback(
    async (earningId: string): Promise<void> => {
      setMutating(true);
      setMutationError(null);

      try {
        await approveWithdrawal(earningId);
        await refetchWithdrawals();
        await refetchStats();
      } catch (err) {
        setMutationError(
          err instanceof Error ? err.message : "Failed to approve withdrawal",
        );
      } finally {
        setMutating(false);
      }
    },
    [refetchWithdrawals, refetchStats],
  );

  const handleCancel = useCallback(
    async (earningId: string): Promise<void> => {
      setMutating(true);
      setMutationError(null);

      try {
        await cancelWithdrawal(earningId);
        await refetchWithdrawals();
        await refetchStats();
      } catch (err) {
        setMutationError(
          err instanceof Error ? err.message : "Failed to cancel withdrawal",
        );
      } finally {
        setMutating(false);
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
  };
}
