"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import {
  sendAIChat,
  startAIConversation,
} from "@/services/ai/ai-service";
import type {
  AIConversationMessage,
  AIChatResult,
} from "@/types/ai/ai-types";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Request failed";
}

export function useAIChat(locale: string) {
  const [messages, setMessages] = useState<AIConversationMessage[]>([]);

  const conversationQuery = useQuery({
    queryKey: ["ai-assistant", "conversation", locale],
    queryFn: () =>
      startAIConversation({
        locale,
        goal: "AI assistant chat",
        extractedPreferences: {
          source: "ai_assistant_chat",
        },
      }),
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: Infinity,
  });

  const conversationId = conversationQuery.data?._id;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMessages([]);
  }, [conversationId]);

  const sendMessageMutation = useMutation<
    AIChatResult,
    Error,
    string
  >({
    mutationFn: async (content) => {
      const trimmedContent = content.trim();

      if (!conversationId) {
        throw new Error("AI conversation is not ready yet.");
      }

      if (!trimmedContent) {
        throw new Error("Message is required.");
      }

      return sendAIChat({
        conversationId,
        locale,
        message: trimmedContent,
      });
    },
    onSuccess: (result, content) => {
      const now = new Date().toISOString();
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          _id: `local-user-${now}`,
          conversationId: result.conversationId,
          role: "user",
          content,
          createdAt: now,
          updatedAt: now,
        },
        {
          _id: `local-assistant-${now}`,
          conversationId: result.conversationId,
          role: "assistant",
          content: result.reply,
          metadata: {
            provider: "gemini",
            recommendedTutors: result.recommendedTutors,
          },
          createdAt: now,
          updatedAt: now,
        },
      ]);
    },
  });

  const errorMessage = useMemo(() => {
    if (conversationQuery.error) {
      return getErrorMessage(conversationQuery.error);
    }

    if (sendMessageMutation.error) {
      return getErrorMessage(sendMessageMutation.error);
    }

    return null;
  }, [conversationQuery.error, sendMessageMutation.error]);

  return {
    conversation: conversationQuery.data,
    errorMessage,
    isStarting: conversationQuery.isPending,
    isSending: sendMessageMutation.isPending,
    messages,
    sendMessage: sendMessageMutation.mutateAsync,
  };
}
