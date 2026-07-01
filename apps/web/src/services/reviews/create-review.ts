import api from "@/lib/axios";
import type { ApiSuccess } from "@/types/apis/api-success";
import type { Review } from "@/types/reviews/reviews";

export interface CreateReviewPayload {
  bookingId: string;
  rating: number;
  comment?: string;
}

export async function createReview(
  payload: CreateReviewPayload
): Promise<Review> {
  const response = await api.post<ApiSuccess<Review>>("/reviews", payload);
  return response.data.data;
}
