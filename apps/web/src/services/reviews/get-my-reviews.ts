import api, { ApiClientError } from "@/lib/axios";
import type { ApiSuccess } from "@/types/apis/api-success";
import type { ReviewsData } from "@/types/reviews/reviews";

export interface GetMyReviewsParams {
  page?: number;
  limit?: number;
}

export async function getMyReviews(
  params?: GetMyReviewsParams
): Promise<ReviewsData> {
  try {
    const response = await api.get<ApiSuccess<ReviewsData>>(
      "/reviews/me",
      {
        params,
      }
    );

    return response.data.data;
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error(error.message);
    }

    throw error;
  }
}