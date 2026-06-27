import api, { ApiClientError } from "@/lib/axios";
import type { ApiSuccess } from "@/types/apis/api-success";
import type { EarningsData } from "@/types/earning/earningData";

export async function getMyEarnings(): Promise<EarningsData> {
  try {
    const response = await api.get<ApiSuccess<EarningsData>>(
      "/earnings/me"
    );

    return response.data.data;
  } catch (error) {
    if (error instanceof ApiClientError) {
          console.error("getMyEarnings error:", error); // what does this print?

      console.error(error.message);
    }

    throw error;
  }
}