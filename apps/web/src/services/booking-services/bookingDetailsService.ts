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

  // success === true should always come with data — if it doesn't, the API
  // broke its own contract, and silently returning undefined here would let
  // bad data flow downstream typed as a valid BookingDetails
  if (!body.data) {
    throw new Error("Unexpected response from server: booking details are missing.")
  }

  return body.data
}