'use client';

import { type FormEvent, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  School,
  Timer,
  Video,
} from 'lucide-react';
import BookingCard from '@/components/tutor/BookingCard';
import StatCard from '@/components/tutor/StatCard';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCurrentUser } from '@/hooks/auth/use-auth';
import { useAcceptBooking } from '@/hooks/booking/approveBooking';
import { useTutorBookings } from '@/hooks/booking/booking';
import { useCancelBooking } from '@/hooks/booking/cancelBooking';
import { useRejectBooking } from '@/hooks/booking/rejectBooking';
import { useConfirmBookingCode } from '@/hooks/booking/useConfirmBookingCode';
import { useTutorStats } from '@/hooks/tutor/useTutorStats';
import type { BookingStatus } from '@/services/booking-services/getMyBooking';
import type { Booking } from '@/types/booking/booking-data';

function formatCurrency(
  amount: number | undefined,
  currency: string = 'USD',
  locale: string,
): string {
  if (typeof amount === 'undefined') {
    return 'Failed to load';
  }

  try {
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

function formatSessionDateTime(isoString: string, locale: string): string {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {
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

export default function InstructorDashboard() {
  const locale = useLocale();
  const t = useTranslations('tutorDashboard');
  const tStatus = useTranslations('tutorDashboard.bookingStatus');
  const statusFilters: { label: string; value: BookingStatus | 'all' }[] = [
    { label: tStatus('all'), value: 'all' },
    { label: tStatus('pending'), value: 'pending' },
    { label: tStatus('confirmed'), value: 'confirmed' },
    { label: tStatus('completed'), value: 'completed' },
    { label: tStatus('canceled'), value: 'canceled' },
    { label: tStatus('rejected'), value: 'rejected' },
    { label: tStatus('expired'), value: 'expired' },
  ];

  const [activeFilter, setActiveFilter] = useState<BookingStatus | 'all'>(
    'all',
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [sessionCode, setSessionCode] = useState('');
  const [sessionSuccess, setSessionSuccess] = useState<string | null>(null);

  const { data, isLoading, isError } = useTutorBookings(
    activeFilter !== 'all'
      ? {
          bookingStatus: activeFilter,
          page: currentPage,
          limit: 10,
        }
      : { page: currentPage, limit: 10 },
  );
  const { data: currentUser } = useCurrentUser();
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

  function handleFilterChange(value: BookingStatus | 'all') {
    setActiveFilter(value);
    setCurrentPage(1);
  }

  function handleSessionCodeSubmit(event: FormEvent<HTMLFormElement>) {
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
      <div className="mx-auto max-w-6xl space-y-10 px-6 py-8">
        <header>
          <h1 className="text-3xl font-bold">
            {t('welcomeBack')}
            {displayName ? `, ${displayName}` : ''}
          </h1>
        </header>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <StatCard
            icon={CreditCard}
            label={t('stats.totalEarnings')}
            value={
              isStatsLoading
                ? '...'
                : formatCurrency(stats?.totalEarnings, 'EGP', locale)
            }
          />
          <StatCard
            icon={School}
            label={t('stats.totalSessions')}
            value={
              isStatsLoading
                ? '...'
                : String(stats?.totalSessions ?? t('stats.failedToLoad'))
            }
          />
          <StatCard
            icon={Timer}
            label={t('stats.hoursTaught')}
            value={
              isStatsLoading
                ? '...'
                : stats?.totalHours != null
                  ? `${stats.totalHours}h`
                  : t('stats.failedToLoad')
            }
          />
        </section>

        <Card className="border-primary/15 bg-primary text-primary-foreground shadow-sm">
          <CardHeader className="gap-2">
            <div className="flex items-center gap-2">
              <Video className="size-5" />
              <CardTitle className="text-xl">
                {t('startSession.title')}
              </CardTitle>
            </div>
            <CardDescription className="max-w-2xl text-primary-foreground/80">
              {t('startSession.description')}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {activeSession ? (
              <div className="rounded-xl border border-white/15 bg-white/10 p-4">
                <p className="text-sm font-semibold">
                  Session - {activeSession.subjectId}
                </p>
                <p className="mt-1 text-sm text-primary-foreground/75">
                  {formatSessionDateTime(activeSession.startAt, locale)} -{' '}
                  {formatSessionDateTime(activeSession.endAt, locale)}
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-white/15 bg-white/10 p-4 text-sm text-primary-foreground/85">
                {nextPaidSession ? (
                  <>
                    {t('startSession.nextStarts')}{' '}
                    <span className="font-semibold text-primary-foreground">
                      {formatSessionDateTime(nextPaidSession.startAt, locale)}
                    </span>
                    {t('startSession.fieldAvailable')}
                  </>
                ) : (
                  t('startSession.noLiveSession')
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
                placeholder={t('startSession.inputPlaceholder')}
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
                {confirmBookingCode.isPending
                  ? t('startSession.verifying')
                  : t('startSession.verifyButton')}
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
                {t('startSession.verified')}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{t('bookings.title')}</h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {statusFilters.map(({ label, value }) => (
              <Button
                variant={activeFilter === value ? 'default' : 'outline'}
                size="sm"
                key={value}
                onClick={() => handleFilterChange(value)}
                type="button"
              >
                {label}
              </Button>
            ))}
          </div>

          {isLoading ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {t('bookings.loading')}
            </div>
          ) : null}
          {isError ? (
            <div className="py-6 text-center text-sm text-red-500">
              {t('bookings.error')}
            </div>
          ) : null}
          {!isLoading && !isError && bookings.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {t('bookings.empty')}
            </div>
          ) : null}

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
                    cancelReason: t('bookings.cancelReason'),
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

          {totalPages > 1 ? (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                type="button"
              >
                {t('bookings.previous')}
              </Button>

              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                  (page) => (
                    <Button
                      variant={page === currentPage ? 'default' : 'outline'}
                      size="icon"
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      type="button"
                    >
                      {page}
                    </Button>
                  ),
                )}
              </div>

              <Button
                variant="outline"
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                disabled={currentPage === totalPages}
                type="button"
              >
                {t('bookings.next')}
              </Button>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
