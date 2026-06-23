import api, { ApiClientError } from "@/lib/axios";
import type { ApiSuccess } from "@/types/apis/api-success";
import type { Curriculum } from "@/types/metaData/curriculum";

export async function getCurricula(): Promise<Curriculum[]> {
  try {
    const response = await api.get<ApiSuccess<Curriculum[]>>(
      "/metadata/curricula"
    );

    console.log(
      "Curricula Response:----------------------------------------------",
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