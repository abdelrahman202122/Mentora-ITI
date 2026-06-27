export interface CreateBookingPayload {
  tutorProfileId: string
  subjectId: string
  startTime: string
  endTime: string
  learnerNote?: string
}

export interface Booking {
  _id: string
  tutorId: string
  tutorProfileId: string
  subjectId: string
  startAt: string
  endAt: string
  durationMinutes: number
  price: number
  currency: string
  bookingStatus: "pending" | "confirmed" | "completed" | "canceled"
  paymentStatus: "unpaid" | "paid"
}

export interface BookingResponse {
  _id: string
  learnerId: string
  tutorId: string
  tutorProfileId: string
  subjectId: string
  startAt: string
  endAt: string
  durationMinutes: number
  price: number
  currency: string
  bookingStatus: "pending" | "confirmed" | "completed" | "canceled"
  paymentStatus: "unpaid" | "paid"
  confirmationCode: string
  learnerNote?: string
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  errors?: Record<string, string[]>
}

export interface BookingDetails {
  _id: string
  learnerId: string
  tutorId: string
  tutorProfileId: string
  subjectId: string
  startAt: string
  endAt: string
  durationMinutes: number
  price: number
  currency: string
  bookingStatus: "pending" | "confirmed" | "completed" | "canceled"
  paymentStatus: "unpaid" | "paid"
  confirmationCode?: string
  learnerNote?: string
  cancelReason?: string
  canceledBy?: string
  canceledAt?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}