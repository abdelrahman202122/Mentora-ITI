
import api from "@/lib/axios"
import type { AvailabilitySlots } from "@/types/bookingProcess/slots"
import type { ApiResponse } from "@/types/bookingProcess/booking"

const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const

function isValidAvailabilitySlots(value: unknown): value is AvailabilitySlots {
  if (typeof value !== "object" || value === null) return false
  return DAYS.every((day) => Array.isArray((value as Record<string, unknown>)[day]))
}

export async function getTutorAvailability(
  tutorId: string
): Promise<AvailabilitySlots> {
  const response = await api.get<ApiResponse<{ slots: AvailabilitySlots }>>(
    `/tutors/${tutorId}/availability`
  )
  const body = response.data

  if (!body.success) {
    throw new Error(body.message ?? "Failed to fetch availability.")
  }

  if (!body.data || !isValidAvailabilitySlots(body.data.slots)) {
    throw new Error("Unexpected response from server.")
  }

  return body.data.slots
}