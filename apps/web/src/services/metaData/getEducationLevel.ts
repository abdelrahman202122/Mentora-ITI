import api, { ApiClientError } from "@/lib/axios";
import type { ApiSuccess } from "@/types/apis/api-success";
import type { EducationLevel } from "@/types/metaData/educationLevel";

export async function getEducationLevels(): Promise<EducationLevel[]> {
  try {
    const response = await api.get<ApiSuccess<EducationLevel[]>>(
      "/metadata/education-levels"
    );

    console.log(
      "Education Levels Response:----------------------------------------------",
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