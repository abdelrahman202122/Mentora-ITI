

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  CheckCircle2,
  Clock,
  Calendar,
  Video,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Booking } from '@/types/bookingProcess/booking';
import { getMyBookings } from '@/services/booking-services/getMyBookingService';
import { getSubjectTitle } from '@/services/booking-services/getSubjectTitleService';
import { getTutorName } from '@/services/booking-services/getTutorNameService';
import { initiateCheckout } from '@/services/payment/paymentService';
import { useCurrentUser } from '@/hooks/auth/use-auth';

function formatDisplayTime(iso: string, duration: number) {
  const dateObj = new Date(iso);
  const timeString = dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const hours = duration / 60;
  const durationText = hours % 1 === 0 ? `${hours}h` : `${hours}h`;

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isTomorrow = dateObj.toDateString() === tomorrow.toDateString();
  const datePrefix = isTomorrow
    ? 'Tomorrow'
    : dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return `${datePrefix}, ${timeString} (${durationText} session)`;
}

function isSessionLive(booking: Booking, now: number): boolean {
  if (booking.bookingStatus !== 'confirmed') return false;
  if (booking.paymentStatus !== 'paid') return false;
  const start = new Date(booking.startAt).getTime();
  const end = new Date(booking.endAt).getTime();
  const fiveMinutesMs = 5 * 60 * 1000;
  return now >= start - fiveMinutesMs && now <= end;
}

function BookingStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; dot: string; className: string }> = {
    pending: { label: 'Pending', dot: 'bg-amber-400', className: 'bg-amber-50 text-amber-700 border-amber-200' },
    confirmed: { label: 'Confirmed', dot: 'bg-green-500', className: 'bg-green-50 text-green-700 border-green-200' },
    completed: { label: 'Completed', dot: 'bg-blue-500', className: 'bg-blue-50 text-blue-700 border-blue-200' },
    canceled: { label: 'Canceled', dot: 'bg-red-400', className: 'bg-red-50 text-red-600 border-red-200' },
    rejected: { label: 'Rejected', dot: 'bg-orange-400', className: 'bg-orange-50 text-orange-700 border-orange-200' },
    expired: { label: 'Expired', dot: 'bg-gray-400', className: 'bg-gray-50 text-gray-500 border-gray-200' },
  };

  const current = config[status] ?? { label: status, dot: 'bg-gray-400', className: 'bg-gray-50 text-gray-500 border-gray-200' };

  return (
    <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold w-fit ${current.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${current.dot} ${status === 'pending' ? 'animate-pulse' : ''}`} />
      {current.label}
    </span>
  );
}

export default function LearnerDashboardPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) ?? 'en';
  const { data: currentUser } = useCurrentUser();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [payError, setPayError] = useState<string | null>(null);
  // ✅ tracks which booking is currently being checked out to prevent duplicate requests
  const [pendingCheckoutId, setPendingCheckoutId] = useState<string | null>(null);

  const [subjectTitles, setSubjectTitles] = useState<Record<string, string>>({});
  const [tutorNames, setTutorNames] = useState<Record<string, string>>({});

  // ✅ which status tab is currently selected ('all' shows every booking)
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'pending' | 'confirmed' | 'completed' | 'canceled' | 'paid'
  >('all');

  // ✅ ticking clock so the "live now" banner appears/disappears without a manual refresh
  const [now, setNow] = useState(() => Date.now());

  // ✅ feedback state for the "Copy" confirmation code button
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000); // re-check every 30s
    return () => clearInterval(interval);
  }, []);

  // ✅ reusable fetcher so we can refresh bookings after the user returns from Paymob
  function refetchBookings() {
    return getMyBookings()
      .then(setBookings)
      .catch((err) => setError(err.message));
  }

  useEffect(() => {
    refetchBookings().finally(() => setLoading(false));
  }, []);

  // ✅ when the user comes back to this tab (e.g. after paying on Paymob's hosted
  // checkout page and returning), refetch so paymentStatus updates without a
  // manual page refresh
  useEffect(() => {
    function handleVisibilityOrFocus() {
      if (document.visibilityState === 'visible') {
        refetchBookings();
      }
    }
    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    return () => {
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
    };
  }, []);

  useEffect(() => {
    if (bookings.length === 0) return;

    const uniquePairs = Array.from(
      new Map(bookings.map((b) => [b.subjectId, b.tutorId])).entries(),
    );

    uniquePairs.forEach(([subjectId, tutorId]) => {
      getSubjectTitle(tutorId, subjectId)
        .then((title) => {
          setSubjectTitles((prev) => ({ ...prev, [subjectId]: title }));
        })
        .catch((err) => {
          console.error(`Failed to load subject title for ${subjectId}:`, err);
        });
    });
  }, [bookings]);

  useEffect(() => {
    if (bookings.length === 0) return;

    const uniqueTutorIds = Array.from(new Set(bookings.map((b) => b.tutorId)));

    uniqueTutorIds.forEach((tutorId) => {
      getTutorName(tutorId)
        .then((name) => {
          setTutorNames((prev) => ({ ...prev, [tutorId]: name }));
        })
        .catch((err) => {
          console.error(`Failed to load tutor name for ${tutorId}:`, err);
        });
    });
  }, [bookings]);

  function getDisplaySubject(subjectId: string): string {
    return subjectTitles[subjectId] ?? subjectId;
  }
  function getDisplayTutor(tutorId: string): string {
    return tutorNames[tutorId] ?? tutorId;
  }

  async function handleCopyConfirmationCode(code: string) {
    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) {
        throw new Error('Clipboard not supported');
      }
      await navigator.clipboard.writeText(code);
      setCopyStatus('copied');
    } catch (err) {
      console.error('Failed to copy confirmation code:', err);
      setCopyStatus('error');
    } finally {
      setTimeout(() => setCopyStatus('idle'), 2000);
    }
  }

  async function handlePayNow(bookingId: string) {
    // ✅ prevent duplicate requests for the same booking
    if (pendingCheckoutId) return;

    setPayError(null);
    setPendingCheckoutId(bookingId);

    try {
      const { checkoutUrl } = await initiateCheckout(bookingId);
      // Paymob's checkout page is external, so a full redirect is required
      window.location.href = checkoutUrl;
    } catch (err: any) {
      console.error(err);
      setPayError(err?.message || 'Failed to start checkout. Please try again.');
      setPendingCheckoutId(null);
    }
  }

  const upcomingBookings = bookings.filter(
    (b) => b.bookingStatus === 'pending' || b.bookingStatus === 'confirmed',
  );
  // real values only — 0 completed sessions or 0 hours learned are legitimate
  // states for a new learner, not bugs to be masked with placeholder numbers
  const totalCompleted = bookings.filter(
    (b) => b.bookingStatus === 'completed',
  ).length;
  const totalHours = bookings
    .filter((b) => b.bookingStatus === 'completed')
    .reduce((acc, curr) => acc + curr.durationMinutes / 60, 0);
  const upcomingCount = upcomingBookings.length;

  // only a session that's actually happening right now qualifies for the
  // "Join Now" banner — not merely the next confirmed booking on the calendar
  const currentActiveSession = upcomingBookings.find((b) => isSessionLive(b, now));

  // ✅ apply the selected status tab on top of all bookings.
  // 'paid' isn't a bookingStatus value (it lives on paymentStatus instead),
  // so that one tab filters on paymentStatus while every other tab keeps
  // filtering on bookingStatus as before.
  const filteredBookings =
    statusFilter === 'all'
      ? bookings
      : statusFilter === 'paid'
      ? bookings.filter((b) => b.paymentStatus === 'paid')
      : bookings.filter((b) => b.bookingStatus === statusFilter);

  const statusTabs: { key: typeof statusFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'completed', label: 'Completed' },
    { key: 'canceled', label: 'Canceled' },
    {key:'paid',label:'paid'}
    
   
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E2240] p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#11142D]">
            Welcome back, {currentUser?.name ?? ''}
          </h1>
          <p className="text-sm text-[#68718B] mt-1">
            You&apos;re making great progress. Ready for your next challenge?
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-[#68718B] uppercase tracking-wider mb-2">
                Sessions Completed
              </p>
              <p className="text-3xl font-black text-[#5051F9]">
                {totalCompleted}
              </p>
            </div>
            <div className="bg-[#EEF2FF] p-2.5 rounded-full text-[#5051F9]">
              <CheckCircle2 size={18} className="stroke-[2.5]" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-[#68718B] uppercase tracking-wider mb-2">
                Hours Learned
              </p>
              <p className="text-3xl font-black text-[#5051F9]">
                {totalHours}h
              </p>
            </div>
            <div className="bg-[#EEF2FF] p-2.5 rounded-full text-[#5051F9]">
              <Clock size={18} className="stroke-[2.5]" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-[#68718B] uppercase tracking-wider mb-2">
                Upcoming Sessions
              </p>
              <p className="text-3xl font-black text-[#5051F9]">
                {upcomingCount}
              </p>
            </div>
            <div className="bg-[#EEF2FF] p-2.5 rounded-full text-[#5051F9]">
              <Calendar size={14} className="stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* Live Session Banner */}
        {currentActiveSession && (
          <div className="bg-[#5051F9] text-white rounded-2xl p-6 shadow-xl shadow-indigo-100 relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 relative">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-white/90">
                  <Video size={18} />
                  <span>Your session starts soon</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">
                    {getDisplaySubject(currentActiveSession.subjectId)}
                  </h3>
                  <p className="text-sm text-white/80">
                    with {getDisplayTutor(currentActiveSession.tutorId)}
                  </p>
                </div>
                {currentActiveSession.confirmationCode && (
                  <div className="inline-flex items-center gap-2 bg-black/20 rounded-lg px-3 py-1.5 text-xs font-mono tracking-wide">
                    <span>
                      CONFIRMATION CODE:{' '}
                      <span className="font-bold text-lg ml-1">
                        {currentActiveSession.confirmationCode}
                      </span>
                    </span>
                    <button
                      onClick={() =>
                        handleCopyConfirmationCode(currentActiveSession.confirmationCode!)
                      }
                      className="ml-2 bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold px-2.5 py-1 rounded-md transition-colors shrink-0"
                    >
                      {copyStatus === 'copied'
                        ? 'Copied!'
                        : copyStatus === 'error'
                        ? 'Failed'
                        : 'Copy'}
                    </button>
                  </div>
                )}
              </div>
              <div>
                <Button
                  onClick={() =>
                    router.push(
                      `/${locale}/booking/${currentActiveSession._id}`,
                    )
                  }
                  className="bg-white text-[#5051F9] hover:bg-white/90 font-bold px-8 py-6 rounded-xl shadow-md text-sm transition-all w-full md:w-auto"
                >
                  Join Now
                </Button>
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          </div>
        )}

        {/* Pay error */}
        {payError && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
            <AlertCircle size={16} />
            <span>{payError}</span>
          </div>
        )}

        {/* Bookings List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#11142D]">
            Upcoming Bookings
          </h2>

          {/* Status filter tabs */}
          <div className="flex flex-wrap gap-2">
            {statusTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                  statusFilter === tab.key
                    ? 'bg-[#5051F9] text-white border-[#5051F9]'
                    : 'bg-white text-[#68718B] border-gray-200 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading && (
            <div className="flex items-center gap-2 text-gray-400 text-sm py-8 justify-center">
              <Loader2 size={20} className="animate-spin text-[#5051F9]" />
              <span>Loading bookings...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && filteredBookings.length === 0 && (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">
              No bookings found.
            </div>
          )}

          {!loading && !error && filteredBookings.length > 0 && (
            <div className="flex flex-col gap-3">
              {filteredBookings.map((booking) => {
                const showPayNow = booking.paymentStatus === 'unpaid' && booking.bookingStatus === 'confirmed';
                const isPaid = booking.paymentStatus === 'paid';
                // ✅ button is disabled while this specific booking is being checked out
                const isCheckingOut = pendingCheckoutId === booking._id;

                return (
                  <div
                    key={booking._id}
                    onClick={() =>
                      router.push(`/${locale}/booking/${booking._id}`)
                    }
                    className="bg-white hover:bg-gray-50/50 rounded-2xl p-4 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.01)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#E0E7FF] text-[#5051F9] flex items-center justify-center font-bold text-sm uppercase shrink-0">
                        {getDisplaySubject(booking.subjectId).substring(0, 2)}
                      </div>
                      <div className="flex flex-col">
                        <h4 className="font-bold text-[#11142D] text-[15px]">
                          {getDisplaySubject(booking.subjectId)}
                        </h4>
                        <p className="text-xs text-[#68718B]">with {getDisplayTutor(booking.tutorId)}</p>
                        <BookingStatusBadge status={booking.bookingStatus} />

                    
                      </div>
                    </div>

                    <div className="flex items-center gap-4 ml-auto sm:ml-0">
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#68718B] bg-gray-50 px-3 py-2 rounded-xl border border-gray-100/80">
                        <Calendar size={14} className="text-[#5051F9]" />
                        <span>
                          {formatDisplayTime(
                            booking.startAt,
                            booking.durationMinutes,
                          )}
                        </span>
                      </div>

                      {isPaid && (
                        <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 text-xs font-bold px-3 py-2 rounded-xl shrink-0">
                          <CheckCircle2 size={14} className="text-green-600" />
                          Paid
                        </span>
                      )}

                      {showPayNow && (
                        <Button
                          disabled={isCheckingOut}
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePayNow(booking._id);
                          }}
                          className="bg-[#5051F9] hover:bg-[#4041DB] text-white text-xs font-bold px-4 py-2 h-9 rounded-xl transition-all shadow-sm shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {isCheckingOut ? (
                            <>
                              <Loader2 size={12} className="animate-spin mr-1" /> Processing...
                            </>
                          ) : (
                            'Pay Now'
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}