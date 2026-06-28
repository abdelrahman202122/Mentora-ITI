import api, { ApiClientError } from "@/lib/axios";
import type { ApiSuccess } from "@/types/apis/api-success";
import type { TutorSubject } from "@/types/tutor/tutor-subject";
import type { CoursePayload } from "@/schemas/subject/subject-schema";

export async function updateTutorSubject(
  subjectId: string,
  payload: CoursePayload
): Promise<TutorSubject> {
  try {
    const response = await api.put<ApiSuccess<TutorSubject>>(
      `/tutors/me/subjects/${subjectId}`,
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