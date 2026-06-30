"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import {
  sendAIConversationMessage,
  startAIConversation,
} from "@/services/ai/ai-service";
import type {
  AIConversationMessage,
  SendAIConversationMessageResult,
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
    SendAIConversationMessageResult,
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

      return sendAIConversationMessage(conversationId, {
        content: trimmedContent,
        metadata: {
          source: "ai_assistant_chat",
        },
      });
    },
    onSuccess: (result) => {
      setMessages((currentMessages) => [
        ...currentMessages,
        result.userMessage,
        result.assistantMessage,
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
