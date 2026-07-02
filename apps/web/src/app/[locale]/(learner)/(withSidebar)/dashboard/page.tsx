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
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import type { Booking } from '@/types/bookingProcess/booking';
import { getMyBookings } from '@/services/booking-services/getMyBookingService';
import { getSubjectTitle } from '@/services/booking-services/getSubjectTitleService';
import { getTutorName } from '@/services/booking-services/getTutorNameService';
import { initiateCheckout } from '@/services/payment/paymentService';
import { useCurrentUser } from '@/hooks/auth/use-auth';

function formatDisplayTime(
  iso: string,
  duration: number,
  t: ReturnType<typeof useTranslations<'Dashboard'>>,
  locale: string,
) {
  const dateObj = new Date(iso);
  const timeString = dateObj.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });

  const hours = duration / 60;
  const durationText = t('time.sessionSuffix', { duration: hours });

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isTomorrow = dateObj.toDateString() === tomorrow.toDateString();
  const datePrefix = isTomorrow
    ? t('time.tomorrow')
    : dateObj.toLocaleDateString(locale, { month: 'short', day: 'numeric' });

  return `${datePrefix}, ${timeString} (${durationText})`;
}

function isSessionLive(booking: Booking, now: number): boolean {
  if (booking.bookingStatus !== 'confirmed') return false;
  if (booking.paymentStatus !== 'paid') return false;
  const start = new Date(booking.startAt).getTime();
  const end = new Date(booking.endAt).getTime();
  const threeHoursMs = 3 * 60 * 60 * 1000;
  return now >= start - threeHoursMs && now <= end;
}

function shouldShowConfirmationCode(booking: Booking): boolean {
  return (
    booking.bookingStatus === 'confirmed' &&
    booking.paymentStatus === 'paid' &&
    Boolean(booking.confirmationCode)
  );
}

