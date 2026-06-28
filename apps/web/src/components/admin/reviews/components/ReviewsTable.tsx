
"use client";

import { Eye, Trash2 } from "lucide-react";
import type { Review } from "@/types/admin";
import { EmptyState, Stars } from "../../shared";
import { avatarInitials } from "@/utils/admin/avatar";

interface ReviewsTableProps {
  reviews: Review[];
  onView: (review: Review) => void;
}

export function ReviewsTable({ reviews, onView }: ReviewsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/60">
            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Tutor</th>
            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Learner</th>
            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Rating</th>
            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Review Snippet</th>
            <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Date</th>
            <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((r) => (
            <tr key={r.id} className="border-b border-gray-50 last:border-0 transition-colors hover:bg-gray-50/60">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-semibold ${r.tutorAvatarColor}`}>
                    {avatarInitials(r.tutor)}
                  </div>
                  <span className="font-medium text-gray-900">{r.tutor}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-gray-700">{r.learner}</td>
              <td className="px-4 py-3"><Stars value={r.rating} /></td>
              <td className="max-w-md px-4 py-3">
                <p className="truncate text-gray-600" title={r.snippet}>&ldquo;{r.snippet}&rdquo;</p>
              </td>
              <td className="px-4 py-3 text-gray-500">{r.date}</td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <button type="button" aria-label={`View review ${r.id}`} onClick={() => onView(r)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button type="button" aria-label={`Delete review ${r.id}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {reviews.length === 0 && (
            <EmptyState message="No reviews match the current filter." colSpan={6} />
          )}
        </tbody>
      </table>
    </div>
  );
}
