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
);    console.log(bookingId)
       console.log(response.data.data.bookingStatus);
console.log(response.data.data.tutorId);
    return response.data.data;
  } catch (error) {
    if (error instanceof ApiClientError) {
          console.log(error.name);
          console.log(error.cause)
      console.error(error.message);
            console.error(error.details);
                  console.error(error.status);
                        console.error(error.stack);



    }

    throw error;
  }
}