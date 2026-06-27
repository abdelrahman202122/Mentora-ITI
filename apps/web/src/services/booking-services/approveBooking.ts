import api, { ApiClientError } from "@/lib/axios";
import type { ApiSuccess } from "@/types/apis/api-success";
import type { Booking } from "@/types/booking/booking-data";

export async function acceptBooking(
  bookingId: string
): Promise<Booking> {
  try {
    const response = await api.patch<ApiSuccess<Booking>>(
      `/bookings/${bookingId}/accept`,
      {}
    );
    return response.data.data;
  } catch (error) {
    throw error;
  }
}
