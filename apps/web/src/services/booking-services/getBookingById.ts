import api, { ApiClientError } from "@/lib/axios";
import type { ApiSuccess } from "@/types/apis/api-success";
import type { Booking } from "@/types/booking/booking-data";

export async function getBookingById(
  bookingId: string
): Promise<Booking> {
  try {
    const response = await api.get<ApiSuccess<Booking>>(
      `/bookings/${bookingId}`
    );

    return response.data.data;
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error(error.message);
    }

    throw error;
  }
}