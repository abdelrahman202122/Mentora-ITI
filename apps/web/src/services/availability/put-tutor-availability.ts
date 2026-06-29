import api, { ApiClientError } from "@/lib/axios";
import type { ApiSuccess } from "@/types/apis/api-success";
import type {
  TutorAvailability,
  AvailabilityPayload,
} from "@/types/availability/tutor-availability";

export async function updateTutorAvailability(
  payload: AvailabilityPayload
): Promise<TutorAvailability> {
  try {
    const response = await api.put<ApiSuccess<TutorAvailability>>(
      "/tutors/me/availability",
      payload
    );

    return response.data.data;
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error(error.message);
    }

    throw error;
  }
}