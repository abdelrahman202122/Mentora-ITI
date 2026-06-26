export async function cancelBooking(bookingId: string, cancelReason: string): Promise<void> {
  const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ cancelReason }),
  })

  const body = await response.json()

  if (!response.ok || !body.success) {
    throw new Error(body.message ?? "Failed to cancel booking.")
  }
}