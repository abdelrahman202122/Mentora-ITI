'use client';

import { useQuery } from '@tanstack/react-query';
import { getMyReviews, type GetMyReviewsParams } from '@/services/reviews/get-my-reviews';

export function useMyReviews(params?: GetMyReviewsParams) {
  return useQuery({
    queryKey: ['myReviews', params],
    queryFn: () => getMyReviews(params),
    enabled: true,
  });
}