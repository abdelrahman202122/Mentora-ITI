'use client';

import { useQuery } from '@tanstack/react-query';
import { getMyEarnings } from '@/services/earning/getMyEarning';

export function useMyEarnings() {
  return useQuery({
    queryKey: ['myEarnings'],
    queryFn: getMyEarnings,
  });
}