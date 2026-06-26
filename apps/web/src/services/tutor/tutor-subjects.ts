import api, { ApiClientError } from "@/lib/axios";
import type { TutorSubject } from "@/types/tutor/tutor-subject";
import type { ApiSuccess } from "@/types/apis/api-success";


export async function getTutorSubjects(
  tutorId: string
): Promise<TutorSubject[]> {
  try {
    const response = await api.get<ApiSuccess<TutorSubject[]>>(
      `/tutors/${tutorId}/subjects`
    );

    console.log(
      response.data
    );

    return response.data.data;
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error(error.message);
    }

    throw error;
  }
}
