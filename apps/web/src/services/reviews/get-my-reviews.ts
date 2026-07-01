import api, { ApiClientError } from "@/lib/axios";
import type { ApiSuccess } from "@/types/apis/api-success";
import type { ReviewsData } from "@/types/reviews/reviews";

export interface GetMyReviewsParams {
  page?: number;
  limit?: number;
}

export async function getMyReviews(tutorProfileId : string ,
  params?: GetMyReviewsParams
): Promise<ReviewsData> {
  try {
    const response = await api.get<ApiSuccess<ReviewsData>>(
      `/reviews/tutors/${tutorProfileId}`,
      {
        params,
      }
    );
    console.log(response.data.data)
    return response.data.data;
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.log("Message:", error.message);
    console.log("Status:", error.status);
    console.log("cause:", error.cause);
    console.log("details Data:", error.details);
    console.log("stack Config:", error.stack);
    }

    throw error;
  }
}