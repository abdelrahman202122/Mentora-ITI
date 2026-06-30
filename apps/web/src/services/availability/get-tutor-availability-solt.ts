import api, { ApiClientError } from "@/lib/axios";
import type { ApiSuccess } from "@/types/apis/api-success";
import { DailyAvailability } from "@/types/availability/tutor-availability";
// import type { TutorAvailabilitySlots } from "@/types/availability/tutor-availability";
export interface TutorAvailabilitySlots {
  tutorId: string;
  startDate: string;
  endDate: string;
  availability: DailyAvailability[];
}
export async function getTutorAvailabilitySlots(
  tutorId: string,
  startDate: string,
  endDate: string
): Promise<TutorAvailabilitySlots> {
  try {
    const response = await api.get<ApiSuccess<TutorAvailabilitySlots>>(
      `/tutors/${tutorId}/availability/slots`,
      {
        params: { startDate, endDate },
      }
    );

    return response.data.data;
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error(error.message);
    }

    throw error;
  }
}