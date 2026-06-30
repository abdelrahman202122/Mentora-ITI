"use client";

import { useState } from "react";
import {
  SlidersHorizontal,
  Loader2,
  AlertCircle,
  Users,
  UserCheck,
  Clock,
  Star,
} from "lucide-react";
import { FilterModal, EMPTY_FILTERS } from "@/components/admin/tutors/components/FilterModal";
import type { FilterState } from "@/components/admin/tutors/components/FilterModal";
import { TutorDrawer } from "@/components/admin/tutors/components/TutorDrawer";
import { EditTutorDrawer } from "@/components/admin/tutors/components/EditTutorDrawer";
import type { EditTutorFormState } from "@/components/admin/tutors/components/EditTutorDrawer";
import { TutorTable } from "@/components/admin/tutors/components/TutorTable";
import { ActiveFilterChips } from "@/components/admin/tutors/components/ActiveFilterChips";
import type { Tutor } from "@/types/admin";
import {
  PageHeader,
  SearchInput,
  StatCard,
  TablePagination,
} from "@/components/admin/shared";
import { useAdminTutors } from "@/hooks/admin/use-admin-tutors";

const PER_PAGE = 10;

export default function TutorsPage() {
  const {
    tutors, loading, error, mutating,
    page, totalPages, totalItems, setPage,
    search: query, setSearch: setQuery,
    filters, setFilters, stats,
    approveTutor, rejectTutor, updateTutor, refetch,
  } = useAdminTutors({ perPage: PER_PAGE });

  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [editingTutor, setEditingTutor] = useState<Tutor | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const activeFilterCount =
    filters.statuses.length + filters.subjects.length + (filters.rating ? 1 : 0);

  const handleApplyFilters = (newFilters: FilterState) => setFilters(newFilters);
  const handleRemoveStatus = (s: string) => setFilters((f) => ({ ...f, statuses: f.statuses.filter((x) => x !== s) }));
  const handleRemoveSubject = (s: string) => setFilters((f) => ({ ...f, subjects: f.subjects.filter((x) => x !== s) }));
  const handleRemoveRating = () => setFilters((f) => ({ ...f, rating: "" }));
  const handleClearAll = () => setFilters(EMPTY_FILTERS);

  const handleApprove = async (t: Tutor, notes: string) => {
    try {
      await approveTutor(t.id, notes);
      setSelectedTutor(null);
    } catch (err) {
      console.error("Failed to approve tutor:", err);
      alert(err instanceof Error ? err.message : "Failed to approve tutor.");
    }
  };

  const handleReject = async (t: Tutor) => {
    try {
      await rejectTutor(t.id);
      setSelectedTutor(null);
    } catch (err) {
      console.error("Failed to reject tutor:", err);
      alert(err instanceof Error ? err.message : "Failed to reject tutor.");
    }
  };

  const handleSaveEdit = async (t: Tutor, form: EditTutorFormState) => {
    try {
      const parsedHourlyRate = parseFloat(form.hourlyRate);
      const safeHourlyRate = Number.isFinite(parsedHourlyRate) ? Math.max(0, parsedHourlyRate) : t.hourlyRate;

      await updateTutor(t.id, {
        bio: form.bio || undefined,
        hourlyRate: safeHourlyRate,
        languages: form.subjects.length > 0 ? form.subjects : undefined,
        moderatorNotes: form.moderatorNotes || undefined,
      });
      await refetch();
      setEditingTutor(null);
    } catch (err) {
      console.error("Failed to save tutor:", err);
      alert(err instanceof Error ? err.message : "Failed to save tutor.");
    }
  };

  const statsCards = [
    { label: "Total Tutors", value: stats?.totalTutors ?? "—", subtext: "All registered tutors", icon: Users, iconBg: "bg-blue-500/10", iconColor: "text-blue-600" },
    { label: "Active Tutors", value: stats?.activeTutors ?? "—", subtext: "Currently available", icon: UserCheck, iconBg: "bg-emerald-500/10", iconColor: "text-emerald-600" },
    { label: "Pending Approval", value: stats?.pendingApproval ?? "—", subtext: "Awaiting review", icon: Clock, iconBg: "bg-amber-500/10", iconColor: "text-amber-600" },
    { label: "Avg. Rating", value: stats ? stats.avgRating.toFixed(1) : "—", subtext: "Across all tutors", icon: Star, iconBg: "bg-amber-500/10", iconColor: "text-amber-500" },
  ];

  const start = totalItems === 0 ? 0 : (page - 1) * PER_PAGE + 1;
  const end = Math.min(page * PER_PAGE, totalItems);
  const showingText = `Showing ${start}-${end} of ${totalItems.toLocaleString()} tutors`;

  return (
    <div className="flex flex-col bg-gray-50 min-h-full">
     
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 py-6 sm:py-8">
        <PageHeader
          title="Tutor Management"
          description="Review, approve, and manage the mentor community."
        />

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        {error && (
          <div className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
            <button type="button" onClick={refetch} className="text-sm font-medium text-red-700 underline hover:text-red-800">
              Retry
            </button>
          </div>
        )}

        <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-sm">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            </div>
          )}

         
          <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search tutors..."
              className="w-full sm:max-w-sm"
            />
            <button
              type="button"
              onClick={() => setFilterOpen(true)}
              disabled={loading}
              className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                activeFilterCount > 0
                  ? "border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                  : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filter
              {activeFilterCount > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1.5 text-[11px] font-semibold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          <ActiveFilterChips
            filters={filters}
            onRemoveStatus={handleRemoveStatus}
            onRemoveSubject={handleRemoveSubject}
            onRemoveRating={handleRemoveRating}
            onClearAll={handleClearAll}
          />

          <TutorTable tutors={tutors} onView={setSelectedTutor} onEdit={setEditingTutor} />

          <TablePagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            showingText={showingText}
          />
        </div>
      </div>

      <FilterModal open={filterOpen} initial={filters} onClose={() => setFilterOpen(false)} onApply={handleApplyFilters} />
      <TutorDrawer tutor={selectedTutor} onClose={() => setSelectedTutor(null)} onApprove={handleApprove} onReject={handleReject} mutating={mutating} />
      <EditTutorDrawer tutor={editingTutor} onClose={() => setEditingTutor(null)} onSave={handleSaveEdit} mutating={mutating} />
    </div>
  );
}