'use client';

import { Trash2, Clock } from 'lucide-react';
import {
  type Control,
  type Path,
  type UseFormRegister,
  useFieldArray,
} from 'react-hook-form';
import type { FormValues } from '@/schemas/availability/availability-schema';

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] as const;
type Day = typeof DAYS[number];

interface DaySectionProps {
  day: Day;
  control: Control<FormValues>;
  register: UseFormRegister<FormValues>;
}

export default function DaySection({ day, control, register }: DaySectionProps) {
  const { fields, remove } = useFieldArray<FormValues>({ control, name: day });

  if (fields.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold capitalize text-primary">{day}</p>
      {fields.map((field, index) => (
        <div key={field.id} className="flex items-center gap-3 bg-muted/40 rounded-xl p-3">
          <Clock className="w-4 h-4 text-primary shrink-0" />
        <input
            type="time"
            aria-label={`${day} slot ${index + 1} start time`}
            className="flex-1 bg-transparent text-sm border-none outline-none"
            {...register(`${day}.${index}.startTime` as Path<FormValues>)}
          />
          <span className="text-muted-foreground text-xs">to</span>
          <input
            type="time"
            aria-label={`${day} slot ${index + 1} end time`}
            className="flex-1 bg-transparent text-sm border-none outline-none"
            {...register(`${day}.${index}.endTime` as Path<FormValues>)}
          />
          <button
            type="button"
            onClick={() => remove(index)}
            aria-label={`Remove ${day} slot ${index + 1}`}
            className="h-7 w-7 rounded-lg border border-red-200 flex items-center justify-center hover:bg-red-50 transition shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
          </button>
        </div>
      ))}
    </div>
  );
}
