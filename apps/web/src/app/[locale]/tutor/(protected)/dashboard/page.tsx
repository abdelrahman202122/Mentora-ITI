'use client';

import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  School,
  Timer,
  Video,
} from 'lucide-react';
import StatCard from '@/components/tutor/StatCard';
import BookingCard from '@/components/tutor/BookingCard';
import { useMyBookings } from '@/hooks/booking/booking';
import { useAcceptBooking } from '@/hooks/booking/approveBooking';
import { useRejectBooking } from '@/hooks/booking/rejectBooking';
import { useCancelBooking } from '@/hooks/booking/cancelBooking';
import { useConfirmBookingCode } from '@/hooks/booking/useConfirmBookingCode';
import { useCurrentUser } from '@/hooks/auth/use-auth';
import { useTutorStats } from '@/hooks/tutor/useTutorStats';
import type { BookingStatus } from '@/services/booking-services/getMyBooking';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { Booking } from '@/types/booking/booking-data';

// ─── helpers ────────────────────────────────────────────────────────────────

function formatCurrency(
  amount: number | undefined,
  currency: string = 'USD',
): string {
  try {
    if (typeof amount === 'undefined') {
      return 'faild to load';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    if (typeof amount === 'undefined') {
      return 'faild to load';
    }
    return `${currency} ${amount.toLocaleString()}`;
  }
}

function formatSessionDateTime(isoString: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(isoString));
}

function isLivePaidSession(booking: Booking): boolean {
  const now = Date.now();
  const startsAt = new Date(booking.startAt).getTime();
  const endsAt = new Date(booking.endAt).getTime();

  return (
    booking.bookingStatus === 'confirmed' &&
    booking.paymentStatus === 'paid' &&
    now >= startsAt &&
    now <= endsAt
  );
}

function isUpcomingPaidSession(booking: Booking): boolean {
  return (
    booking.bookingStatus === 'confirmed' &&
    booking.paymentStatus === 'paid' &&
    new Date(booking.startAt).getTime() > Date.now()
  );
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Could not verify the session code.';
}

// ─── filter tabs ─────────────────────────────────────────────────────────────

