"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTutorProfile } from "@/services/tutor/patchProfile";

export function useUpdateTutorProfile(tutorId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTutorProfile,

onSuccess: () => {
  if (!tutorId) return;

  queryClient.invalidateQueries({
    queryKey: ["tutorProfile", tutorId],
  });

  queryClient.invalidateQueries({
    queryKey: ["auth", "current-user"],
  });
},
  });
}