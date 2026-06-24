"use client";

import { useMutation } from "@tanstack/react-query";

import {
  getTutorRecommendations,
  startAIConversation,
} from "@/services/ai/ai-service";
import type {
  TutorRecommendationInput,
  TutorRecommendationResult,
} from "@/types/ai/ai-types";

type FindTutorByAIInput = Omit<TutorRecommendationInput, "conversationId"> & {
  locale?: string;
  goal?: string;
};

export function useFindTutorByAI() {
  return useMutation<TutorRecommendationResult, Error, FindTutorByAIInput>({
    mutationFn: async ({ locale, goal, ...criteria }) => {
      const conversation = await startAIConversation({
        locale,
        goal,
        extractedPreferences: criteria,
      });

      return getTutorRecommendations({
        ...criteria,
        conversationId: conversation._id,
      });
    },
  });
}
