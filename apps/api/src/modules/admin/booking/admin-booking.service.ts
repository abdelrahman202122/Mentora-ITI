import * as adminBookingRepository from './admin-booking.repository.js';

export async function listBookings(filters: unknown): Promise<unknown> {
  return adminBookingRepository.listBookings(filters);
}
