// 'use client';

// import { useQuery } from '@tanstack/react-query';
// import { getMyEarnings } from '@/services/earning/getMyEarning';

// export function useMyEarnings() {
//   return useQuery({
//     queryKey: ['myEarnings'],
//     queryFn: getMyEarnings,
//   });
// }
'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getMyEarnings,
  type EarningStatus,
} from '@/services/earning/getMyEarning';

interface UseMyEarningsProps {
  status?: EarningStatus;
  limit?: number;
  page?: number;
}

export function useMyEarnings(params?: UseMyEarningsProps) {
  return useQuery({
    queryKey: ['myEarnings', params],
    queryFn: () => getMyEarnings(params),
  });
}