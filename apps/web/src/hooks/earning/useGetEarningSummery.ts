"use client";

import { useQuery } from "@tanstack/react-query";
import { getEarningsSummary } from "@/services/earning/get-earning-summery";

export function useEarningsSummary() {
  return useQuery({
    queryKey: ["earningsSummary"],
    queryFn: getEarningsSummary,
  });
}