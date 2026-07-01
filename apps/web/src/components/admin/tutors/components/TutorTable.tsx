
"use client";

import { Star, Pencil, Eye, Trash2 } from "lucide-react";
import type { Tutor } from "@/types/admin";
import { Avatar , EmptyState } from "../../shared";
import { accountBadgeClasses, approvalBadgeClasses } from "@/utils/admin/badge-styles";

interface TutorTableProps {
  tutors: Tutor[];
  onView: (tutor: Tutor) => void;
  onEdit: (tutor: Tutor) => void;
}

export function TutorTable({ tutors, onView, onEdit }: TutorTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[920px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/60">
            <th className="px-4 py-3 font-semibold text-gray-700">Tutor</th>
            <th className="px-4 py-3 font-semibold text-gray-700">Subjects</th>
            <th className="px-4 py-3 font-semibold text-gray-700">Hourly Rate</th>
            <th className="px-4 py-3 font-semibold text-gray-700">Rating</th>
            <th className="px-4 py-3 font-semibold text-gray-700">Approval Status</th>
            <th className="px-4 py-3 font-semibold text-gray-700">Account</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tutors.map((t) => (
            <tr key={t.id} className="border-b border-gray-50 last:border-0 transition-colors hover:bg-gray-50/60">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar name={t.name} seed={t.id} avatarUrl={t.avatarUrl ?? undefined} size="sm" />
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900">{t.name}</p>
                    <p className="truncate text-xs text-gray-500">{t.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-gray-600">{t.subjects.join(", ")}</td>
              <td className="px-4 py-3 font-medium text-gray-900">${t.hourlyRate.toFixed(2)}</td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center gap-1 text-gray-900">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-medium">{t.rating.toFixed(1)}</span>
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${approvalBadgeClasses[t.approval]}`}>
                  {t.approval}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${accountBadgeClasses[t.account]}`}>
                  {t.account}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <button type="button" aria-label={`Edit ${t.name}`} onClick={() => onEdit(t)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button type="button" aria-label={`View ${t.name}`} onClick={() => onView(t)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button type="button" aria-label={`Delete ${t.name}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {tutors.length === 0 && (
            <EmptyState message="No tutors match the current filters." colSpan={7} />
          )}
        </tbody>
      </table>
    </div>
  );
}
