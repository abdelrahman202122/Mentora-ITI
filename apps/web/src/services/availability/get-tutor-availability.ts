
import api, { ApiClientError } from "@/lib/axios";
import type { ApiSuccess } from "@/types/apis/api-success";
import type { TutorAvailability } from "@/types/availability/tutor-availability";

export async function getTutorAvailability(
  tutorId: string
): Promise<TutorAvailability> {
  try {
    const response = await api.get<ApiSuccess<TutorAvailability>>(
      `/tutors/${tutorId}/availability`
    );

    return response.data.data;
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error(error.message);
    }

    throw error;
  }
}