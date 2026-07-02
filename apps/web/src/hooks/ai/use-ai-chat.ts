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

type StoredAIChat = {
  conversationId: string;
  messages: AIConversationMessage[];
};

function getStorageKey(locale: string) {
  return `mentora:ai-assistant:${locale}`;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Request failed";
}

function readStoredChat(locale: string): StoredAIChat | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.sessionStorage.getItem(getStorageKey(locale));

    if (!rawValue) {
      return null;
    }

    const parsed = JSON.parse(rawValue) as Partial<StoredAIChat>;

    if (
      typeof parsed.conversationId !== "string" ||
      !Array.isArray(parsed.messages)
    ) {
      return null;
    }

    return {
      conversationId: parsed.conversationId,
      messages: parsed.messages.filter(
        (message): message is AIConversationMessage =>
          !!message &&
          typeof message === "object" &&
          typeof message._id === "string" &&
          typeof message.conversationId === "string" &&
          typeof message.content === "string"
      ),
    };
  } catch {
    return null;
  }
}

function writeStoredChat(locale: string, chat: StoredAIChat) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(getStorageKey(locale), JSON.stringify(chat));
  } catch {
    // If browser storage is unavailable, the chat still works for this mount.
  }
}

export function useAIChat(locale: string) {
  const [storedConversationId] = useState<string | null>(
    () => readStoredChat(locale)?.conversationId ?? null
  );
  const [messages, setMessages] = useState<AIConversationMessage[]>(
    () => readStoredChat(locale)?.messages ?? []
  );

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
    enabled: !storedConversationId,
  });

  const conversationId = storedConversationId ?? conversationQuery.data?._id;

  useEffect(() => {
    if (!conversationId) {
      return;
    }

    writeStoredChat(locale, {
      conversationId,
      messages,
    });
  }, [conversationId, locale, messages]);

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
