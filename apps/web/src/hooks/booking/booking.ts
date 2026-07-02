'use client'

import { useQuery } from '@tanstack/react-query'
import {
  getLearnerBookings,
  getMyBookings,
  getTutorBookings,
  type BookingStatus,
} from '@/services/booking-services/getMyBooking'

interface UseMyBookingsProps {
  bookingStatus?: BookingStatus
  limit?: number
  mode?: "learner" | "tutor" | "admin";
  page?: number;
}

export function useMyBookings(params?: UseMyBookingsProps) {
  return useQuery({
    queryKey: ['myBookings', params],
    queryFn: () => getMyBookings(params),
  })
}

type UseRoleBookingsProps = Omit<UseMyBookingsProps, 'mode'>

export function useLearnerBookings(params?: UseRoleBookingsProps) {
  return useQuery({
    queryKey: ['myBookings', 'learner', params],
    queryFn: () => getLearnerBookings(params),
  })
}

export function useTutorBookings(params?: UseRoleBookingsProps) {
  return useQuery({
    queryKey: ['myBookings', 'tutor', params],
    queryFn: () => getTutorBookings(params),
  })
}
