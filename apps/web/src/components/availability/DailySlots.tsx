import { Calendar, Clock } from 'lucide-react';
import { TutorAvailabilitySlots } from '@/types/availability/tutor-availability';
import { formatDate } from '@/utils/tutor/formateDate';

export default function DailySlots({ data, locale }: { data: TutorAvailabilitySlots; locale: string }) {
  if (!data.availability || data.availability.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
        <Calendar className="w-10 h-10 text-muted-foreground/40" />
        <p className="text-muted-foreground text-sm">No available slots found for the selected period.</p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.availability.map((day) => (
        <div key={day.date} className="bg-card border border-border rounded-2xl p-4 space-y-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary shrink-0" />
            <p className="text-sm font-semibold">{formatDate(day.date, locale)}</p>
          </div>
          <div className="border-t border-border" />
          <div className="space-y-2">
            {day.slots.map((slot, i) => (
              <div key={i} className="flex items-center gap-2 bg-muted/40 rounded-lg px-3 py-2">
                <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                {/* <span className="text-sm font-medium">{slot.startTime}</span>
                <span className="text-xs text-muted-foreground">→</span>
                <span className="text-sm font-medium">{slot.endTime}</span> */}
                <span className="text-sm font-medium">{new Date(slot.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span className="text-xs text-muted-foreground">→</span>
                <span className="text-sm font-medium">{new Date(slot.endAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>

              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}