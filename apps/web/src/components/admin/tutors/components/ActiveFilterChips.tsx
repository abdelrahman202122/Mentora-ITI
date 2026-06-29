
"use client";

import { X } from "lucide-react";
import type { FilterState } from "./FilterModal";

const RATING_OPTIONS = [
  { id: "4.5", label: "4.5+ Stars" },
  { id: "4.0", label: "4.0+ Stars" },
] as const;

interface ActiveFilterChipsProps {
  filters: FilterState;
  onRemoveStatus: (status: string) => void;
  onRemoveSubject: (subject: string) => void;
  onRemoveRating: () => void;
  onClearAll: () => void;
}

export function ActiveFilterChips({
  filters,
  onRemoveStatus,
  onRemoveSubject,
  onRemoveRating,
  onClearAll,
}: ActiveFilterChipsProps) {
  const activeCount =
    filters.statuses.length + filters.subjects.length + (filters.rating ? 1 : 0);

  if (activeCount === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 bg-gray-50/60 px-4 py-2.5">
      <span className="text-xs font-medium text-gray-500">Active filters:</span>
      {filters.statuses.map((s) => (
        <button key={`status-${s}`} type="button" onClick={() => onRemoveStatus(s)}
          className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-200">
          {s}<X className="h-3 w-3" />
        </button>
      ))}
      {filters.subjects.map((s) => (
        <button key={`subject-${s}`} type="button" onClick={() => onRemoveSubject(s)}
          className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-200">
          {s}<X className="h-3 w-3" />
        </button>
      ))}
      {filters.rating && (
        <button type="button" onClick={onRemoveRating}
          className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-200">
          {RATING_OPTIONS.find((r) => r.id === filters.rating)?.label}
          <X className="h-3 w-3" />
        </button>
      )}
      <button type="button" onClick={onClearAll}
        className="text-xs font-medium text-gray-500 underline-offset-2 transition-colors hover:text-gray-700 hover:underline">
        Clear all
      </button>
    </div>
  );
}
