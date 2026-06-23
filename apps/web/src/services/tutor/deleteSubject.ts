import api, { ApiClientError } from "@/lib/axios";
import { DeleteTutorSubjectResponse } from "@/types/tutor/DeleteTutorSubjectResponse";


export async function deleteTutorSubject(
  subjectId: string
): Promise<DeleteTutorSubjectResponse> {
  try {
    const response = await api.delete<DeleteTutorSubjectResponse>(
      `/tutors/me/subjects/${subjectId}`
    );


    return response.data;
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error(error.message);
    }

    throw error;
  }
}