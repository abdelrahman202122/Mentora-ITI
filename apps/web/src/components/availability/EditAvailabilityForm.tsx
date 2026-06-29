
'use client';

import { X, Trash2, Loader2, Clock, Plus } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { useTutorAvailability } from '@/hooks/availability/useGetAvailability';
import { useUpdateTutorAvailability } from '@/hooks/availability/usePutAvailability';
import { useCurrentUser } from '@/hooks/auth/use-auth';
import { FormValues , schema} from '@/schemas/availability/availability-schema';
const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] as const;
type Day = typeof DAYS[number];


function DaySection({ day, control, register }: { day: Day; control: any; register: any }) {
  const { fields, remove } = useFieldArray({ control, name: day });
  if (fields.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold capitalize text-primary">{day}</p>
      {fields.map((field, index) => (
        <div key={field.id} className="flex items-center gap-3 bg-muted/40 rounded-xl p-3">
          <Clock className="w-4 h-4 text-primary shrink-0" />
          <input
            type="time"
            className="flex-1 bg-transparent text-sm border-none outline-none"
            {...register(`${day}.${index}.startTime`)}
          />
          <span className="text-muted-foreground text-xs">to</span>
          <input
            type="time"
            className="flex-1 bg-transparent text-sm border-none outline-none"
            {...register(`${day}.${index}.endTime`)}
          />
          <button
            type="button"
            onClick={() => remove(index)}
            className="h-7 w-7 rounded-lg border border-red-200 flex items-center justify-center hover:bg-red-50 transition shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
          </button>
        </div>
      ))}
    </div>
  );
}

export default function EditAvailabilityForm({
  tutorId,
  onClose,
}: {
  tutorId: string;
  onClose: () => void;
}) {
  const { data: availability, isLoading } = useTutorAvailability(tutorId);
  const { data: user } = useCurrentUser();
  const updateAvailability = useUpdateTutorAvailability(user?.id);

  const [showAddSlot, setShowAddSlot] = useState(false);
  const [newSlotDay, setNewSlotDay] = useState<Day>('monday');
  const [newSlotStart, setNewSlotStart] = useState('');
  const [newSlotEnd, setNewSlotEnd] = useState('');
const [slotError, setSlotError] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      timezone: '',
      monday: [], tuesday: [], wednesday: [], thursday: [],
      friday: [], saturday: [], sunday: [],
    },
  });

  useEffect(() => {
    if (!availability) return;
    form.reset({
      timezone: availability.timezone,
      monday: availability.slots.monday,
      tuesday: availability.slots.tuesday,
      wednesday: availability.slots.wednesday,
      thursday: availability.slots.thursday,
      friday: availability.slots.friday,
      saturday: availability.slots.saturday,
      sunday: availability.slots.sunday,
    });
  }, [availability]);

//   function handleAddSlot() {
//     if (!newSlotStart || !newSlotEnd) return;
//     const current = form.getValues(newSlotDay) ?? [];
//     form.setValue(newSlotDay, [...current, { startTime: newSlotStart, endTime: newSlotEnd }]);
//     setNewSlotStart('');
//     setNewSlotEnd('');
//     setShowAddSlot(false);
//   }

function handleAddSlot() {
  if (!newSlotStart || !newSlotEnd) {
    setSlotError('Both start and end time are required');
    return;
  }
  if (newSlotEnd <= newSlotStart) {
    setSlotError('End time must be after start time');
    return;
  }
  setSlotError('');
  const current = form.getValues(newSlotDay) ?? [];
  form.setValue(newSlotDay, [...current, { startTime: newSlotStart, endTime: newSlotEnd }]);
  setNewSlotStart('');
  setNewSlotEnd('');
  setShowAddSlot(false);
}
  async function handleSubmit(values: FormValues) {
    const { timezone, ...days } = values;
    await updateAvailability.mutateAsync({ slots: days, timezone });
    onClose();
  }

  const hasAnySlot = DAYS.some((d) => (form.watch(d) ?? []).length > 0);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-2xl w-full max-w-xl p-6 space-y-5 max-h-[85vh] flex flex-col">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">Edit Availability</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5 overflow-y-auto flex-1 pr-1">

            {!hasAnySlot && !showAddSlot && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No slots yet. Use the button below to add one.
              </p>
            )}

            {DAYS.map((day) => (
              <DaySection key={day} day={day} control={form.control} register={form.register} />
            ))}

            {/* Add Slot Section */}
            {showAddSlot ? (
              <div className="border border-border rounded-xl p-4 space-y-3">
                <p className="text-sm font-semibold">New Slot</p>
                <select
                  value={newSlotDay}
                  onChange={(e) => setNewSlotDay(e.target.value as Day)}
                  className="w-full p-3 rounded-lg border border-border bg-background capitalize text-sm"
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d} className="capitalize">{d}</option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Start</label>
                    <input
                      type="time"
                      value={newSlotStart}
                      onChange={(e) => setNewSlotStart(e.target.value)}
                      className="w-full p-3 rounded-lg border border-border bg-background text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">End</label>
                    <input
                      type="time"
                      value={newSlotEnd}
                      onChange={(e) => setNewSlotEnd(e.target.value)}
                      className="w-full p-3 rounded-lg border border-border bg-background text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                    {slotError && (
  <p className="text-xs text-red-600">{slotError}</p>
)}
                  <button
                    type="button"
                    onClick={() => setShowAddSlot(false)}
                    className="flex-1 py-2 text-sm rounded-lg border border-border"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddSlot}
                    className="flex-1 py-2 text-sm rounded-lg bg-primary text-white"
                  >
                    Add
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddSlot(true)}
                className="w-full py-2.5 rounded-xl border-2 border-dashed border-border text-sm text-muted-foreground hover:border-primary hover:text-primary transition flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Another Slot
              </button>
            )}

            <div className="space-y-1.5 pt-1">
              <label className="text-sm font-medium">Timezone</label>
              <input
                className="w-full p-3 rounded-lg border border-border bg-background text-sm"
                {...form.register('timezone')}
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-sm">
                Cancel
              </button>
              <button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="px-4 py-2 rounded-lg bg-primary text-white text-sm flex items-center gap-2"
              >
                {form.formState.isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}