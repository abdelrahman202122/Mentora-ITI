export interface CreateBookingPayload {
  tutorProfileId: string
  subjectId: string
  startTime: string
  endTime: string
  learnerNote?: string
}

// ✅ shared status types — single source of truth for both Booking and BookingDetails
export type BookingStatus = "pending" | "confirmed" | "completed" | "canceled" | "rejected" | "expired"
export type PaymentStatus = "unpaid" | "paid" | "pending" | "failed" | "refunded"

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
  bookingStatus: BookingStatus 
  paymentStatus: PaymentStatus 
  confirmationCode?: string
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
  bookingStatus: BookingStatus
  paymentStatus: PaymentStatus
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
  bookingStatus: BookingStatus
  paymentStatus: PaymentStatus
  confirmationCode?: string
  learnerNote?: string | null
  cancelReason?: string | null
  canceledBy?: string | null
  canceledAt?: string | null
  completedAt?: string | null
  reviewId?: string | null
  createdAt: string
  updatedAt: string
}
