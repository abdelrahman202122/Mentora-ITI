import api, { ApiClientError } from "@/lib/axios";
import type { ApiSuccess } from "@/types/apis/api-success";

export interface TutorStats {
  totalHours: number;
  totalSessions: number;
  totalEarnings: number;
  availableBalance: number;
}

export async function getTutorStats(): Promise<TutorStats> {
  try {
    const response = await api.get<ApiSuccess<TutorStats>>(
      "/tutors/me/stats"
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