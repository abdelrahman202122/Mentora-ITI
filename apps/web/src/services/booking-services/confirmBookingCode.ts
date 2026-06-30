import api from "@/lib/axios";
import type { ApiSuccess } from "@/types/apis/api-success";
import type { Booking } from "@/types/booking/booking-data";

export async function confirmBookingCode({
  bookingId,
  code,
}: {
  bookingId: string;
  code: string;
}): Promise<Booking> {
  const response = await api.post<ApiSuccess<Booking>>(
    `/bookings/${bookingId}/confirm-code`,
    { code: code.trim() },
  );

  return response.data.data;
}
