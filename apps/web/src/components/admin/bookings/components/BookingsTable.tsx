"use client";

import { EmptyState } from "@/components/admin/shared";
import { SubjectChip } from "./SubjectChip";
import { PaymentCell } from "./PaymentCell";
import type { Booking } from "@/types/admin";
import { bookingStatusBadgeClasses } from "@/utils/admin/badge-styles";

interface BookingsTableProps {
  bookings: Booking[];
}

export function BookingsTable({ bookings }: BookingsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[920px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/60">
            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              Booking ID
            </th>
            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              Learner
            </th>
            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              Tutor
            </th>
            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              Subject
            </th>
            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              Date
            </th>
            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              Status
            </th>
            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              Payment
            </th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr
              key={b.id}
              className="border-b border-gray-50 last:border-0 transition-colors hover:bg-gray-50/60"
            >
              <td className="px-4 py-3 font-medium text-gray-900">
                {b.bookingId}
              </td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center gap-2">
                  <span className="font-medium text-blue-600 hover:underline">
                    {b.learner}
                  </span>
                  {b.hasBadge && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 px-2 py-0.5 text-[11px] font-semibold text-orange-600 ring-1 ring-inset ring-orange-500/20">
                      A+
                    </span>
                  )}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="font-medium text-blue-600 hover:underline">
                  {b.tutor}
                </span>
              </td>
              <td className="px-4 py-3">
                <SubjectChip subject={b.subject} />
              </td>
              <td className="px-4 py-3 text-gray-500">{b.date}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-[11px] font-semibold ${bookingStatusBadgeClasses[b.status]}`}
                >
                  {b.status}
                </span>
              </td>
              <td className="px-4 py-3">
                <PaymentCell payment={b.payment} method={b.paymentMethod} />
              </td>
            </tr>
          ))}
          {bookings.length === 0 && (
            <EmptyState
              message="No bookings match the current filters."
              colSpan={7}
            />
          )}
        </tbody>
      </table>
    </div>
  );
}