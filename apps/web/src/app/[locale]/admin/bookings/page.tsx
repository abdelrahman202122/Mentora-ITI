
"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/admin/shared";
import { BookingFilters } from "@/components/admin/bookings/components/BookingFilters";
import { BookingsTable } from "@/components/admin/bookings/components/BookingsTable";
import { BOOKINGS, PER_PAGE, TOTAL_BOOKINGS } from "@/mocks/mock-data";

export default function BookingsPage() {
  const [tutorQuery, setTutorQuery] = useState("");
  const [learnerQuery, setLearnerQuery] = useState("");
  const [status, setStatus] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [page, setPage] = useState(1);

  const filtered = BOOKINGS.filter((b) => {
    const matchesTutor = !tutorQuery || b.tutor.toLowerCase().includes(tutorQuery.toLowerCase());
    const matchesLearner = !learnerQuery || b.learner.toLowerCase().includes(learnerQuery.toLowerCase());
    const matchesStatus = !status || b.status.toLowerCase() === status.toLowerCase();
    return matchesTutor && matchesLearner && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(TOTAL_BOOKINGS / PER_PAGE));

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
        <PageHeader
          title="Bookings Management"
          description="Manage and monitor all tutor sessions and payments across the platform."
          actions={
            <button type="button" className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
              <Download className="h-4 w-4" />Export CSV
            </button>
          }
        />

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <BookingFilters
            status={status} onStatusChange={setStatus}
            dateRange={dateRange} onDateRangeChange={setDateRange}
            tutorQuery={tutorQuery} onTutorQueryChange={setTutorQuery}
            learnerQuery={learnerQuery} onLearnerQueryChange={setLearnerQuery}
          />
          <BookingsTable
            bookings={filtered} page={page} totalPages={totalPages}
            onPageChange={setPage} totalBookings={TOTAL_BOOKINGS} perPage={PER_PAGE}
          />
        </div>
      </div>
    </div>
  );
}
