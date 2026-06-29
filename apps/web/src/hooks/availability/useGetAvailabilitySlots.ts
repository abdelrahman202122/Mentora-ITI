'use client'

import { useQuery } from '@tanstack/react-query'
import { getTutorAvailabilitySlots } from '@/services/availability/get-tutor-availability-solt'

// export function useTutorAvailabilitySlots(tutorId: string) {
//   return useQuery({
//     queryKey: ['tutorAvailabilitySlots', tutorId],
//     queryFn: () => getTutorAvailabilitySlots(tutorId),
//     enabled: !!tutorId,
//   })
// }
export function useTutorAvailabilitySlots(tutorId: string, startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['tutorAvailabilitySlots', tutorId, startDate, endDate],
    queryFn: () => getTutorAvailabilitySlots(tutorId, startDate, endDate),
    enabled: !!tutorId && !!startDate && !!endDate,
  })
}