const STATUS_FILTERS: { label: string; value: BookingStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Completed', value: 'completed' },
  { label: 'Canceled', value: 'canceled' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Expired', value: 'expired' },
];

// ─── component ───────────────────────────────────────────────────────────────

export default function InstructorDashboard() {
  const [activeFilter, setActiveFilter] = useState<BookingStatus | 'all'>(
    'all',
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [sessionCode, setSessionCode] = useState('');
  const [sessionSuccess, setSessionSuccess] = useState<string | null>(null);

  function handleFilterChange(value: BookingStatus | 'all') {
    setActiveFilter(value);
    setCurrentPage(1);
  }

  // main bookings query (filtered + paginated)
  const { data, isLoading, isError } = useMyBookings(
    activeFilter !== 'all'
      ? { bookingStatus: activeFilter, page: currentPage, limit: 10 }
      : { page: currentPage, limit: 10 },
  );

  const { data: currentUser } = useCurrentUser();

  // ── stats from dedicated endpoint ──────────────────────────────────────
  const { data: stats, isLoading: isStatsLoading } = useTutorStats();

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
  const confirmBookingCode = useConfirmBookingCode();

  const bookings = data?.bookings ?? [];
  const totalPages = Math.max(data?.pagination?.totalPages ?? 1, 1);
  const activeSession = bookings.find(isLivePaidSession);
  const nextPaidSession = bookings
    .filter(isUpcomingPaidSession)
    .sort(
      (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
    )[0];

  const displayName = currentUser?.name;

  function handleSessionCodeSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSessionSuccess(null);

    if (!activeSession || sessionCode.trim().length === 0) {
      return;
    }

    confirmBookingCode.mutate(
      {
        bookingId: activeSession._id,
        code: sessionCode,
      },
      {
        onSuccess: () => {
          setSessionCode('');
          setSessionSuccess('Session code verified. Booking marked completed.');
        },
      },
    );
  }

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
            value={isStatsLoading ? '…' : formatCurrency(stats?.totalEarnings)}
          />
          <StatCard
            icon={School}
            label="Total Sessions"
            value={
              isStatsLoading
                ? '…'
                : String(stats?.totalSessions ?? 'faild to load')
            }
          />
          <StatCard
            icon={Timer}
            label="Hours Taught"
            value={
              isStatsLoading
                ? '…'
                : stats?.totalHours != null
                  ? `${stats.totalHours}h`
                  : 'failed to load'
            }
          />
        </section>

        {/* Start Session */}
        <Card className="border-primary/15 bg-primary text-primary-foreground shadow-sm">
          <CardHeader className="gap-2">
            <div className="flex items-center gap-2">
              <Video className="size-5" />
              <CardTitle className="text-xl">Start Your Session</CardTitle>
            </div>
            <CardDescription className="max-w-2xl text-primary-foreground/80">
              Ask the learner for the session code shown on their dashboard.
              Verification is available only for paid bookings during the
              scheduled session time.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {activeSession ? (
              <div className="rounded-xl border border-white/15 bg-white/10 p-4">
                <p className="text-sm font-semibold">
                  Session - {activeSession.subjectId}
                </p>
                <p className="mt-1 text-sm text-primary-foreground/75">
                  {formatSessionDateTime(activeSession.startAt)} to{' '}
                  {formatSessionDateTime(activeSession.endAt)}
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-white/15 bg-white/10 p-4 text-sm text-primary-foreground/85">
                {nextPaidSession ? (
                  <>
                    Your next paid session starts on{' '}
                    <span className="font-semibold text-primary-foreground">
                      {formatSessionDateTime(nextPaidSession.startAt)}
                    </span>
                    . The verification field will become available during the
                    session time.
                  </>
                ) : (
                  'No paid session is live right now.'
                )}
              </div>
            )}

            <form
              className="flex flex-col gap-3 sm:flex-row"
              onSubmit={handleSessionCodeSubmit}
            >
              <Input
                value={sessionCode}
                onChange={(event) => {
                  setSessionCode(event.target.value);
                  setSessionSuccess(null);
                }}
                placeholder="Enter learner session code"
                disabled={!activeSession || confirmBookingCode.isPending}
                className="h-11 border-white/20 bg-white/10 text-primary-foreground placeholder:text-primary-foreground/55 focus-visible:ring-white/40"
              />
              <Button
                type="submit"
                disabled={
                  !activeSession ||
                  sessionCode.trim().length === 0 ||
                  confirmBookingCode.isPending
                }
                className="h-11 bg-white px-5 font-semibold text-primary hover:bg-white/90"
              >
                {confirmBookingCode.isPending ? 'Verifying...' : 'Verify Code'}
              </Button>
            </form>

            {confirmBookingCode.error ? (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                <AlertCircle className="size-4" />
                {getErrorMessage(confirmBookingCode.error)}
              </div>
            ) : null}

            {sessionSuccess ? (
              <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
                <CheckCircle2 className="size-4" />
                {sessionSuccess}
              </div>
            ) : null}
          </CardContent>
        </Card>

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
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground border-border hover:border-primary hover:text-primary'
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
                onReject={() => rejectBooking(booking._id)}
                onCancel={() =>
                  cancelBooking({
                    bookingId: booking._id,
                    cancelReason: 'Canceled by tutor from dashboard.',
                  })
                }
                isApproving={isAccepting && acceptingId === booking._id}
                isRejecting={isRejecting && rejectingId === booking._id}
                isCanceling={
                  isCanceling && cancelingVariables?.bookingId === booking._id
                }
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
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium border transition-colors ${
                        page === currentPage
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'hover:border-primary hover:text-primary'
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
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
