'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { acceptBooking } from '@/services/booking-services/approveBooking'

export function useAcceptBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (bookingId: string) =>
      acceptBooking(bookingId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['myBookings'],
      })
    },
  })
}