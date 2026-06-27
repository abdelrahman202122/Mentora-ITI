import api, { ApiClientError } from "@/lib/axios";
import type { ApiSuccess } from "@/types/apis/api-success";
import type {  BookingsData } from "@/types/booking/booking-data";

export async function getMyBookings(): Promise<BookingsData> {
  try {
    const response = await api.get<
      ApiSuccess<BookingsData>
    >("/bookings/me");

    return response.data.data;
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error(error.message);
    }

    throw error;
  }
}