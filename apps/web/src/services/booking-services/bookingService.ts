
import api from "@/lib/axios"
import type { CreateBookingPayload, BookingResponse, ApiResponse } from "@/types/bookingProcess/booking"

function getDurationMinutes(startAt: string, endAt: string): number {
  const diff = new Date(endAt).getTime() - new Date(startAt).getTime()
  return Math.round(diff / 60_000)
}

function extractErrorMessage(body: ApiResponse<BookingResponse>): string {
  // ✅ guard against empty errors object or arrays that flatten to nothing
  if (body.errors) {
    const message = Object.values(body.errors).flat().filter(Boolean).join(" ").trim()
    if (message.length > 0) return message
  }
  return body.message?.trim() || "Something went wrong. Please try again."
}

export async function createBooking(payload: CreateBookingPayload): Promise<BookingResponse> {
  const requestBody = {
    tutorProfileId: payload.tutorProfileId,
    subjectId: payload.subjectId,
    startAt: payload.startTime,
    endAt: payload.endTime,
    durationMinutes: getDurationMinutes(payload.startTime, payload.endTime),
    ...(payload.learnerNote ? { learnerNote: payload.learnerNote } : {}),
  }

  const response = await api.post<ApiResponse<BookingResponse>>("/bookings", requestBody)
  const body = response.data

  if (!body.success) {
    throw new Error(extractErrorMessage(body))
  }

  if (!body.data) {
    throw new Error("Unexpected response from server.")
  }

  return body.data
}