function BookingStatusBadge({
  status,
  t,
}: {
  status: Booking['bookingStatus'];
  t: ReturnType<typeof useTranslations<'Dashboard'>>;
}) {
  const config: Record<string, { dot: string; className: string }> = {
    pending: { dot: 'bg-amber-400', className: 'bg-amber-50 text-amber-700 border-amber-200' },
    confirmed: { dot: 'bg-green-500', className: 'bg-green-50 text-green-700 border-green-200' },
    completed: { dot: 'bg-blue-500', className: 'bg-blue-50 text-blue-700 border-blue-200' },
    canceled: { dot: 'bg-red-400', className: 'bg-red-50 text-red-600 border-red-200' },
    rejected: { dot: 'bg-orange-400', className: 'bg-orange-50 text-orange-700 border-orange-200' },
    expired: { dot: 'bg-gray-400', className: 'bg-gray-50 text-gray-500 border-gray-200' },
  };

  const current = config[status] ?? { dot: 'bg-gray-400', className: 'bg-gray-50 text-gray-500 border-gray-200' };
  const label = t(`status.${status}`);

  return (
    <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold w-fit ${current.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${current.dot} ${status === 'pending' ? 'animate-pulse' : ''}`} />
      {label}
    </span>
  );
}

export default function LearnerDashboardPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) ?? 'en';
  const { data: currentUser } = useCurrentUser();
  const t = useTranslations('Dashboard');

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [payError, setPayError] = useState<string | null>(null);
  const [pendingCheckoutId, setPendingCheckoutId] = useState<string | null>(null);

  const [subjectTitles, setSubjectTitles] = useState<Record<string, string>>({});
  const [tutorNames, setTutorNames] = useState<Record<string, string>>({});

  const [statusFilter, setStatusFilter] = useState<
    'all' | 'pending' | 'confirmed' | 'completed' | 'canceled' | 'paid'
  >('all');

  const [now, setNow] = useState(() => Date.now());
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  function refetchBookings() {
    return getMyBookings()
      .then(setBookings)
      .catch((err) => setError(err.message));
  }

  useEffect(() => {
    refetchBookings().finally(() => setLoading(false));
  }, []);

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
    if (pendingCheckoutId) return;

    setPayError(null);
    setPendingCheckoutId(bookingId);

    try {
      const { checkoutUrl } = await initiateCheckout(bookingId);
      window.location.assign(checkoutUrl);
    } catch (err: unknown) {
      console.error(err);
      setPayError(err instanceof Error ? err.message : t('errors.payFailed'));
      setPendingCheckoutId(null);
    }
  }

  const upcomingBookings = bookings.filter(
    (b) => b.bookingStatus === 'pending' || b.bookingStatus === 'confirmed',
  );
  const totalCompleted = bookings.filter(
    (b) => b.bookingStatus === 'completed',
  ).length;
  const totalHours = bookings
    .filter((b) => b.bookingStatus === 'completed')
    .reduce((acc, curr) => acc + curr.durationMinutes / 60, 0);
  const upcomingCount = upcomingBookings.length;

  const currentActiveSession = upcomingBookings.find((b) => isSessionLive(b, now));

  const filteredBookings =
    statusFilter === 'all'
      ? bookings
      : statusFilter === 'paid'
      ? bookings.filter((b) => b.paymentStatus === 'paid')
      : bookings.filter((b) => b.bookingStatus === statusFilter);

  const statusTabs: { key: typeof statusFilter; label: string }[] = [
    { key: 'all', label: t('tabs.all') },
    { key: 'pending', label: t('tabs.pending') },
    { key: 'confirmed', label: t('tabs.confirmed') },
    { key: 'completed', label: t('tabs.completed') },
    { key: 'canceled', label: t('tabs.canceled') },
    { key: 'paid', label: t('tabs.paid') },
  ];

  return (
    <div className="min-h-screen bg-background p-4 text-slate-950 md:p-8">
      <div className="mx-auto max-w-5xl space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold tracking-normal text-slate-950 sm:text-3xl">
            {t('welcomeBack', { name: currentUser?.name ?? '' })}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {t('subtitle')}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-start justify-between rounded-lg border border-slate-200 bg-white p-5">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                {t('stats.sessionsCompleted')}
              </p>
              <p className="text-3xl font-black text-indigo-600">
                {totalCompleted}
              </p>
            </div>
            <div className="rounded-full bg-indigo-50 p-2.5 text-indigo-600">
              <CheckCircle2 size={18} className="stroke-[2.5]" />
            </div>
          </div>

          <div className="flex items-start justify-between rounded-lg border border-slate-200 bg-white p-5">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                {t('stats.hoursLearned')}
              </p>
              <p className="text-3xl font-black text-indigo-600">
                {totalHours}h
              </p>
            </div>
            <div className="rounded-full bg-indigo-50 p-2.5 text-indigo-600">
              <Clock size={18} className="stroke-[2.5]" />
            </div>
          </div>

          <div className="flex items-start justify-between rounded-lg border border-slate-200 bg-white p-5">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                {t('stats.upcomingSessions')}
              </p>
              <p className="text-3xl font-black text-indigo-600">
                {upcomingCount}
              </p>
            </div>
            <div className="rounded-full bg-indigo-50 p-2.5 text-indigo-600">
              <Calendar size={14} className="stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* Live Session Banner */}
        {currentActiveSession && (
          <div className="relative overflow-hidden rounded-lg bg-indigo-600 p-6 text-white">
            <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-white/90">
                  <Video size={18} />
                  <span>{t('liveSession.startsSoon')}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">
                    {getDisplaySubject(currentActiveSession.subjectId)}
                  </h3>
                  <p className="text-sm text-white/80">
                    {t('liveSession.with', { tutorName: getDisplayTutor(currentActiveSession.tutorId) })}
                  </p>
                </div>
                {currentActiveSession.confirmationCode && (
                  <div className="inline-flex flex-wrap items-center gap-2 rounded-lg bg-black/20 px-3 py-1.5 font-mono text-xs tracking-wide">
                    <span>
                      {t('liveSession.confirmationCode')}{' '}
                      <span className="ms-1 text-lg font-bold">
                        {currentActiveSession.confirmationCode}
                      </span>
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() =>
                        handleCopyConfirmationCode(currentActiveSession.confirmationCode!)
                      }
                      className="h-7 shrink-0 rounded-md bg-white/20 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-white/30 hover:text-white"
                    >
                      {copyStatus === 'copied'
                        ? t('liveSession.copied')
                        : copyStatus === 'error'
                        ? t('liveSession.failed')
                        : t('liveSession.copy')}
                    </Button>
                  </div>
                )}
              </div>
             
            </div>
            <div className="absolute -bottom-10 end-[-2.5rem] size-40 rounded-full bg-white/10 blur-2xl" />
          </div>
        )}

        {/* Pay error */}
        {payError && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            <AlertCircle size={16} />
            <span>{payError}</span>
          </div>
        )}

        {/* Bookings List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-950">
            {t('bookingsList.title')}
          </h2>

          {/* Status filter tabs */}
          <div className="flex flex-wrap gap-2">
            {statusTabs.map((tab) => (
              <Button
                key={tab.key}
                type="button"
                variant="outline"
                onClick={() => setStatusFilter(tab.key)}
                className={`h-9 rounded-lg px-4 text-xs font-bold transition-colors ${
                  statusFilter === tab.key
                    ? 'border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </Button>
            ))}
          </div>

          {loading && (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500">
              <Loader2 size={20} className="animate-spin text-indigo-600" />
              <span>{t('bookingsList.loading')}</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && filteredBookings.length === 0 && (
            <div className="rounded-lg border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
              {t('bookingsList.empty')}
            </div>
          )}

          {!loading && !error && filteredBookings.length > 0 && (
            <div className="flex flex-col gap-3">
              {filteredBookings.map((booking) => {
                const showPayNow = booking.paymentStatus === 'unpaid' && booking.bookingStatus === 'confirmed';
                const isPaid = booking.paymentStatus === 'paid';
                const isCheckingOut = pendingCheckoutId === booking._id;
                const showConfirmationCode = shouldShowConfirmationCode(booking);

                return (
                  <div
                    key={booking._id}
                    onClick={() =>
                      router.push(`/${locale}/booking/${booking._id}`)
                    }
                    className="flex cursor-pointer flex-col justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4 transition-colors duration-200 hover:bg-slate-50 sm:flex-row sm:items-center"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-bold uppercase text-indigo-600">
                        {getDisplaySubject(booking.subjectId).substring(0, 2)}
                      </div>
                      <div className="flex flex-col">
                        <h4 className="text-[15px] font-bold text-slate-950">
                          {getDisplaySubject(booking.subjectId)}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {t('bookingsList.with', { tutorName: getDisplayTutor(booking.tutorId) })}
                        </p>
                        <BookingStatusBadge status={booking.bookingStatus} t={t} />
                        {showConfirmationCode && (
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="rounded-lg bg-indigo-50 px-3 py-1.5 font-mono text-xs font-bold tracking-wider text-indigo-600">
                              {t('liveSession.confirmationCode')}{' '}
                              {booking.confirmationCode}
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleCopyConfirmationCode(booking.confirmationCode!);
                              }}
                              className="h-7 rounded-lg border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50"
                            >
                              {copyStatus === 'copied'
                                ? t('liveSession.copied')
                                : copyStatus === 'error'
                                ? t('liveSession.failed')
                                : t('liveSession.copy')}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="ms-auto flex flex-wrap items-center gap-3 sm:ms-0 sm:justify-end">
  <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
    <Calendar size={14} className="text-indigo-600" />
    <span>
      {formatDisplayTime(
        booking.startAt,
        booking.durationMinutes,
        t,
        locale // 👈 تم إضافة متغير الـ locale هنا كمعامل رابع
      )}
    </span>
  </div>

  {isPaid && (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-bold text-green-700">
      <CheckCircle2 size={14} className="text-green-600" />
      {t('bookingsList.paid')}
    </span>
  )}

  {showPayNow && (
    <Button
      disabled={isCheckingOut}
      onClick={(e) => {
        e.stopPropagation();
        handlePayNow(booking._id);
      }}
      className="h-9 shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isCheckingOut ? (
        <>
          <Loader2 size={12} className="me-1 animate-spin" /> {t('bookingsList.processing')}
        </>
      ) : (
        t('bookingsList.payNow')
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
