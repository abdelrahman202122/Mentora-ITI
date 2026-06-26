import{ Booking } from "@/types/bookingProcess/booking"


 export async function getMyBookings(): Promise<Booking[]> {
  const response = await fetch("/api/bookings/me", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  })
  const body = await response.json()
  if (!response.ok || !body.success) throw new Error(body.message ?? "Failed to load bookings.")
  return body.data.bookings
}