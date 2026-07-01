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

    // ✅ validate success envelope before reading data
    if (!response.data.success) {
      throw new Error(response.data.message ?? "Failed to cancel booking.")
    }

    // ✅ confirm data exists before accessing bookingStatus
    if (!response.data.data) {
      throw new Error("Unexpected response from server.")
    }

    return response.data.data;
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error("API Error:", error.message);
    }

    throw error;
  }
}
