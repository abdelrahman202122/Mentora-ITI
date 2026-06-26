"use client";

import { useMutation } from "@tanstack/react-query";

import {
  getTutorRecommendations,
  sendAIConversationMessage,
  startAIConversation,
} from "@/services/ai/ai-service";
import type {
  SendAIConversationMessageResult,
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

      let messageResult: SendAIConversationMessageResult | undefined;

      if (trimmedGoal) {
        try {
          messageResult = await sendAIConversationMessage(conversation._id, {
            content: trimmedGoal,
            metadata: {
              source: "ai_tutor_finder",
            },
          });
        } catch (error) {
          console.error("Failed to send AI conversation message", {
            conversationId: conversation._id,
            error,
          });
        }
      }

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
