
"use client";

import { User as UserIcon, GraduationCap } from "lucide-react";
// import { EmptyState, TablePagination } from "@/components/shared";
// import { txStatusBadgeClasses } from "@/utils/badge-styles";
import type { Transaction } from "@/types/admin";
import { EmptyState, TablePagination } from "../../shared";
import { txStatusBadgeClasses } from "@/utils/admin/badge-styles";

interface TransactionsTableProps {
  transactions: Transaction[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalTx: number;
  perPage: number;
}

export function TransactionsTable({
  transactions,
  page,
  totalPages,
  onPageChange,
  totalTx,
  perPage,
}: TransactionsTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">ID</th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Learner</th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Tutor</th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Amount</th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Commission</th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Status</th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id} className="border-b border-gray-50 last:border-0 transition-colors hover:bg-gray-50/60">
                <td className="px-4 py-3 font-medium text-gray-900">{t.txId}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 text-blue-600">
                    <UserIcon className="h-3.5 w-3.5 text-blue-500" />
                    <span className="font-medium hover:underline">{t.learner}</span>
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 text-blue-600">
                    <GraduationCap className="h-3.5 w-3.5 text-blue-500" />
                    <span className="font-medium hover:underline">{t.tutor}</span>
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">${t.amount.toFixed(2)}</td>
                <td className="px-4 py-3 text-gray-700">${t.commission.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-[11px] font-semibold ${txStatusBadgeClasses[t.status]}`}>
                    {t.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{t.date}</td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <EmptyState message="No transactions found." colSpan={7} />
            )}
          </tbody>
        </table>
      </div>
      <TablePagination
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
        showingText={`Showing 1 to ${Math.min(perPage, totalTx)} of ${totalTx} transactions`}
      />
    </div>
  );
}
