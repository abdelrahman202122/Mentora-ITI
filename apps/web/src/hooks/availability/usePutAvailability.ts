'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateTutorAvailability } from '@/services/availability/put-tutor-availability'

export function useUpdateTutorAvailability(tutorId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateTutorAvailability,
    onSuccess: () => {
      if (!tutorId) return

      queryClient.invalidateQueries({
        queryKey: ['tutorAvailabilitySlots', tutorId],
      })
        queryClient.invalidateQueries({
        queryKey: ['tutorAvailability', tutorId],
  })
    },
  })
}