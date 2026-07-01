"use client";

import { Loader2 } from "lucide-react";
import { EmptyState } from "@/components/admin/shared";
import { formatCurrency } from "@/lib/api/admin-finance";
import type { FinanceStats } from "@/lib/api/admin-finance";

interface TransactionsTableProps {
  stats: FinanceStats | null;
  loading: boolean;
}

export function TransactionsTable({ stats, loading }: TransactionsTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white py-12 shadow-sm">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white py-12 shadow-sm">
        <EmptyState message="No transaction data available yet." colSpan={6} />
      </div>
    );
  }

  const { earnings } = stats;
  const rows = [
    {
      id: "pending",
      label: "Pending Earnings",
      amount: earnings.pending.amount,
      count: earnings.pending.count,
      status: "PROCESSING",
      date: "Current cycle",
    },
    {
      id: "available",
      label: "Available for Payout",
      amount: earnings.available.amount,
      count: earnings.available.count,
      status: "COMPLETED",
      date: "Ready to withdraw",
    },
    {
      id: "paidOut",
      label: "Paid Out",
      amount: earnings.paidOut.amount,
      count: earnings.paidOut.count,
      status: "COMPLETED",
      date: "Completed",
    },
  ].filter((r) => r.count > 0);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                ID
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Description
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Amount
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Count
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id}
                className="border-b border-gray-50 last:border-0 transition-colors hover:bg-gray-50/60"
              >
                <td className="px-4 py-3 font-medium text-gray-900">
                  #EARN-{r.id.toUpperCase()}
                </td>
                <td className="px-4 py-3 text-gray-700">{r.label}</td>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {formatCurrency(r.amount)}
                </td>
                <td className="px-4 py-3 text-gray-700">{r.count}</td>
                <td className="px-4 py-3 text-gray-500">{r.date}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <EmptyState message="No transaction data available yet." colSpan={5} />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}