import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTutorSubject } from "@/services/tutor/editSubject";
import { CoursePayload } from "@/schemas/subject/subject-schema";

export function useUpdateTutorSubject(
  tutorId: string | undefined
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      subjectId,
      payload,
    }: {
      subjectId: string;
      payload: CoursePayload;
    }) => updateTutorSubject(subjectId, payload),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: tutorId
          ? ["tutorSubjects", tutorId]
          : ["tutorSubjects"],
      });

    //   queryClient.invalidateQueries({
    //     queryKey: [
    //       "tutor-subject",
    //       tutorId,
    //       variables.subjectId,
    //     ],
    //   });
    },
  });
}