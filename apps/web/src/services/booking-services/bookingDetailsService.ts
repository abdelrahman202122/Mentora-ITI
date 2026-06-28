
import api from "@/lib/axios"
import { BookingDetails } from "@/types/bookingProcess/booking"

export async function getBookingById(bookingId: string): Promise<BookingDetails> {
  // 4xx/5xx are thrown automatically by the shared client's interceptor
  const response = await api.get(`/bookings/${bookingId}`)
  const body = response.data

  if (!body.success) {
    throw new Error(body.message ?? "Failed to load booking details.")
  }

  // success === true should always come with data — if it doesn't, the API
  // broke its own contract
  if (!body.data) {
    throw new Error("Unexpected response from server: booking details are missing.")
  }

  return body.data
}