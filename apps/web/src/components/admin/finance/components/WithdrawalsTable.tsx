
"use client";

import type { Withdrawal } from "@/types/admin";
import { withdrawalStatusBadgeClasses } from "@/utils/admin/badge-styles";
import { EmptyState } from "../../shared";

interface WithdrawalsTableProps {
  withdrawals: Withdrawal[];
}

export function WithdrawalsTable({ withdrawals }: WithdrawalsTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-gray-900">Active Payout Requests</h2>
        <button type="button" className="inline-flex h-9 items-center justify-center rounded-lg border border-blue-600 bg-white px-4 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50">
          Mark All Processed
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Tutor</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-500">Requested Amount</th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-500">Wallet Balance</th>
              <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-500">Request Date</th>
              <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-500">Status</th>
              <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.map((w) => (
              <tr key={w.id} className="border-b border-gray-50 last:border-0 transition-colors hover:bg-gray-50/60">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={w.avatarUrl} alt={w.tutor} className="h-9 w-9 rounded-full object-cover ring-2 ring-white" />
                    <span className="font-medium text-gray-900">{w.tutor}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-gray-900">${w.requestedAmount.toFixed(2)}</td>
                <td className="px-4 py-3 text-right text-gray-500">${w.walletBalance.toFixed(2)}</td>
                <td className="px-4 py-3 text-center text-gray-500">{w.requestDate}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${withdrawalStatusBadgeClasses[w.status]}`}>
                    {w.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button type="button" className="inline-flex h-8 items-center rounded-md bg-blue-600 px-3 text-xs font-medium text-white transition-colors hover:bg-blue-700">Approve</button>
                    <button type="button" className="inline-flex h-8 items-center rounded-md border border-blue-600 bg-white px-3 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50">Review</button>
                  </div>
                </td>
              </tr>
            ))}
            {withdrawals.length === 0 && (
              <EmptyState message="No withdrawal requests pending." colSpan={6} />
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
        <p className="text-xs text-gray-500">
          Showing {withdrawals.length} active request{withdrawals.length === 1 ? "" : "s"}
        </p>
      </div>
    </div>
  );
}