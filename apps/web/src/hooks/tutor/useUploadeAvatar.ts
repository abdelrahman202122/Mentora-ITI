"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadUserAvatar } from "@/services/tutor/postAvatar";

export function useUploadAvatar(tutorId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadUserAvatar,

    onSuccess: () => {
      if (!tutorId) return;

      queryClient.invalidateQueries({
        queryKey: ["tutorProfile", tutorId],
      });
    },
  });
}