export type PaymentStatus =
  | "unpaid"
  | "pending"
  | "paid"
  | "failed"
  | "refunded";

  export type BookingStatus =
  | "pending"
  | "confirmed"
  | "rejected"
  | "completed"
  | "canceled"
  | "expired";

export interface Booking {
  _id: string;
  learnerId: string;
  tutorId: string;
  tutorProfileId: string;
  subjectId: string;

  startAt: string;
  endAt: string;

  durationMinutes: number;
  price: number;
  currency: string;

  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus

  confirmationCode: string;
  confirmationCodeUsedAt: string | null;

  completedAt: string | null;

  canceledAt: string | null;
  canceledBy: "learner" | "tutor" | "system" | null;

  learnerNote: string | null;
  cancelReason: string | null;

  paymentId: string | null;
  reviewId: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface BookingsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface BookingsData {
  bookings: Booking[];
  pagination: BookingsPagination;
}

export interface GetBookingsResponse {
  success: boolean;
  message: string;
  data: BookingsData;
}