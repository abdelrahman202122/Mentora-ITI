import api, { ApiClientError } from "@/lib/axios";
import type { ApiSuccess } from "@/types/apis/api-success";
import type { Booking } from "@/types/booking/booking-data";

export async function rejectBooking(
  bookingId: string
): Promise<Booking> {
  try {
    const response = await api.patch<ApiSuccess<Booking>>(
      `/bookings/${bookingId}/reject`,
      {}
    );

    console.log(bookingId);
    console.log(response.data.data.bookingStatus);
    console.log(response.data.data.tutorId);

    return response.data.data;
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error(error.message);
    }

    throw error;
  }
}