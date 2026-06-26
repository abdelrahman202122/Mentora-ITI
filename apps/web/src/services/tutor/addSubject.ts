import api, { ApiClientError } from "@/lib/axios";
import type { ApiSuccess } from "@/types/apis/api-success";
import { TutorSubject } from "@/types/tutor/tutor-subject";
import { CreateSubjectPayload } from "@/types/tutor/subject-payload";
import { CoursePayload } from "@/schemas/subject/subject-schema";

export async function createTutorSubject(
  payload: CoursePayload
): Promise<TutorSubject> {
  try {
    const response = await api.post<ApiSuccess<TutorSubject>>(
      `/tutors/me/subjects`,
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