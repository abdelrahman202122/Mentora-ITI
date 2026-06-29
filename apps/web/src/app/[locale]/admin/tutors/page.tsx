
"use client";

import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { FilterModal, EMPTY_FILTERS } from "@/components/admin/tutors/components/FilterModal";
import type { FilterState } from "@/components/admin/tutors/components/FilterModal";
import { TutorDrawer } from "@/components/admin/tutors/components/TutorDrawer";
import { EditTutorDrawer } from "@/components/admin/tutors/components/EditTutorDrawer";
import type { EditTutorFormState } from "@/components/admin/tutors/components/EditTutorDrawer";
import { TutorTable } from "@/components/admin/tutors/components/TutorTable";
import { ActiveFilterChips } from "@/components/admin/tutors/components/ActiveFilterChips";
import { TUTORS, tutorStats } from "@/mocks/mock-data";
import type { Tutor } from "@/types/admin";
import { PageHeader, SearchInput, StatCard } from "@/components/admin/shared";

export default function TutorsPage() {
  const [tutors, setTutors] = useState<Tutor[]>(() => TUTORS);
  const [query, setQuery] = useState("");
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [editingTutor, setEditingTutor] = useState<Tutor | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);

  const activeFilterCount =
    filters.statuses.length + filters.subjects.length + (filters.rating ? 1 : 0);

  const filtered = tutors.filter((t) => {
    if (query) {
      const q = query.toLowerCase();
      const matchesQuery =
        t.name.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        t.subjects.some((s) => s.toLowerCase().includes(q));
      if (!matchesQuery) return false;
    }
    if (filters.statuses.length > 0) {
      const approval = String(t.approval).toLowerCase();
      if (!filters.statuses.some((s) => s.toLowerCase() === approval)) return false;
    }
    if (filters.subjects.length > 0) {
      const tutorSubjectsLower = t.subjects.map((s) => s.toLowerCase());
      if (!filters.subjects.some((s) =>
        tutorSubjectsLower.some((ts) => ts.includes(s.toLowerCase()) || s.toLowerCase().includes(ts)),
      )) return false;
    }
    if (filters.rating) {
      const min = parseFloat(filters.rating);
      if (Number.isFinite(min) && t.rating < min) return false;
    }
    return true;
  });

  const handleApprove = (t: Tutor, notes: string) => {
    console.log("Approve tutor:", t.id, "notes:", notes);
    setSelectedTutor(null);
  };

  const handleReject = (t: Tutor) => {
    console.log("Reject tutor:", t.id);
    setSelectedTutor(null);
  };

  const handleSaveEdit = (t: Tutor, form: EditTutorFormState) => {
    const parsedHourlyRate = parseFloat(form.hourlyRate);
    const safeHourlyRate = Number.isFinite(parsedHourlyRate) ? Math.max(0, parsedHourlyRate) : t.hourlyRate;
    const commissionRate = form.commissionRate.trim() ? `${form.commissionRate.trim()}%` : t.commissionRate ?? "15%";
    const updated: Tutor = {
      ...t, name: form.name.trim() || t.name, bio: form.bio, subjects: form.subjects,
      hourlyRate: safeHourlyRate, commissionRate, moderatorNotes: form.moderatorNotes,
    };
    setTutors((prev) => prev.map((row) => (row.id === t.id ? updated : row)));
    setSelectedTutor((prev) => (prev && prev.id === t.id ? updated : prev));
    console.log("Save tutor:", t.id, updated);
    setEditingTutor(null);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
        <PageHeader title="Tutor Management" description="Review, approve, and manage the mentor community." />

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tutorStats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
            <SearchInput value={query} onChange={setQuery} placeholder="Search tutors..." className="w-full sm:max-w-sm" />
            <button type="button" onClick={() => setFilterOpen(true)}
              className={`inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors ${
                activeFilterCount > 0 ? "border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-100" : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
              }`}>
              <SlidersHorizontal className="h-4 w-4" />Filter
              {activeFilterCount > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1.5 text-[11px] font-semibold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          <ActiveFilterChips
            filters={filters}
            onRemoveStatus={(s) => setFilters((f) => ({ ...f, statuses: f.statuses.filter((x) => x !== s) }))}
            onRemoveSubject={(s) => setFilters((f) => ({ ...f, subjects: f.subjects.filter((x) => x !== s) }))}
            onRemoveRating={() => setFilters((f) => ({ ...f, rating: "" }))}
            onClearAll={() => setFilters(EMPTY_FILTERS)}
          />

          <TutorTable tutors={filtered} onView={setSelectedTutor} onEdit={setEditingTutor} />
        </div>
      </div>

      <FilterModal open={filterOpen} initial={filters} onClose={() => setFilterOpen(false)} onApply={setFilters} />
      <TutorDrawer tutor={selectedTutor} onClose={() => setSelectedTutor(null)} onApprove={handleApprove} onReject={handleReject} />
      <EditTutorDrawer tutor={editingTutor} onClose={() => setEditingTutor(null)} onSave={handleSaveEdit} />
    </div>
  );
}
