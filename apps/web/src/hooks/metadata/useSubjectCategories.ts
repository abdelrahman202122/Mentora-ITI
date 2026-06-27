'use client'

import { useQuery } from '@tanstack/react-query'
import { getCategories } from '@/services/metaData/getSubjectsCategories'

export function useSubjectCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })
}