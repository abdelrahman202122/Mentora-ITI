'use client';

import { useQuery } from '@tanstack/react-query';
import { getMyReviews, type GetMyReviewsParams } from '@/services/reviews/get-my-reviews';

export function useMyReviews(tutorProfileId : string , params?: GetMyReviewsParams , enabled = true) {
  return useQuery({
    queryKey: ['myReviews', params],
    queryFn: () => getMyReviews(tutorProfileId ,params),
    enabled: enabled,
  });
}