
import api from "@/lib/axios"
import { Booking } from "@/types/bookingProcess/booking"

export async function getMyBookings(): Promise<Booking[]> {
  const response = await api.get("/bookings/me")
  const body = response.data

  if (!body.success) {
    throw new Error(body.message ?? "Failed to load bookings.")
  }

  // success === true should always come with data.bookings as an array —
  // returning anything else would crash later when the dashboard calls
  // .filter()/.map() on it
  if (!body.data || !Array.isArray(body.data.bookings)) {
    throw new Error("Failed to load bookings.")
  }

  return body.data.bookings
}