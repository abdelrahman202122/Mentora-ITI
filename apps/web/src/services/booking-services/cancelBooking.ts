import api, { ApiClientError } from "@/lib/axios";
import type { ApiSuccess } from "@/types/apis/api-success";
import type { Booking } from "@/types/booking/booking-data";

export async function cancelBooking(
  bookingId: string,
  cancelReason: string
): Promise<Booking> {
  try {
    const response = await api.patch<ApiSuccess<Booking>>(
      `/bookings/${bookingId}/cancel`,
      { cancelReason } 
    );

    console.log("Booking ID:", bookingId);
    console.log("New Status:", response.data.data.bookingStatus);

    return response.data.data;
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error("API Error:", error.message);
    }

    throw error;
  }
}