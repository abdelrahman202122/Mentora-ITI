
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  listTutors,
  getTutorStats,
  approveTutor as apiApproveTutor,
  rejectTutor as apiRejectTutor,
  updateTutor as apiUpdateTutor,
  type ListTutorsParams,
  type UpdateTutorPayload,
  type TutorStats,
} from "@/lib/api/admin-tutors";
import type { Tutor } from "@/types/admin";

export interface TutorFilters {
  statuses: string[];
  subjects: string[];
  rating: string; // "" | "4.0" | "4.5"
}

export const EMPTY_FILTERS: TutorFilters = {
  statuses: [],
  subjects: [],
  rating: "",
};

interface UseAdminTutorsOptions {
  perPage?: number;
  searchDebounceMs?: number;
}

export function useAdminTutors({
  perPage = 10,
  searchDebounceMs = 350,
}: UseAdminTutorsOptions = {}) {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState<TutorFilters>(EMPTY_FILTERS);

  const [stats, setStats] = useState<TutorStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [mutating, setMutating] = useState(false);

  /* ── Debounce search ──────────────────────────────────────────────── */
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, searchDebounceMs);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, searchDebounceMs]);

  /* ── Reset to page 1 when filters change ─────────────────────────── */
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters]);

  /* ── Fetch tutor list ─────────────────────────────────────────────── */
  const fetchTutors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: ListTutorsParams = {
        page,
        limit: perPage,
        search: debouncedSearch || undefined,
        statuses: filters.statuses.length > 0 ? filters.statuses : undefined,
        subjects: filters.subjects.length > 0 ? filters.subjects : undefined,
        minRating: filters.rating ? parseFloat(filters.rating) : undefined,
      };
      const result = await listTutors(params);
      setTutors(result.tutors);
      setTotalPages(result.meta.pages ?? 1);
      setTotalItems(result.meta.total ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tutors");
      setTutors([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, perPage, debouncedSearch, filters]);

  useEffect(() => {
    fetchTutors();
  }, [fetchTutors]);

  /* ── Fetch stats (separate — doesn't reload on every filter change) ─ */
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await getTutorStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to load tutor stats:", err);
      // Don't surface stats error in the main error banner
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  /* ── Approve tutor ────────────────────────────────────────────────── */
  const approveTutor = useCallback(
    async (tutorId: string, _notes: string): Promise<void> => {
      setMutating(true);
      try {
        await apiApproveTutor(tutorId);
        // Optimistically update the row
        setTutors((prev) =>
          prev.map((t) =>
            t.id === tutorId ? { ...t, approval: "Approved" } : t,
          ),
        );
        // Refresh stats since pending count changed
        void fetchStats();
      } finally {
        setMutating(false);
      }
    },
    [fetchStats],
  );

  /* ── Reject tutor ─────────────────────────────────────────────────── */
  const rejectTutor = useCallback(
    async (tutorId: string): Promise<void> => {
      setMutating(true);
      try {
        await apiRejectTutor(tutorId);
        setTutors((prev) =>
          prev.map((t) =>
            t.id === tutorId ? { ...t, approval: "Rejected" } : t,
          ),
        );
        void fetchStats();
      } finally {
        setMutating(false);
      }
    },
    [fetchStats],
  );

  /* ── Update tutor ─────────────────────────────────────────────────── */
  const updateTutor = useCallback(
    async (tutorId: string, payload: UpdateTutorPayload): Promise<Tutor> => {
      setMutating(true);
      try {
        const updated = await apiUpdateTutor(tutorId, payload);
        setTutors((prev) => prev.map((t) => (t.id === tutorId ? updated : t)));
        return updated;
      } finally {
        setMutating(false);
      }
    },
    [],
  );

  return {
    // data
    tutors,
    loading,
    error,
    mutating,
    // pagination
    page,
    totalPages,
    totalItems,
    setPage,
    // search + filters
    search,
    setSearch,
    filters,
    setFilters,
    // stats
    stats,
    statsLoading,
    // mutations
    approveTutor,
    rejectTutor,
    updateTutor,
    // misc
    refetch: fetchTutors,
    refetchStats: fetchStats,
    setTutors,
  };
}
