'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { rejectBooking } from '@/services/booking-services/rejectBooking'

export function useRejectBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (bookingId: string) =>
      rejectBooking(bookingId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['myBookings'],
      })
    },
  })
}