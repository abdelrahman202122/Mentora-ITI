import type { CreateBookingPayload, BookingResponse, ApiResponse } from "@/types/bookingProcess/booking"

function getDurationMinutes(startAt: string, endAt: string): number {
  const diff = new Date(endAt).getTime() - new Date(startAt).getTime()
  return Math.round(diff / 60_000)
}

function extractErrorMessage(body: ApiResponse<BookingResponse>): string {
  if (body.errors) {
    return Object.values(body.errors).flat().join(" ")
  }
  return body.message ?? "Something went wrong. Please try again."
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

  const response = await fetch("/api/bookings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(requestBody),
  })

  // ✅ generic ApiResponse with BookingResponse as the data type
  const body: ApiResponse<BookingResponse> = await response.json()

  // True HTTP failures (4xx/5xx) — the status code drives the fallback message,
  // but extractErrorMessage still wins when the backend included one for known
  // client-error codes.
  if (!response.ok) {
    switch (response.status) {
      case 400:
      case 401:
      case 403:
      case 409:
        throw new Error(extractErrorMessage(body))
      case 500:
      default:
        throw new Error("Server error. Please try again later.")
    }
  }

  // A 2xx response with `success: false` is a valid envelope, not an HTTP
  // error — the backend's own message/errors are the source of truth here,
  // so they must never be replaced by the generic "Server error" fallback.
  if (!body.success) {
    throw new Error(extractErrorMessage(body))
  }

  if (!body.data) {
    throw new Error("Unexpected response from server.")
  }

  return body.data
}