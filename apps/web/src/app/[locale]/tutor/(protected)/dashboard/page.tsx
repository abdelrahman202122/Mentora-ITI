// 'use client'

// import { CreditCard, School, Timer, Video } from "lucide-react";
// import StatCard from "@/components/tutor/StatCard";
// import BookingCard from "@/components/tutor/BookingCard";
// import { useMyBookings }    from "@/hooks/booking/booking";
// import { useAcceptBooking } from "@/hooks/booking/approveBooking";
// import { useRejectBooking } from "@/hooks/booking/rejectBooking";
// import { useCancelBooking } from "@/hooks/booking/cancelBooking";

// export default function InstructorDashboard() {
//   const { data, isLoading, isError } = useMyBookings();

//   const {
//     mutate: acceptBooking,
//     isPending: isAccepting,
//     variables: acceptingId,
//   } = useAcceptBooking();

//   const {
//     mutate: rejectBooking,
//     isPending: isRejecting,
//     variables: rejectingId,
//   } = useRejectBooking();

//   const {
//     mutate: cancelBooking,
//     isPending: isCanceling,
//     variables: cancelingVariables, 
//   } = useCancelBooking();

//   const bookings = data?.bookings ?? [];

//   return (
//     <div className="min-h-screen bg-background text-foreground">
//       <div className="max-w-6xl mx-auto px-6 py-8 space-y-10">

//         {/* Header */}
//         <header>
//           <h1 className="text-3xl font-bold">Welcome back, Sarah</h1>
//           <p className="text-muted-foreground mt-2 text-lg">
//             You have 3 lessons scheduled for today.
//           </p>
//         </header>

//         {/* Stats */}
//         <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           <StatCard icon={CreditCard} label="Total Earnings" value="$4,250" />
//           <StatCard icon={School}     label="Total Lessons"  value="142"    />
//           <StatCard icon={Timer}      label="Hours Taught"   value="210h"   />
//         </section>

//         {/* Start Session */}
//         <section className="relative overflow-hidden rounded-2xl bg-primary text-primary-foreground p-8">
//           <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
//           <div className="relative space-y-4">
//             <div className="flex items-center gap-2">
//               <Video className="w-6 h-6" />
//               <h3 className="text-xl font-bold">Start Your Session</h3>
//             </div>
//             <p className="font-medium">Organic Chemistry with Alex Harrison</p>
//             <p className="text-sm text-white/80 max-w-lg">
//               Verify your student to begin the private learning session.
//               Ensure your audio and video are working correctly.
//             </p>
//             <div className="flex flex-col sm:flex-row gap-4 mt-6">
//               <input
//                 placeholder="Enter Student Verification Code"
//                 className="flex-1 rounded-xl px-4 py-3 bg-white/10 border border-white/20 placeholder:text-white/60 outline-none focus-visible:ring-primary"
//               />
//               <button className="btn-primary bg-white text-primary hover:bg-white/90">
//                 Verify & Start Session
//               </button>
//             </div>
//           </div>
//         </section>

//         {/* Upcoming Bookings */}
//         <section className="space-y-4">
//           <div className="flex justify-between items-center">
//             <h2 className="text-xl font-bold">Upcoming Bookings</h2>
//             <button className="text-primary font-medium">View All</button>
//           </div>

//           {isLoading && (
//             <div className="text-muted-foreground text-sm py-6 text-center">Loading bookings…</div>
//           )}
//           {isError && (
//             <div className="text-red-500 text-sm py-6 text-center">Failed to load bookings. Please try again.</div>
//           )}
//           {!isLoading && !isError && bookings.length === 0 && (
//             <div className="text-muted-foreground text-sm py-6 text-center">No upcoming bookings.</div>
//           )}

//           <div className="space-y-4">
//             {bookings.map((booking) => (
//               <BookingCard
//                 key={booking._id}
//                 booking={booking}
//                 onApprove={() => acceptBooking(booking._id)}
//                 onReject={()  => rejectBooking(booking._id)}
//                 onCancel={()  => cancelBooking({ bookingId: booking._id, cancelReason: "Canceled by tutor from dashboard." })}
//                 isApproving={isAccepting && acceptingId === booking._id}
//                 isRejecting={isRejecting && rejectingId === booking._id}
//                 isCanceling={isCanceling && cancelingVariables?.bookingId === booking._id}
//               />
//             ))}
//           </div>
//         </section>

//         {/* Footer */}
//         <footer className="border-t pt-6 text-sm text-muted-foreground flex flex-col md:flex-row justify-between gap-4">
//           <span className="font-bold text-primary">Mentora</span>
//           <div className="flex gap-6 flex-wrap">
//             <a>Privacy Policy</a>
//             <a>Terms</a>
//             <a>Help Center</a>
//             <a>Contact</a>
//           </div>
//           <span>© 2026 EduMarket Inc.</span>
//         </footer>
//       </div>
//     </div>
//   );
// }

'use client'

import { useState } from "react";
import { CreditCard, School, Timer, Video } from "lucide-react";
import StatCard from "@/components/tutor/StatCard";
import BookingCard from "@/components/tutor/BookingCard";
import { useMyBookings } from "@/hooks/booking/booking";
import { useAcceptBooking } from "@/hooks/booking/approveBooking";
import { useRejectBooking } from "@/hooks/booking/rejectBooking";
import { useCancelBooking } from "@/hooks/booking/cancelBooking";
import { useCurrentUser } from "@/hooks/auth/use-auth";
import type { BookingStatus } from "@/services/booking-services/getMyBooking";

// ─── helpers ────────────────────────────────────────────────────────────────

