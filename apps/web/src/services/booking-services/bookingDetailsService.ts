import{ BookingDetails } from "@/types/bookingProcess/booking"

export async function getBookingById(bookingId: string): Promise<BookingDetails> {
  const response = await fetch(`/api/bookings/${bookingId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  })

  const body = await response.json()

  if (!response.ok || !body.success) {
    throw new Error(body.message ?? "Failed to load booking details.")
  }

  return body.data
}