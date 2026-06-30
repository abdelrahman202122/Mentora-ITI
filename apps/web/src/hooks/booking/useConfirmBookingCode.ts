"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { confirmBookingCode } from "@/services/booking-services/confirmBookingCode";

export function useConfirmBookingCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: confirmBookingCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myBookings"] });
    },
  });
}
