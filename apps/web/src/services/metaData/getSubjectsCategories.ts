import api, { ApiClientError } from "@/lib/axios";
import type { ApiSuccess } from "@/types/apis/api-success";
import type { Category } from "@/types/metaData/category";

export async function getCategories(): Promise<Category[]> {
  try {
    const response = await api.get<ApiSuccess<Category[]>>(
      "/metadata/categories"
    );

    console.log(
      "Categories Response:----------------------------------------------",
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