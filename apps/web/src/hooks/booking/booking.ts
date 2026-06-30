// 'use client'

// import { useQuery } from '@tanstack/react-query'
// import { getMyBookings } from '@/services/booking-services/getMyBooking'

// export function useMyBookings() {
//   return useQuery({
//     queryKey: ['myBookings'],
//     queryFn: getMyBookings,
//   })
// }
'use client'

import { useQuery } from '@tanstack/react-query'
import {
  getMyBookings,
  type BookingStatus,
} from '@/services/booking-services/getMyBooking'

interface UseMyBookingsProps {
  bookingStatus?: BookingStatus
  limit?: number
  page?: number;
}

export function useMyBookings(params?: UseMyBookingsProps) {
  return useQuery({
    queryKey: ['myBookings', params],
    queryFn: () => getMyBookings(params),
  })
}