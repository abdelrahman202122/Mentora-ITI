'use client'

import { useQuery } from '@tanstack/react-query'
import { getTutorProfile } from '@/services/tutor/tutor-profile-service'

export function useTutorProfile(tutorId: string) {
  return useQuery({
    queryKey: ['tutorProfile', tutorId],
    queryFn: () => getTutorProfile(tutorId),
    enabled: !!tutorId,
  })
}