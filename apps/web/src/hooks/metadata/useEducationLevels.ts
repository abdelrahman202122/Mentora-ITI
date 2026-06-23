'use client'

import { useQuery } from '@tanstack/react-query'
import { getEducationLevels } from '@/services/metaData/getEducationLevel'

export function useEducationLevels() {
  return useQuery({
    queryKey: ['educationLevels'],
    queryFn: getEducationLevels,
  })
}