'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createTutorSubject } from '@/services/tutor/addSubject'
import { TutorSubject } from '@/types/tutor/tutor-subject'

export function useCreateTutorSubject(tutorId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createTutorSubject,
    onSuccess: () => {
      if (!tutorId) return;
      queryClient.invalidateQueries({
        queryKey: ["tutorSubjects", tutorId],
      })
    },
  })
}