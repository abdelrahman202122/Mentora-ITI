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

//example for response
// {
//   "success": true,
//   "message": "Bookings retrieved successfully",
//   "data": {
//     "bookings": [
//       {
//         "_id": "60c72b2f9b1d8b2a1c8b4567",
//         "learnerId": "60c72b2f9b1d8b2a1c8b4568",
//         "tutorId": "60c72b2f9b1d8b2a1c8b4569",
//         "tutorProfileId": "60c72b2f9b1d8b2a1c8b4570",
//         "subjectId": "60c72b2f9b1d8b2a1c8b4571",
//         "startAt": "2026-07-20T10:00:00.000Z",
//         "endAt": "2026-07-20T11:00:00.000Z",
//         "durationMinutes": 60,
//         "price": 150.5,
//         "currency": "EGP",
//         "bookingStatus": "pending",
//         "paymentStatus": "unpaid",
//         "confirmationCode": "A1B2C3",
//         "confirmationCodeUsedAt": "2026-07-20T11:05:00.000Z",
//         "completedAt": "2026-07-20T11:05:00.000Z",
//         "canceledAt": "2026-07-20T09:00:00.000Z",
//         "canceledBy": "learner",
//         "learnerNote": "I would like to focus on calculus basics.",
//         "cancelReason": "Sudden emergency arose.",
//         "paymentId": "60c72b2f9b1d8b2a1c8b4572",
//         "reviewId": "60c72b2f9b1d8b2a1c8b4573",
//         "createdAt": "2026-06-19T00:45:00.000Z",
//         "updatedAt": "2026-06-19T00:46:00.000Z"
//       }
//     ],
//     "pagination": {
//       "page": 1,
//       "limit": 10,
//       "total": 15,
//       "totalPages": 2
//     }
//   }
// }