"use client";

import { useQuery } from "@tanstack/react-query";
import { getTutorStats } from "@/services/tutor/getTutorStats";

export function useTutorStats() {
  return useQuery({
    queryKey: ["tutorStats"],
    queryFn: getTutorStats,
  });
}