function minutesToHours(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

// ─── filter tabs ─────────────────────────────────────────────────────────────

const STATUS_FILTERS: { label: string; value: BookingStatus | "all" }[] = [
  { label: "All",       value: "all"       },
  { label: "Pending",   value: "pending"   },
  { label: "Confirmed", value: "confirmed" },
  { label: "Completed", value: "completed" },
  { label: "Canceled",  value: "canceled"  },
  { label: "Rejected",  value: "rejected"  },
  { label: "Expired",   value: "expired"   },
];

// ─── component ───────────────────────────────────────────────────────────────

export default function InstructorDashboard() {
  const [activeFilter, setActiveFilter] = useState<BookingStatus | "all">("all");
  const [currentPage, setCurrentPage]   = useState(1);

  function handleFilterChange(value: BookingStatus | "all") {
    setActiveFilter(value);
    setCurrentPage(1);
  }

  // main bookings query (filtered + paginated)
  const { data, isLoading, isError } = useMyBookings(
    activeFilter !== "all"
      ? { bookingStatus: activeFilter, page: currentPage, limit: 10 }
      : { page: currentPage, limit: 10 }
  );

  // completed bookings for stats (fetch all at once)
  const { data: completedData } = useMyBookings({
    bookingStatus: "completed",
    limit: 80,
  });

  const { data: currentUser } = useCurrentUser();

  const {
    mutate: acceptBooking,
    isPending: isAccepting,
    variables: acceptingId,
  } = useAcceptBooking();

  const {
    mutate: rejectBooking,
    isPending: isRejecting,
    variables: rejectingId,
  } = useRejectBooking();

  const {
    mutate: cancelBooking,
    isPending: isCanceling,
    variables: cancelingVariables,
  } = useCancelBooking();

  const bookings          = data?.bookings ?? [];
  const totalPages        = data?.pagination?.totalPages ?? 1;
  const completedBookings = completedData?.bookings ?? [];

  // ── stats ────────────────────────────────────────────────────────────────
  const totalMinutes  = completedBookings.reduce((sum, b) => sum + b.durationMinutes, 0);
  const totalEarnings = completedBookings.reduce((sum, b) => sum + b.price, 0);
  const currency      = completedBookings[0]?.currency ?? "USD";
  const totalSessions = completedBookings.length;

  const displayName = currentUser?.name

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-10">

        {/* Header */}
        <header>
          <h1 className="text-3xl font-bold">Welcome back, {displayName}</h1>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            icon={CreditCard}
            label="Total Earnings"
            value={formatCurrency(totalEarnings, currency)}
          />
          <StatCard
            icon={School}
            label="Total Sessions"
            value={String(totalSessions)}
          />
          <StatCard
            icon={Timer}
            label="Hours Taught"
            value={minutesToHours(totalMinutes)}
          />
        </section>

        {/* Start Session */}
        <section className="relative overflow-hidden rounded-2xl bg-primary text-primary-foreground p-8">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="relative space-y-4">
            <div className="flex items-center gap-2">
              <Video className="w-6 h-6" />
              <h3 className="text-xl font-bold">Start Your Session</h3>
            </div>
            <p className="font-medium">Organic Chemistry with Alex Harrison</p>
            <p className="text-sm text-white/80 max-w-lg">
              Verify your student to begin the private learning session.
              Ensure your audio and video are working correctly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <input
                placeholder="Enter Student Verification Code"
                className="flex-1 rounded-xl px-4 py-3 bg-white/10 border border-white/20 placeholder:text-white/60 outline-none focus-visible:ring-primary"
              />
              <button className="btn-primary bg-white text-primary hover:bg-white/90">
                Verify & Start Session
              </button>
            </div>
          </div>
        </section>

        {/* Bookings */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Bookings</h2>
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => handleFilterChange(value)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  activeFilter === value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:border-primary hover:text-primary"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {isLoading && (
            <div className="text-muted-foreground text-sm py-6 text-center">
              Loading bookings…
            </div>
          )}
          {isError && (
            <div className="text-red-500 text-sm py-6 text-center">
              Failed to load bookings. Please try again.
            </div>
          )}
          {!isLoading && !isError && bookings.length === 0 && (
            <div className="text-muted-foreground text-sm py-6 text-center">
              No bookings found.
            </div>
          )}

          <div className="space-y-4">
            {bookings.map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                onApprove={() => acceptBooking(booking._id)}
                onReject={()  => rejectBooking(booking._id)}
                onCancel={()  =>
                  cancelBooking({
                    bookingId: booking._id,
                    cancelReason: "Canceled by tutor from dashboard.",
                  })
                }
                isApproving={isAccepting && acceptingId === booking._id}
                isRejecting={isRejecting && rejectingId === booking._id}
                isCanceling={isCanceling && cancelingVariables?.bookingId === booking._id}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-40 hover:border-primary hover:text-primary transition-colors"
              >
                Previous
              </button>

              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium border transition-colors ${
                      page === currentPage
                        ? "bg-primary text-primary-foreground border-primary"
                        : "hover:border-primary hover:text-primary"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-40 hover:border-primary hover:text-primary transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="border-t pt-6 text-sm text-muted-foreground flex flex-col md:flex-row justify-between gap-4">
          <span className="font-bold text-primary">Mentora</span>
          <div className="flex gap-6 flex-wrap">
            <a>Privacy Policy</a>
            <a>Terms</a>
            <a>Help Center</a>
            <a>Contact</a>
          </div>
          <span>© 2026 EduMarket Inc.</span>
        </footer>

      </div>
    </div>
  );
}