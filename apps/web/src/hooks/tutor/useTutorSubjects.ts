'use client'

import { useQuery } from '@tanstack/react-query'
import { getTutorSubjects } from '@/services/tutor/tutor-subjects'

export function useTutorSubjects(tutorId: string) {
  return useQuery({
    queryKey: ['tutorSubjects', tutorId],
    queryFn: () => getTutorSubjects(tutorId),
    enabled: !!tutorId,
  })
}