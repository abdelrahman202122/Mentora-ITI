'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import {
  Calendar,
  Clock,
  Hourglass,
  Send,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import Link from 'next/link';

import { SummaryCard } from '@/components/learner/SummaryCard';
import BookingSuccess from '@/components/learner/BookingSuccess';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import { createBooking } from '@/services/booking-services/bookingService';
import { getTutorAvailability } from '@/services/booking-services/slots-service';

import type { AvailabilitySlots } from '@/types/bookingProcess/slots';

const DAYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

function getLocalDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function BookSessionContent() {
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = (params.locale as string) ?? 'en';
  const t = useTranslations('Booking');

  const tutorProfileId = searchParams.get('tutorProfileId');
  const tutorId = searchParams.get('tutorId') ?? '';
  const tutorName = searchParams.get('tutorName') ?? t('fallbackTutor');
  const subjectParam = searchParams.get('subject') ?? t('fallbackSubject');
  const hourlyRate = Number(searchParams.get('hourlyRate') ?? 45);
  const currency = 'EGP';
  const subjectId = searchParams.get('subjectId');
  const isRtl = locale === 'ar';

  const missingRequiredParams = !tutorProfileId || !subjectId;

  const [date, setDate] = useState('');
  const [duration, setDuration] = useState('60');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [slots, setSlots] = useState<AvailabilitySlots | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);

  useEffect(() => {
    if (!tutorId) return;
    async function fetchAvailability() {
      setSlotsLoading(true);
      try {
        const slots = await getTutorAvailability(tutorId);
        setSlots(slots);
      } catch (err) {
        console.error('Failed to fetch availability:', err);
      } finally {
        setSlotsLoading(false);
      }
    }
    fetchAvailability();
  }, [tutorId]);

  const availableSlots = useMemo(() => {
    if (!date || !slots) {
      return [];
    }
    const dayIndex = parseLocalDate(date).getDay();
    const dayName = DAYS[dayIndex] as keyof AvailabilitySlots;
    return slots[dayName] ?? [];
  }, [date, slots]);

  function convertTo12Hour(time: string): string {
    const [hourStr, minute] = time.split(':');
    let hour = parseInt(hourStr);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${ampm}`;
  }

  const isFormInvalid = !date || !duration || !time || missingRequiredParams;

  function buildDates(): { startAt: string; endAt: string } | null {
    if (!date || !time) return null;
    const startDate = new Date(`${date}T${time}:00`);
    if (isNaN(startDate.getTime())) return null;
    const endDate = new Date(
      startDate.getTime() + Number(duration) * 60 * 1000,
    );
    return {
      startAt: startDate.toISOString(),
      endAt: endDate.toISOString(),
    };
  }

  async function handleBooking() {
    setError(null);

    if (!tutorProfileId || !subjectId) {
      setError(t('errors.missingInfo'));
      return;
    }

    const dates = buildDates();
    if (!dates) {
      setError(t('errors.invalidDateTime'));
      return;
    }
    if (new Date(dates.startAt) < new Date()) {
      setError(t('errors.pastTime'));
      return;
    }
    setLoading(true);
    try {
      await createBooking({
        tutorProfileId,
        subjectId,
        startTime: dates.startAt,
        endTime: dates.endAt,
      });
      setSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : t('errors.generic');
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <BookingSuccess
        tutorName={tutorName}
        tutorId={tutorId}
        subject={subjectParam}
        date={date}
        time={time}
        duration={duration}
        hourlyRate={hourlyRate}
        currency={currency}
      />
    );
  }

  const inputClass = cn(
    'h-12 w-full bg-blue-50 border-blue-200 text-foreground focus-visible:border-blue-400 focus-visible:ring-blue-100',
    isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4',
  );
  const fieldIconClass = cn(
    'absolute top-1/2 -translate-y-1/2 text-blue-400 z-10',
    isRtl ? 'right-4' : 'left-4',
  );
  const backHref = tutorId
    ? `/${locale}/tutor-match/${tutorId}`
    : `/${locale}/find-tutor?mode=browse`;

  return (
    <div className="min-h-screen bg-white text-foreground p-4 sm:p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto mb-6">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="gap-2 text-sidebar-primary hover:underline px-0"
        >
          <Link href={backHref}>
            <ArrowLeft
              size={16}
              className={cn(isRtl && 'rotate-180')}
              aria-hidden
            />
            {t(tutorId ? 'backToTeacherProfile' : 'backToTutorResults')}
          </Link>
        </Button>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              {t('bookNewSession')}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {missingRequiredParams && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{t('missingTutorSubject')}</span>
              </div>
            )}

            {/* 1. Date */}
            <div>
              <label
                htmlFor="session-date"
                className="block text-sm font-medium text-muted-foreground mb-2"
              >
                {t('selectDate')}
              </label>
              <div className="relative flex items-center">
                <Calendar
                  className={fieldIconClass}
                  size={20}
                  aria-hidden
                />
                <Input
                  id="session-date"
                  type="date"
                  min={getLocalDateString(new Date())}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  disabled={missingRequiredParams}
                  className={inputClass}
                />
              </div>
            </div>

            {/* 2. Duration */}
            <div>
              <label
                htmlFor="session-duration"
                className="block text-sm font-medium text-muted-foreground mb-2"
              >
                {t('lessonDuration')}
              </label>
              <div className="relative flex items-center">
                <Hourglass
                  className={fieldIconClass}
                  size={20}
                  aria-hidden
                />
                <select
                  id="session-duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  disabled={missingRequiredParams}
                  className={cn(
                    'w-full h-12 bg-blue-50 border border-blue-200 rounded-lg text-foreground focus:outline-none focus:border-blue-400 text-sm cursor-pointer',
                    isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4',
                  )}
                >
                  <option value="30">{t('duration30')}</option>
                  <option value="60">{t('duration60')}</option>
                  <option value="90">{t('duration90')}</option>
                </select>
              </div>
            </div>

            {/* 3. Select Time */}
            <div>
              <label
                htmlFor="session-time"
                className="block text-sm font-medium text-muted-foreground mb-2"
              >
                {t('selectTime')}
              </label>
              <div className="relative flex items-center">
                <Clock
                  className={fieldIconClass}
                  size={20}
                  aria-hidden
                />
                <Input
                  id="session-time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  disabled={missingRequiredParams}
                  className={inputClass}
                />
              </div>
            </div>

            {/* 4. Available Slots */}
            {date && (
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  {t('availableSlots')}
                </label>

                {slotsLoading && (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm py-2">
                    <Loader2 size={14} className="animate-spin" />
                    {t('loadingSlots')}
                  </div>
                )}

                {!slotsLoading && availableSlots.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {availableSlots.map((slot) => (
                      <div
                        key={slot.startTime}
                        className="px-4 py-2 text-sm border border-blue-200 bg-blue-50 text-blue-700 font-medium rounded-lg"
                      >
                        {convertTo12Hour(slot.startTime)} -{' '}
                        {convertTo12Hour(slot.endTime)}
                      </div>
                    ))}
                  </div>
                )}

                {!slotsLoading && availableSlots.length === 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm rounded-lg px-4 py-3">
                    {t('noSlots')}
                  </div>
                )}
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3"
              >
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm flex flex-col justify-between h-fit">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-foreground">
              {t('bookingSummary')}
            </CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col justify-between flex-1">
            <SummaryCard
              tutorName={tutorName}
              subject={subjectParam}
              hourlyRate={hourlyRate}
              duration={duration}
              currency={currency}
            />

            <Button
              onClick={handleBooking}
              disabled={isFormInvalid || loading}
              size="lg"
              className="w-full mt-8 h-12 rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" aria-hidden />
                  <span>{t('booking')}</span>
                </>
              ) : (
                <>
                  <span>{t('sendRequest')}</span>
                  <Send size={16} className="rotate-45" aria-hidden />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function BookSessionFallback() {
  const t = useTranslations('Booking');
  return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      {t('pageLoading')}
    </div>
  );
}

export default function BookSessionPage() {
  return (
    <Suspense fallback={<BookSessionFallback />}>
      <BookSessionContent />
    </Suspense>
  );
}
