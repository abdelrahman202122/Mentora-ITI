"use client";

import { useState, useEffect, useCallback } from "react";
import {
  listBookings,
  type ListBookingsParams,
} from "@/lib/api/admin-bookings";
import type { Booking } from "@/types/admin";

export interface BookingFilters {
  bookingStatus: string;
  dateRange: string;
  tutorQuery: string;
  learnerQuery: string;
}

export const EMPTY_FILTERS: BookingFilters = {
  bookingStatus: "",
  dateRange: "",
  tutorQuery: "",
  learnerQuery: "",
};

interface UseAdminBookingsOptions {
  perPage?: number;
}

/* Convert date range dropdown value → { startAtFrom, startAtTo } ISO strings */
function resolveDateRange(
  range: string,
): { startAtFrom?: string; startAtTo?: string } {
  if (!range) return {};
  const now = new Date();
  const from = new Date();

  switch (range) {
    case "Last 7 days":
      from.setDate(now.getDate() - 7);
      return { startAtFrom: from.toISOString(), startAtTo: now.toISOString() };
    case "Last 30 days":
      from.setDate(now.getDate() - 30);
      return { startAtFrom: from.toISOString(), startAtTo: now.toISOString() };
    case "This month":
      from.setDate(1);
      return { startAtFrom: from.toISOString(), startAtTo: now.toISOString() };
    case "This year":
      from.setMonth(0, 1);
      return { startAtFrom: from.toISOString(), startAtTo: now.toISOString() };
    default:
      return {};
  }
}

/* Convert frontend status label → backend enum value (lowercase) */
function resolveBookingStatus(status: string): string | undefined {
  if (!status) return undefined;
  const map: Record<string, string> = {
    Pending: "pending",
    Confirmed: "confirmed",
    Rejected: "rejected",
    Completed: "completed",
    Canceled: "canceled",
    Cancelled: "canceled",
    Expired: "expired",
  };
  return map[status];
}

export function useAdminBookings({
  perPage = 10,
}: UseAdminBookingsOptions = {}) {
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [filters, setFilters] = useState<BookingFilters>(EMPTY_FILTERS);

  /* ── Reset to page 1 when filters change ─────────────────────────── */
  useEffect(() => {
    setPage(1);
  }, [filters]);

  /* ── Fetch bookings from backend ───────────────────────────────────
     Sends bookingStatus + dateRange to the backend (server-side filter).
     Tutor/learner name search is done client-side after fetch. */
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dateRange = resolveDateRange(filters.dateRange);
      const bookingStatus = resolveBookingStatus(filters.bookingStatus);

      const params: ListBookingsParams = {
        page,
        limit: perPage,
        bookingStatus,
        ...dateRange,
      };

      const result = await listBookings(params);
      setAllBookings(result.bookings);
      setTotalPages(result.meta.totalPages ?? 1);
      setTotalItems(result.meta.total ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bookings");
      setAllBookings([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, perPage, filters.bookingStatus, filters.dateRange]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  /* ── Client-side name filtering ────────────────────────────────────
     Filter the fetched bookings by tutor/learner name.
     This runs on every render — fast because the list is small (10 items). */
  const bookings = allBookings.filter((b) => {
    const tutorMatch =
      !filters.tutorQuery ||
      b.tutor.toLowerCase().includes(filters.tutorQuery.toLowerCase());
    const learnerMatch =
      !filters.learnerQuery ||
      b.learner.toLowerCase().includes(filters.learnerQuery.toLowerCase());
    return tutorMatch && learnerMatch;
  });

  return {
    // data (client-filtered)
    bookings,
    loading,
    error,
    // pagination
    page,
    totalPages,
    totalItems,
    setPage,
    // filters
    filters,
    setFilters,
    // misc
    refetch: fetchBookings,
    setAllBookings,
  };
}
