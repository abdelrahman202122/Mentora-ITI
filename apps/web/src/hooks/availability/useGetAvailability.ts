'use client'

import { useQuery } from '@tanstack/react-query'
import { getTutorAvailability } from '@/services/availability/get-tutor-availability'

export function useTutorAvailability(tutorId: string) {
  return useQuery({
    queryKey: ['tutorAvailability', tutorId],
    queryFn: () => getTutorAvailability(tutorId),
    enabled: !!tutorId,
  })
}