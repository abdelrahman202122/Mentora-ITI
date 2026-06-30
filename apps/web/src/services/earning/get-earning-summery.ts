import api, { ApiClientError } from "@/lib/axios";
import type { ApiSuccess } from "@/types/apis/api-success";
import type { EarningsSummary } from "@/types/earning/earnings-summary";

export async function getEarningsSummary(): Promise<EarningsSummary> {
  try {
    const response = await api.get<ApiSuccess<EarningsSummary>>(
      `/earnings/summary`
    );
    console.log(response.data.data)
    return response.data.data;
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error(error.message);
    }
    throw error;
  }
}