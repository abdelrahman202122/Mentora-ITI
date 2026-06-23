"use client";

import { useCallback, useEffect, useState } from "react";
import type { InfiniteData } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

import { getChatSocket } from "@/services/chat/chat-socket";
import type {
  ChatMessage,
  MessageListData,
  NewMessagePayload,
} from "@/types/chat/chat-types";

import { chatKeys } from "./use-chat";

type ConnectionStatus = "connecting" | "connected" | "disconnected";

function toChatMessage(payload: NewMessagePayload): ChatMessage {
  return {
    id: payload.id,
    chatId: payload.chatId,
    senderId: payload.senderId,
    recipientId: payload.recipientId,
    type: "text",
    content: payload.content,
    status: payload.status,
    deliveredAt: null,
    readAt: null,
    createdAt: payload.createdAt,
    updatedAt: payload.createdAt,
  };
}

function appendMessageToCache(
  currentData: InfiniteData<MessageListData, number> | undefined,
  payload: NewMessagePayload
) {
  if (!currentData?.pages.length) {
    return currentData;
  }

  if (
    currentData.pages.some((page) =>
      page.messages.some((message) => message.id === payload.id)
    )
  ) {
    return currentData;
  }

  const message = toChatMessage(payload);
  const lastPageIndex = currentData.pages.length - 1;

  return {
    ...currentData,
    pages: currentData.pages.map((page, index) =>
      index === lastPageIndex
        ? {
            ...page,
            messages: [...page.messages, message],
            pagination: {
              ...page.pagination,
              total: page.pagination.total + 1,
            },
          }
        : page
    ),
  };
}

export function useChatSocket(chatId: string) {
  const queryClient = useQueryClient();
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("connecting");
  const [error, setError] = useState<string | null>(null);

  const addMessageToCache = useCallback(
    (payload: NewMessagePayload) => {
      queryClient.setQueryData<InfiniteData<MessageListData, number>>(
        chatKeys.messageList(payload.chatId),
        (currentData) => appendMessageToCache(currentData, payload)
      );
      void queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
    },
    [queryClient]
  );

  useEffect(() => {
    if (!chatId) {
      return;
    }

    const socket = getChatSocket();

    function joinChat() {
      setConnectionStatus("connected");
      setError(null);
      socket.emit("chat:join", { chatId }, (response) => {
        if (!response.ok) {
          setError(response.error);
        }
      });
    }

    function handleNewMessage(payload: NewMessagePayload) {
      if (payload.chatId === chatId) {
        addMessageToCache(payload);
      }
    }

    function handleChatError(payload: { message: string }) {
      setError(payload.message);
    }

    function handleConnectError(connectError: Error) {
      setConnectionStatus("disconnected");
      setError(connectError.message);
    }

    function handleDisconnect() {
      setConnectionStatus("disconnected");
    }

    socket.on("connect", joinChat);
    socket.on("disconnect", handleDisconnect);
    socket.on("message:new", handleNewMessage);
    socket.on("chat:error", handleChatError);
    socket.on("connect_error", handleConnectError);

    if (socket.connected) {
      window.setTimeout(joinChat, 0);
    } else {
      socket.connect();
    }

    return () => {
      socket.emit("chat:leave", { chatId });
      socket.off("connect", joinChat);
      socket.off("disconnect", handleDisconnect);
      socket.off("message:new", handleNewMessage);
      socket.off("chat:error", handleChatError);
      socket.off("connect_error", handleConnectError);
    };
  }, [addMessageToCache, chatId]);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmedContent = content.trim();

      if (!trimmedContent) {
        return;
      }

      const socket = getChatSocket();

      if (!socket.connected) {
        throw new Error("Chat socket is not connected");
      }

      const payload = await new Promise<NewMessagePayload>((resolve, reject) => {
        socket.emit(
          "message:send",
          { chatId, content: trimmedContent },
          (response) => {
            if (response.ok) {
              resolve(response.data);
              return;
            }

            reject(new Error(response.error));
          }
        );
      });

      addMessageToCache(payload);
    },
    [addMessageToCache, chatId]
  );

  return {
    connectionStatus,
    error,
    isConnected: connectionStatus === "connected",
    sendMessage,
  };
}
