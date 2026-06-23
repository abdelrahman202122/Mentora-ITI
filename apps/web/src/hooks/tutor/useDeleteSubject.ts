import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteTutorSubject } from '@/services/tutor/deleteSubject';

export function useDeleteTutorSubject(tutorId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTutorSubject,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tutorSubjects", tutorId],
      });
    },
  });
}