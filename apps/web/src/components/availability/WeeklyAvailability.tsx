// import { Clock, CalendarDays } from 'lucide-react';
// import { TutorAvailability } from '@/types/availability/tutor-availability';

// const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] as const;

// export default function WeeklyAvailability({ availability }: { availability: TutorAvailability }) {
//   const hasAnySlot = DAYS.some((d) => availability.slots[d]?.length > 0);

//   if (!hasAnySlot) {
//     return (
//       <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
//         <CalendarDays className="w-10 h-10 text-muted-foreground/40" />
//         <p className="text-muted-foreground text-sm">No weekly availability set yet.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
//       {DAYS.filter((d) => availability.slots[d]?.length > 0).map((day) => (
//         <div key={day} className="bg-card border border-border rounded-2xl p-4 space-y-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
//           <p className="text-sm font-semibold capitalize text-primary">{day}</p>
//           <div className="space-y-2">
//             {availability.slots[day].map((slot, i) => (
//               <div key={i} className="flex items-center gap-2 bg-muted/40 rounded-lg px-3 py-2">
//                 <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
//                 <span className="text-sm font-medium">{slot.startTime}</span>
//                 <span className="text-xs text-muted-foreground">→</span>
//                 <span className="text-sm font-medium">{slot.endTime}</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }
import { Clock, CalendarDays } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { TutorAvailability } from '@/types/availability/tutor-availability';

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] as const;

export default function WeeklyAvailability({ availability }: { availability: TutorAvailability }) {
  const t = useTranslations('availability.weeklyAvailability');
  const tDays = useTranslations('availability.days');
  const hasAnySlot = DAYS.some((d) => availability.slots[d]?.length > 0);

  if (!hasAnySlot) {
    return (
      <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
        <CalendarDays className="w-10 h-10 text-muted-foreground/40" />
        <p className="text-muted-foreground text-sm">{t('empty')}</p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {DAYS.filter((d) => availability.slots[d]?.length > 0).map((day) => (
        <div key={day} className="bg-card border border-border rounded-2xl p-4 space-y-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
          <p className="text-sm font-semibold capitalize text-primary">{tDays(day)}</p>
          <div className="space-y-2">
            {availability.slots[day].map((slot, i) => (
              <div key={i} className="flex items-center gap-2 bg-muted/40 rounded-lg px-3 py-2">
                <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="text-sm font-medium">{slot.startTime}</span>
                <span className="text-xs text-muted-foreground">→</span>
                <span className="text-sm font-medium">{slot.endTime}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}