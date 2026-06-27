'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cancelBooking } from '@/services/booking-services/cancelBooking'

export function useCancelBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (bookingId: string) =>
      cancelBooking(bookingId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['myBookings'],
      })
    },
  })
}