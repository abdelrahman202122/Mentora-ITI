
import type { CreateBookingPayload, BookingResponse, ApiResponse } from "@/types/bookingProcess/booking"

function getDurationMinutes(startAt: string, endAt: string): number {
  const diff = new Date(endAt).getTime() - new Date(startAt).getTime()
  return Math.round(diff / 60_000)
}

//---------------Extract error from server in a readable format to the user----------------

function extractErrorMessage(body: ApiResponse): string {
  if (body.errors) {
    return Object.values(body.errors).flat().join(" ")
    //i want only the values from the errors object not the keys so i used objects.values() it will return an array of the values
    //.flat()is used to remove the inner arrays and make it into  a single array
    //.join is used to join the array into a string within aspace between each value so the user can read it easily
  }
  
  return body.message ?? "Something went wrong. Please try again."
}
//-------------------------------------------------------------------------------------------

//------------------------Craete booking----------------------------------------------------
export async function createBooking(payload: CreateBookingPayload): Promise<BookingResponse> {
  const requestBody = {
    tutorProfileId: payload.tutorProfileId,
    subjectId: payload.subjectId,
    startAt: payload.startTime,
    endAt: payload.endTime,
    durationMinutes: getDurationMinutes(payload.startTime, payload.endTime),
    ...(payload.learnerNote ? { learnerNote: payload.learnerNote } : {}),
    //with spread operator it will only add the learnerNode property to the requestbody object if it has avalue inside it if not have avalue will be removed
  }

  const response = await fetch("/api/bookings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(requestBody),
  })

  const body: ApiResponse = await response.json()

  if (!response.ok || !body.success) {
    switch (response.status) {
      case 400:
        throw new Error(extractErrorMessage(body))
      case 401:
        throw new Error(extractErrorMessage(body))
      case 403:
        throw new Error(extractErrorMessage(body))
      case 409:   
        throw new Error(extractErrorMessage(body))
      case 500:
      default:
        throw new Error("Server error. Please try again later.")
    }
  }

  if (!body.data) {
    throw new Error("Unexpected response from server.")
  }

  return body.data
}