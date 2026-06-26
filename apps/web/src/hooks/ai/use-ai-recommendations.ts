"use client";

import { useMutation } from "@tanstack/react-query";

import {
  getTutorRecommendations,
  sendAIConversationMessage,
  startAIConversation,
} from "@/services/ai/ai-service";
import type {
  TutorRecommendationInput,
  TutorRecommendationFlowResult,
} from "@/types/ai/ai-types";

type FindTutorByAIInput = Omit<TutorRecommendationInput, "conversationId"> & {
  locale?: string;
  goal?: string;
};

export function useFindTutorByAI() {
  return useMutation<TutorRecommendationFlowResult, Error, FindTutorByAIInput>({
    mutationFn: async ({ locale, goal, ...criteria }) => {
      const trimmedGoal = goal?.trim();
      const conversation = await startAIConversation({
        locale,
        goal: trimmedGoal || undefined,
        extractedPreferences: criteria,
      });
      const messageResult = trimmedGoal
        ? await sendAIConversationMessage(conversation._id, {
            content: trimmedGoal,
            metadata: {
              source: "ai_tutor_finder",
            },
          })
        : undefined;
      const recommendations = await getTutorRecommendations({
        ...criteria,
        conversationId: conversation._id,
      });

      return {
        ...recommendations,
        conversation,
        userMessage: messageResult?.userMessage,
        assistantMessage: messageResult?.assistantMessage,
      };
    },
  });
}
