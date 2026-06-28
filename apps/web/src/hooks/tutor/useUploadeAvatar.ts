"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadUserAvatar } from "@/services/tutor/postAvatar";
import { authKeys } from "@/hooks/auth/use-auth";

export function useUploadAvatar(tutorId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadUserAvatar,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: authKeys.currentUser,
      });

      if (!tutorId) return;

      await queryClient.invalidateQueries({
        queryKey: ["tutorProfile", tutorId],
      });
    },
  });
}
// export function useUploadAvatar(tutorId: string | undefined) {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: uploadUserAvatar,

//     onSuccess: () => {
//       if (!tutorId) return;

//       queryClient.invalidateQueries({
//         queryKey: ["tutorProfile", tutorId],
//       });
//     },
//   });
// }