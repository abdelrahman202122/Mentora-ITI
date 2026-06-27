import type { AvailabilitySlots } from "@/types/bookingProcess/slots"
import type { ApiResponse } from "@/types/bookingProcess/booking"

const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const

// shape-checks the slots object so downstream weekday lookups (slots[dayName])
// never run against something that merely looks like an object — every day
// key must exist and hold an array, even if that array is empty
function isValidAvailabilitySlots(value: unknown): value is AvailabilitySlots {
  if (typeof value !== "object" || value === null) return false
  return DAYS.every((day) => Array.isArray((value as Record<string, unknown>)[day]))
}

export async function getTutorAvailability(
  tutorId: string
): Promise<AvailabilitySlots> {
  const response = await fetch(`/api/tutors/${tutorId}/availability`, {
    credentials: "include",
  })

  const body: ApiResponse<{ slots: AvailabilitySlots }> = await response.json()

  if (!response.ok || !body.success) {
    throw new Error(body.message ?? "Failed to fetch availability.")
  }

  // success === true should always come with data.slots in the
  // { sunday: TimeSlot[], monday: TimeSlot[], ... } shape — if it's missing
  // or malformed, returning it as-is would let an invalid value flow into
  // the weekday lookup (slots[dayName]) in the booking page and crash there
  // instead of failing loudly at the source
  if (!body.data || !isValidAvailabilitySlots(body.data.slots)) {
    throw new Error("Unexpected response from server.")
  }

  return body.data.slots
}