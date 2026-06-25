'use client'

import { CreditCard, School, Timer, Video } from "lucide-react";
import StatCard from "@/components/tutor/StatCard";
import BookingCard from "@/components/tutor/BookingCard";
import { useMyBookings }    from "@/hooks/booking/booking";
import { useAcceptBooking } from "@/hooks/booking/approveBooking";
import { useRejectBooking } from "@/hooks/booking/rejectBooking";
import { useCancelBooking } from "@/hooks/booking/cancelBooking";

export default function InstructorDashboard() {
  const { data, isLoading, isError } = useMyBookings();

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
    variables: cancelingId,
  } = useCancelBooking();

  const bookings = data?.bookings ?? [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-10">

        {/* Header */}
        <header>
          <h1 className="text-3xl font-bold">Welcome back, Sarah</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            You have 3 lessons scheduled for today.
          </p>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard icon={<CreditCard />} label="Total Earnings" value="$4,250" />
          <StatCard icon={<School />}     label="Total Lessons"  value="142"    />
          <StatCard icon={<Timer />}      label="Hours Taught"   value="210h"   />
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
                className="flex-1 rounded-xl px-4 py-3 bg-white/10 border border-white/20 placeholder:text-white/60 outline-none"
              />
              <button className="btn-primary bg-white text-primary hover:bg-white/90">
                Verify & Start Session
              </button>
            </div>
          </div>
        </section>

        {/* Upcoming Bookings */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Upcoming Bookings</h2>
            <button className="text-primary font-medium">View All</button>
          </div>

          {isLoading && (
            <div className="text-muted-foreground text-sm py-6 text-center">Loading bookings…</div>
          )}
          {isError && (
            <div className="text-red-500 text-sm py-6 text-center">Failed to load bookings. Please try again.</div>
          )}
          {!isLoading && !isError && bookings.length === 0 && (
            <div className="text-muted-foreground text-sm py-6 text-center">No upcoming bookings.</div>
          )}

          <div className="space-y-4">
            {bookings.map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                onApprove={() => acceptBooking(booking._id)}
                onReject={()  => rejectBooking(booking._id)}
                onCancel={()  => cancelBooking(booking._id)}
                isApproving={isAccepting && acceptingId === booking._id}
                isRejecting={isRejecting && rejectingId === booking._id}
                isCanceling={isCanceling && cancelingId === booking._id}
              />
            ))}
          </div>
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
          <span>© 2024 EduMarket Inc.</span>
        </footer>
      </div>
    </div>
  );
}