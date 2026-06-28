'use client';

import { useQuery } from '@tanstack/react-query';
import { getBookingById } from '@/services/booking-services/getBookingById';

export function useBooking(bookingId: string) {
  return useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => getBookingById(bookingId),
    enabled: !!bookingId,
  });
}