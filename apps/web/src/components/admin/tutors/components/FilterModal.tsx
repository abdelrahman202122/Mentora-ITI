
"use client";

import { useState, useEffect } from "react";
import { X, Star } from "lucide-react";
import { useDrawerEffects } from "@/hooks/admin/use-drawer-effects";
// i { useDrawerEffects } from "@/hooks/use-drawer-effects";mport

export interface FilterState {
  statuses: string[];
  subjects: string[];
  rating: string;
}

export const EMPTY_FILTERS: FilterState = {
  statuses: [],
  subjects: [],
  rating: "",
};

const STATUS_OPTIONS = ["Approved", "Pending", "Rejected"] as const;
const SUBJECT_OPTIONS = ["Physics", "Math", "Chemistry", "Biology", "History"] as const;
const RATING_OPTIONS = [
  { id: "4.5", label: "4.5+ Stars" },
  { id: "4.0", label: "4.0+ Stars" },
] as const;

interface FilterModalProps {
  open: boolean;
  initial: FilterState;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
}

export function FilterModal({ open, initial, onClose, onApply }: FilterModalProps) {
  const [draft, setDraft] = useState<FilterState>(initial);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) setDraft(initial);
  }, [open, initial]);

  useDrawerEffects(open, onClose);

  if (!open) return null;

  const toggleStatus = (s: string) =>
    setDraft((d) => ({
      ...d,
      statuses: d.statuses.includes(s)
        ? d.statuses.filter((x) => x !== s)
        : [...d.statuses, s],
    }));

  const toggleSubject = (s: string) =>
    setDraft((d) => ({
      ...d,
      subjects: d.subjects.includes(s)
        ? d.subjects.filter((x) => x !== s)
        : [...d.subjects, s],
    }));

  const setRating = (r: string) => setDraft((d) => ({ ...d, rating: r }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filter tutors"
        onClick={(e) => e.stopPropagation()}
        className="w-[320px] overflow-hidden rounded-xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-100 px-5 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700">Filter</h2>
          <button type="button" onClick={onClose} aria-label="Close filter" className="inline-flex h-7 w-7 items-center justify-center rounded text-gray-500 transition-colors hover:text-gray-700">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          {/* Status checkboxes */}
          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-700">Status</h3>
            {STATUS_OPTIONS.map((s) => {
              const checked = draft.statuses.includes(s);
              return (
                <label key={s} className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                  <span className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${checked ? "border-indigo-600 bg-indigo-600" : "border-gray-300 bg-white"}`}>
                    {checked && (
                      <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6.5L5 9L9.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <input type="checkbox" checked={checked} onChange={() => toggleStatus(s)} className="sr-only" />
                  {s}
                </label>
              );
            })}
          </section>

          {/* Subjects chips */}
          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-700">Subjects</h3>
            <div className="flex flex-wrap gap-2">
              {SUBJECT_OPTIONS.map((s) => {
                const selected = draft.subjects.includes(s);
                return (
                  <button key={s} type="button" onClick={() => toggleSubject(s)}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${selected ? "border-indigo-600 bg-indigo-600 text-white" : "border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                    {s}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Rating radios */}
          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-700">Rating</h3>
            {RATING_OPTIONS.map((r) => {
              const checked = draft.rating === r.id;
              return (
                <label key={r.id} className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                  <span className={`flex h-4 w-4 items-center justify-center rounded-full border transition-colors ${checked ? "border-indigo-600" : "border-gray-300 bg-white"}`}>
                    {checked && <span className="h-2 w-2 rounded-full bg-indigo-600" />}
                  </span>
                  <input type="radio" name="rating" checked={checked} onChange={() => setRating(r.id)} className="sr-only" />
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  {r.label}
                </label>
              );
            })}
          </section>
        </div>

        <div className="flex gap-3 border-t border-gray-200 p-4">
          <button type="button" onClick={() => setDraft(EMPTY_FILTERS)} className="flex-1 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200">
            Clear All
          </button>
          <button type="button" onClick={() => { onApply(draft); onClose(); }} className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700">
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
