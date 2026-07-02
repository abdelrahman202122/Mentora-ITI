"use client";

import { Download, Loader2, AlertCircle } from "lucide-react";
import { PageHeader, TablePagination } from "@/components/admin/shared";
import { BookingFilters } from "@/components/admin/bookings/components/BookingFilters";
import { BookingsTable } from "@/components/admin/bookings/components/BookingsTable";
import { useAdminBookings } from "@/hooks/admin/use-admin-bookings";

const PER_PAGE = 10;

export default function BookingsPage() {
  const {
    bookings,
    loading,
    error,
    page,
    totalPages,
    totalItems,
    setPage,
    filters,
    setFilters,
    refetch,
  } = useAdminBookings({ perPage: PER_PAGE });

  const start = totalItems === 0 ? 0 : (page - 1) * PER_PAGE + 1;
  const end = Math.min(page * PER_PAGE, totalItems);
  const showingText = `Showing ${start}-${end} of ${totalItems.toLocaleString()} bookings`;

  return (
    <div className="flex flex-col bg-gray-50 min-h-full">
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 py-6 sm:py-8">
        <PageHeader
          title="Bookings Management"
          description="Manage and monitor all tutor sessions and payments across the platform."
          actions={
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 sm:px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          }
        />

        {error && (
          <div className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={refetch}
              className="text-sm font-medium text-red-700 underline hover:text-red-800"
            >
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

          <BookingFilters
            status={filters.bookingStatus}
            onStatusChange={(v) =>
              setFilters((f) => ({ ...f, bookingStatus: v }))
            }
            dateRange={filters.dateRange}
            onDateRangeChange={(v) =>
              setFilters((f) => ({ ...f, dateRange: v }))
            }
            tutorQuery={filters.tutorQuery}
            onTutorQueryChange={(v) =>
              setFilters((f) => ({ ...f, tutorQuery: v }))
            }
            learnerQuery={filters.learnerQuery}
            onLearnerQueryChange={(v) =>
              setFilters((f) => ({ ...f, learnerQuery: v }))
            }
          />

          <BookingsTable bookings={bookings} />

          <TablePagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            showingText={showingText}
          />
        </div>
      </div>
    </div>
  );
}