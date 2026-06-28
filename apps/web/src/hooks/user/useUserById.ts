'use client';

import { useQuery } from '@tanstack/react-query';
import { getPublicUser } from '@/services/user/getUserById';

export function usePublicUserById(userId: string) {
  return useQuery({
    queryKey: ['publicUser', userId],
    queryFn: () => getPublicUser(userId),
    enabled: !!userId,
  });
}