import{ Booking } from "@/types/bookingProcess/booking"


 export async function getMyBookings(): Promise<Booking[]> {
  const response = await fetch("/api/bookings/me", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  })
  const body = await response.json()

  if (!response.ok || !body.success) {
    throw new Error(body.message ?? "Failed to load bookings.")
  }

  // success === true should always come with data.bookings as an array — if
  // it doesn't, the API broke its own contract, and returning anything else
  // here would crash later when the dashboard calls .filter()/.map() on it
  if (!body.data || !Array.isArray(body.data.bookings)) {
    throw new Error("Failed to load bookings.")
  }

  return body.data.bookings
}