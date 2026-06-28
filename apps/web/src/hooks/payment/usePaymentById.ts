'use client';

import { useQuery } from '@tanstack/react-query';
import { getPaymentById } from '@/services/payment/getPaymentByID';

export function usePaymentById(paymentId: string) {
  return useQuery({
    queryKey: ['payment', paymentId],
    queryFn: () => getPaymentById(paymentId),
    enabled: !!paymentId,
  });
}