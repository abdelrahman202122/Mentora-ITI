'use client'

import { useQuery } from '@tanstack/react-query'
import { getMyBookings } from '@/services/booking-services/getMyBooking'

export function useMyBookings() {
  return useQuery({
    queryKey: ['myBookings'],
    queryFn: getMyBookings,
  })
}