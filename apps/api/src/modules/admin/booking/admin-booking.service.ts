import * as adminBookingRepository from './admin-booking.repository.js';
import type { AdminBookingListQuery } from './admin-booking.validation.js';

export async function listBookings(
  filters: AdminBookingListQuery,
): Promise<unknown> {
  return adminBookingRepository.listBookings(filters);
}
