'use client';

import { useState } from 'react';
import { Plus, Pencil, CalendarDays, CalendarClock, Clock } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useCurrentUser } from '@/hooks/auth/use-auth';
import { useTutorAvailability } from '@/hooks/availability/useGetAvailability';
import { useTutorAvailabilitySlots } from '@/hooks/availability/useGetAvailabilitySlots';
import AddSlotForm from '@/components/availability/AddSlotForm';
import EditAvailabilityForm from '@/components/availability/EditAvailabilityForm';
import WeeklyAvailability from '@/components/availability/WeeklyAvailability';
import DailySlots from '@/components/availability/DailySlots';
import CreateAvailabilityForm from '@/components/availability/CreateAvailabilityForm';

export default function AvailabilityPage() {
  const locale = useLocale();
const { data: user, isLoading: isUserLoading } = useCurrentUser();
//   console.log('user object:', user);

  const tutorId = user?.id ?? '';
function toLocalYmd(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  const today = new Date();
  const startDate = toLocalYmd(today); // e.g. "2026-06-29"
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + 6);
  const endDate = toLocalYmd(endOfWeek); // e.g. "2026-07-05"
  const { data: slots, isLoading: isSlotsLoading } = useTutorAvailabilitySlots(tutorId, startDate, endDate);

//   const { data: availability, isLoading: isAvailabilityLoading } = useTutorAvailability(tutorId);
const { data: availability, isLoading: isAvailabilityLoading, error: availabilityError } = useTutorAvailability(tutorId);
const hasAvailability = !!availability && !availabilityError;
//   const { data: slots, isLoading: isSlotsLoading } = useTutorAvailabilitySlots(tutorId);
//   const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-12">

        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold">Manage Availability</h1>
          <p className="text-muted-foreground mt-1">
            Set your weekly schedule and let students find you at the right time.
          </p>
        </div>

        {/* Section 1 — Actions */}
        {/* <section className="space-y-4">
          <h2 className="text-xl font-bold">Schedule Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Time Slot
            </button>
            <button
              onClick={() => setShowEditForm(true)}
              className="btn-outline flex items-center gap-2"
            >
              <Pencil className="w-4 h-4" />
              Edit Availability
            </button>
          </div>
        </section> */}
<section className="space-y-4">
  <h2 className="text-xl font-bold">Schedule Actions</h2>
  {!isUserLoading && !isAvailabilityLoading && (
    <div className="flex flex-wrap gap-3">
      {!hasAvailability ? (
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Set Up My Availability
        </button>
      ) : (
        <button
          onClick={() => setShowEditForm(true)}
          className="btn-outline flex items-center gap-2"
        >
          <Pencil className="w-4 h-4" />
          Edit Availability
        </button>
      )}
    </div>
  )}
</section>
        {/* Section 2 — Weekly Availability */}
        <section className="space-y-5">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Weekly Schedule</h2>
          </div>
          <p className="text-sm text-muted-foreground -mt-3">
            Your recurring availability across the week.
          </p>

          {isAvailabilityLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-2xl p-4 h-28 animate-pulse" />
              ))}
            </div>
          ) : !availability ? (
            <p className="text-sm text-muted-foreground">No availability data found.</p>
          ) : (
            <WeeklyAvailability availability={availability} />
          )}
        </section>

        {/* Section 3 — Available Slots by Date */}
        <section className="space-y-5">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Available Slots by Date</h2>
          </div>
          <p className="text-sm text-muted-foreground -mt-3">
            View your open booking slots for the upcoming period.
          </p>

          {isSlotsLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-2xl p-4 h-32 animate-pulse" />
              ))}
            </div>
          ) : !slots ? (
            <p className="text-sm text-muted-foreground">No slot data found.</p>
          ) : (
            <DailySlots data={slots} locale={locale} />
          )}
        </section>

      </div>

      {/* Modals */}
      {/* {showAddForm && <AddSlotForm onClose={() => setShowAddForm(false)} />} */}
      {showCreateForm && <CreateAvailabilityForm onClose={() => setShowCreateForm(false)} />}

      {showEditForm && tutorId && (
        <EditAvailabilityForm tutorId={tutorId} onClose={() => setShowEditForm(false)} />
      )}
    </div>
  );
}