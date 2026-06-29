'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createTutorAvailability } from '@/services/availability/post-tutor-availability'

export function useCreateTutorAvailability(tutorId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTutorAvailability,
    onSuccess: () => {
      if (!tutorId) return

      queryClient.invalidateQueries({
        queryKey: ['tutorAvailabilitySlots', tutorId],
      })
    },
  })
}