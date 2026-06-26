
import type { TimeSlot, AvailabilitySlots } from "@/types/bookingProcess/slots"

interface AvailabilityApiResponse {
  success: boolean
  message?: string
  data?: {
    slots: AvailabilitySlots
  }
}

export async function getTutorAvailability(
  tutorId: string
): Promise<AvailabilitySlots> {
  const response = await fetch(`/api/tutors/${tutorId}/availability`, {
    credentials: "include",
  })

  const body: AvailabilityApiResponse = await response.json()

  if (!response.ok || !body.success) {
    throw new Error(body.message ?? "Failed to fetch availability.")
  }

  if (!body.data) {
    throw new Error("Unexpected response from server.")
  }

  return body.data.slots
}