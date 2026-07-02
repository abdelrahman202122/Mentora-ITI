import api, { ApiClientError } from "@/lib/axios";
import type { ApiSuccess } from "@/types/apis/api-success";
import type { BookingsData } from "@/types/booking/booking-data";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "rejected"
  | "completed"
  | "canceled"
  | "expired";

type BookingMode = "learner" | "tutor" | "admin";

interface GetMyBookingsParams {
  bookingStatus?: BookingStatus;
  limit?: number;
  mode?: BookingMode;
  page?: number;
}

export async function getMyBookings(
  params?: GetMyBookingsParams,
): Promise<BookingsData> {
  try {
    const response = await api.get<ApiSuccess<BookingsData>>("/bookings/me", {
      params,
    });

    return response.data.data;
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error(error.message);
    }

    throw error;
  }
}

type GetRoleBookingsParams = Omit<GetMyBookingsParams, "mode">;

export function getLearnerBookings(
  params?: GetRoleBookingsParams,
): Promise<BookingsData> {
  return getMyBookings({ ...params, mode: "learner" });
}

export function getTutorBookings(
  params?: GetRoleBookingsParams,
): Promise<BookingsData> {
  return getMyBookings({ ...params, mode: "tutor" });
}
