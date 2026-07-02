'use client';

import { useState } from 'react';
import { CalendarClock, CalendarDays, Pencil, Plus } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import CreateAvailabilityForm from '@/components/availability/CreateAvailabilityForm';
import DailySlots from '@/components/availability/DailySlots';
import EditAvailabilityForm from '@/components/availability/EditAvailabilityForm';
import WeeklyAvailability from '@/components/availability/WeeklyAvailability';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/hooks/auth/use-auth';
import { useTutorAvailability } from '@/hooks/availability/useGetAvailability';
import { useTutorAvailabilitySlots } from '@/hooks/availability/useGetAvailabilitySlots';

function toLocalYmd(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function AvailabilityPage() {
  const locale = useLocale();
  const t = useTranslations('availability.page');
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const [showEditForm, setShowEditForm] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const tutorId = user?.id ?? '';
  const today = new Date();
  const startDate = toLocalYmd(today);
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + 6);
  const endDate = toLocalYmd(endOfWeek);

  const { data: slots, isLoading: isSlotsLoading } =
    useTutorAvailabilitySlots(tutorId, startDate, endDate);
  const {
    data: availability,
    error: availabilityError,
    isLoading: isAvailabilityLoading,
  } = useTutorAvailability(tutorId);

  const hasAvailability = !!availability && !availabilityError;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-10">
        <header>
          <h1 className="text-2xl sm:text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground mt-1">{t('description')}</p>
        </header>

        <section className="space-y-4">
          <h2 className="text-xl font-bold">{t('scheduleActions')}</h2>
          {!isUserLoading && !isAvailabilityLoading && (
            <div className="flex flex-wrap gap-3">
              {!hasAvailability ? (
                <Button type="button" onClick={() => setShowCreateForm(true)}>
                  <Plus className="w-4 h-4" />
                  {t('setUpMyAvailability')}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditForm(true)}
                >
                  <Pencil className="w-4 h-4" />
                  {t('editAvailability')}
                </Button>
              )}
            </div>
          )}
        </section>

        <section className="space-y-5">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">{t('weeklySchedule')}</h2>
          </div>
          <p className="text-sm text-muted-foreground -mt-3">
            {t('weeklyDescription')}
          </p>

          {isAvailabilityLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-card border border-border rounded-2xl p-4 h-28 animate-pulse"
                />
              ))}
            </div>
          ) : !availability ? (
            <p className="text-sm text-muted-foreground">
              {t('noAvailability')}
            </p>
          ) : (
            <WeeklyAvailability availability={availability} />
          )}
        </section>

        <section className="space-y-5">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">{t('slotsByDate')}</h2>
          </div>
          <p className="text-sm text-muted-foreground -mt-3">
            {t('slotsDescription')}
          </p>

          {isSlotsLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-card border border-border rounded-2xl p-4 h-32 animate-pulse"
                />
              ))}
            </div>
          ) : !slots ? (
            <p className="text-sm text-muted-foreground">{t('noSlots')}</p>
          ) : (
            <DailySlots data={slots} locale={locale} />
          )}
        </section>
      </div>

      {showCreateForm && (
        <CreateAvailabilityForm onClose={() => setShowCreateForm(false)} />
      )}

      {showEditForm && tutorId && (
        <EditAvailabilityForm
          tutorId={tutorId}
          onClose={() => setShowEditForm(false)}
        />
      )}
    </div>
  );
}
