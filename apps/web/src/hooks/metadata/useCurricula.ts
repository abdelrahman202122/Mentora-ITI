'use client'

import { useQuery } from '@tanstack/react-query'
import { getCurricula } from '@/services/metaData/getCurriculam'

export function useCurricula() {
  return useQuery({
    queryKey: ['curricula'],
    queryFn: getCurricula,
  })
}