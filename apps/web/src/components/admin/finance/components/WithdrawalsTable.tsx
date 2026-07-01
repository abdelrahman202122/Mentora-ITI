"use client";

import { Loader2, AlertCircle, Check, X } from "lucide-react";
import { EmptyState } from "@/components/admin/shared";
import { formatCurrency } from "@/lib/api/admin-finance";
import type { Withdrawal } from "@/lib/api/admin-finance";

interface WithdrawalsTableProps {
  withdrawals: Withdrawal[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onApproveAll: () => Promise<void>;
  onApprove: (earningId: string) => Promise<void>;
  onCancel: (earningId: string) => Promise<void>;
  mutating: boolean;
}

export function WithdrawalsTable({
  withdrawals,
  loading,
  error,
  onRetry,
  onApproveAll,
  onApprove,
  onCancel,
  mutating,
}: WithdrawalsTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white py-12 shadow-sm">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col items-center justify-center gap-3 py-12">
          <AlertCircle className="h-8 w-8 text-amber-500" />
          <p className="text-sm text-gray-600">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="text-sm font-medium text-blue-600 underline hover:text-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-gray-900">
          Active Payout Requests
        </h2>
        <button
          type="button"
          onClick={onApproveAll}
          disabled={mutating || withdrawals.length === 0}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-blue-600 bg-white px-4 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {mutating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Mark All Processed
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Tutor
              </th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Requested Amount
              </th>
              <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Request Date
              </th>
              <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.map((w) => (
              <tr
                key={w.id}
                className="border-b border-gray-50 last:border-0 transition-colors hover:bg-gray-50/60"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {w.avatarUrl ? (
                      <img
                        src={w.avatarUrl}
                        alt={w.tutor}
                        className="h-9 w-9 rounded-full object-cover ring-2 ring-white"
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600">
                        {w.tutor.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="font-medium text-gray-900">{w.tutor}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-gray-900">
                  {formatCurrency(w.requestedAmount)}
                </td>
                <td className="px-4 py-3 text-center text-gray-500">
                  {w.requestDate}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      w.status === "PAID_OUT"
                        ? "bg-emerald-100 text-emerald-700"
                        : w.status === "CANCELED"
                          ? "bg-red-100 text-red-700"
                          : w.status === "AVAILABLE"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {w.status === "PAID_OUT"
                      ? "Approved"
                      : w.status === "CANCELED"
                        ? "Canceled"
                        : w.status === "AVAILABLE"
                          ? "Available"
                          : "Pending"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    {w.status !== "PAID_OUT" && w.status !== "CANCELED" && (
                      <>
                        <button
                          type="button"
                          onClick={() => onApprove(w.id)}
                          disabled={mutating}
                          className="inline-flex h-8 items-center gap-1 rounded-md bg-blue-600 px-3 text-xs font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {mutating ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Check className="h-3 w-3" />
                          )}
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => onCancel(w.id)}
                          disabled={mutating}
                          className="inline-flex h-8 items-center gap-1 rounded-md border border-red-500 bg-white px-3 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {mutating ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {withdrawals.length === 0 && (
              <EmptyState message="No withdrawal requests pending." colSpan={5} />
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
        <p className="text-xs text-gray-500">
          Showing {withdrawals.length} active request
          {withdrawals.length === 1 ? "" : "s"}
        </p>
      </div>
    </div>
  );
}