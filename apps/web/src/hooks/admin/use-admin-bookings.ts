"use client";

import { useCallback, useState, type SetStateAction } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  listBookings,
  type ListBookingsParams,
} from "@/lib/api/admin-bookings";

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
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<BookingFilters>(EMPTY_FILTERS);

  const updateFilters = useCallback((nextFilters: SetStateAction<BookingFilters>) => {
    setPage(1);
    setFilters(nextFilters);
  }, []);

  const dateRange = resolveDateRange(filters.dateRange);
  const bookingStatus = resolveBookingStatus(filters.bookingStatus);

  const bookingQuery = useQuery({
    queryKey: [
      "admin",
      "bookings",
      page,
      perPage,
      bookingStatus,
      dateRange.startAtFrom,
      dateRange.startAtTo,
    ],
    queryFn: () => {
      const params: ListBookingsParams = {
        page,
        limit: perPage,
        bookingStatus,
        ...dateRange,
      };

      return listBookings(params);
    },
  });

  const allBookings = bookingQuery.data?.bookings ?? [];
  const isNameFilterActive = Boolean(filters.tutorQuery || filters.learnerQuery);

  const bookings = allBookings.filter((booking) => {
    const tutorMatch =
      !filters.tutorQuery ||
      booking.tutor.toLowerCase().includes(filters.tutorQuery.toLowerCase());
    const learnerMatch =
      !filters.learnerQuery ||
      booking.learner.toLowerCase().includes(filters.learnerQuery.toLowerCase());
    return tutorMatch && learnerMatch;
  });

  const totalItems = bookingQuery.data?.meta.total ?? 0;
  const totalPages = bookingQuery.data?.meta.totalPages ?? 1;
  const finalTotalItems = isNameFilterActive ? bookings.length : totalItems;
  const finalTotalPages = isNameFilterActive ? 1 : totalPages;

  return {
    bookings,
    loading: bookingQuery.isPending,
    error:
      bookingQuery.error instanceof Error ? bookingQuery.error.message : null,
    page,
    totalPages: finalTotalPages,
    totalItems: finalTotalItems,
    setPage,
    filters,
    setFilters: updateFilters,
    refetch: () => {
      void bookingQuery.refetch();
    },
  };
}
