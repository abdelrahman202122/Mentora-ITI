// 'use client';

// import { X, Loader2 } from 'lucide-react';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { useCreateTutorAvailability } from '@/hooks/availability/usePostAvailability';
// import { useCurrentUser } from '@/hooks/auth/use-auth';

// const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] as const;
// type Day = typeof DAYS[number];
// //--------------------------------------------------
// const schema = z.object({
//   day: z.enum(DAYS),
//   startTime: z.string().min(1, 'Required'),
//   endTime: z.string().min(1, 'Required'),
//   timezone: z.string().min(1, 'Required'),
// }).refine((data) => data.endTime > data.startTime, {
//   message: 'End time must be after start time',
//   path: ['endTime'],
// });
// type FormValues = z.infer<typeof schema>;

// export default function AddSlotForm({ onClose }: { onClose: () => void }) {
//   const { data: user } = useCurrentUser();
//   const createAvailability = useCreateTutorAvailability(user?.id);

//   const form = useForm<FormValues>({
//     resolver: zodResolver(schema),
//     defaultValues: {
//       day: 'monday',
//       startTime: '',
//       endTime: '',
//       timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
//     },
//   });

// async function handleSubmit(values: FormValues) {
//   const allDays = {
//     monday: [],
//     tuesday: [],
//     wednesday: [],
//     thursday: [],
//     friday: [],
//     saturday: [],
//     sunday: [],
//   };

//   await createAvailability.mutateAsync({
//     slots: {
//       ...allDays,
//       [values.day]: [{ startTime: values.startTime, endTime: values.endTime }],
//     },
//     timezone: values.timezone,
//   });
//   onClose();
// }
//   return (
//     <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
//       <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 space-y-5">
//         <div className="flex justify-between items-center">
//           <h2 className="text-lg font-bold">Add Time Slot</h2>
//           <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
//             <X className="w-5 h-5" />
//           </button>
//         </div>

//         <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
//           {/* Day */}
//           <div className="space-y-1.5">
//             <label className="text-sm font-medium">Day</label>
//             <select
//               className="w-full p-3 rounded-lg border border-border bg-background capitalize"
//               {...form.register('day')}
//             >
//               {DAYS.map((d) => (
//                 <option key={d} value={d} className="capitalize">{d}</option>
//               ))}
//             </select>
//             {form.formState.errors.day && (
//               <p className="text-xs text-red-600">{form.formState.errors.day.message}</p>
//             )}
//           </div>

//           {/* Start & End Time */}
//           <div className="grid grid-cols-2 gap-3">
//             <div className="space-y-1.5">
//               <label className="text-sm font-medium">Start Time</label>
//               <input
//                 type="time"
//                 className="w-full p-3 rounded-lg border border-border bg-background"
//                 {...form.register('startTime')}
//               />
//               {form.formState.errors.startTime && (
//                 <p className="text-xs text-red-600">{form.formState.errors.startTime.message}</p>
//               )}
//             </div>
//             <div className="space-y-1.5">
//               <label className="text-sm font-medium">End Time</label>
//               <input
//                 type="time"
//                 className="w-full p-3 rounded-lg border border-border bg-background"
//                 {...form.register('endTime')}
//               />
//               {form.formState.errors.endTime && (
//                 <p className="text-xs text-red-600">{form.formState.errors.endTime.message}</p>
//               )}
//             </div>
//           </div>

//           {/* Timezone */}
//           <div className="space-y-1.5">
//             <label className="text-sm font-medium">Timezone</label>
//             <input
//               className="w-full p-3 rounded-lg border border-border bg-background text-sm"
//               {...form.register('timezone')}
//             />
//           </div>

//           <div className="flex justify-end gap-2 pt-1">
//             <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-sm">
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={form.formState.isSubmitting}
//               className="px-4 py-2 rounded-lg bg-primary text-white text-sm flex items-center gap-2"
//             >
//               {form.formState.isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
//               Add Slot
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }
'use client';

import { X, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { useCreateTutorAvailability } from '@/hooks/availability/usePostAvailability';
import { useCurrentUser } from '@/hooks/auth/use-auth';

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] as const;
type Day = typeof DAYS[number];

const schema = z.object({
  day: z.enum(DAYS),
  startTime: z.string().min(1, 'Required'),
  endTime: z.string().min(1, 'Required'),
  timezone: z.string().min(1, 'Required'),
}).refine((data) => data.endTime > data.startTime, {
  message: 'End time must be after start time',
  path: ['endTime'],
});
type FormValues = z.infer<typeof schema>;

export default function AddSlotForm({ onClose }: { onClose: () => void }) {
  const t = useTranslations('availability.addSlotForm');
  const tDays = useTranslations('availability.days');
  const { data: user } = useCurrentUser();
  const createAvailability = useCreateTutorAvailability(user?.id);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      day: 'monday',
      startTime: '',
      endTime: '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  });

  async function handleSubmit(values: FormValues) {
    const allDays = {
      monday: [], tuesday: [], wednesday: [], thursday: [],
      friday: [], saturday: [], sunday: [],
    };

    await createAvailability.mutateAsync({
      slots: {
        ...allDays,
        [values.day]: [{ startTime: values.startTime, endTime: values.endTime }],
      },
      timezone: values.timezone,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 space-y-5">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">{t('title')}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {/* Day */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t('day')}</label>
            <select
              className="w-full p-3 rounded-lg border border-border bg-background capitalize"
              {...form.register('day')}
            >
              {DAYS.map((d) => (
                <option key={d} value={d} className="capitalize">{tDays(d)}</option>
              ))}
            </select>
            {form.formState.errors.day && (
              <p className="text-xs text-red-600">{form.formState.errors.day.message}</p>
            )}
          </div>

          {/* Start & End Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t('startTime')}</label>
              <input
                type="time"
                className="w-full p-3 rounded-lg border border-border bg-background"
                {...form.register('startTime')}
              />
              {form.formState.errors.startTime && (
                <p className="text-xs text-red-600">{form.formState.errors.startTime.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t('endTime')}</label>
              <input
                type="time"
                className="w-full p-3 rounded-lg border border-border bg-background"
                {...form.register('endTime')}
              />
              {form.formState.errors.endTime && (
                <p className="text-xs text-red-600">{form.formState.errors.endTime.message}</p>
              )}
            </div>
          </div>

          {/* Timezone */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t('timezone')}</label>
            <input
              className="w-full p-3 rounded-lg border border-border bg-background text-sm"
              {...form.register('timezone')}
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-sm">
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm flex items-center gap-2"
            >
              {form.formState.isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {t('addSlot')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}