"use client";

import { useCallback, useEffect, useState } from "react";
import type { InfiniteData } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

import { getChatSocket } from "@/services/chat/chat-socket";
import type {
  Chat,
  ChatListData,
  ChatMessage,
  MessageListData,
  MessageReceiptPayload,
  NewMessagePayload,
} from "@/types/chat/chat-types";

import { chatKeys } from "./use-chat";

type ConnectionStatus = "connecting" | "connected" | "disconnected";
const MESSAGE_SEND_TIMEOUT_MS = 8000;
const MESSAGE_RECEIPT_TIMEOUT_MS = 8000;

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

function updateMessageReceiptInCache(
  currentData: InfiniteData<MessageListData, number> | undefined,
  payload: MessageReceiptPayload
) {
  if (!currentData?.pages.length) {
    return currentData;
  }

  return {
    ...currentData,
    pages: currentData.pages.map((page) => ({
      ...page,
      messages: page.messages.map((message) =>
        message.id === payload.id
          ? {
              ...message,
              status: payload.status,
              deliveredAt: payload.deliveredAt,
              readAt: payload.readAt,
            }
          : message
      ),
    })),
  };
}

function updateChatListLastMessageInCache(
  currentData: InfiniteData<ChatListData, number> | undefined,
  payload: NewMessagePayload
) {
  if (!currentData?.pages.length) {
    return currentData;
  }

  return {
    ...currentData,
    pages: currentData.pages.map((page) => ({
      ...page,
      chats: page.chats.map((chat) =>
        chat.id === payload.chatId
          ? {
              ...chat,
              lastMessage: {
                id: payload.id,
                senderId: payload.senderId,
                preview: payload.content,
                sentAt: payload.createdAt,
              },
              updatedAt: payload.createdAt,
            }
          : chat
      ),
    })),
  };
}

function updateChatDetailLastMessageInCache(
  currentChat: Chat | undefined,
  payload: NewMessagePayload
) {
  if (!currentChat || currentChat.id !== payload.chatId) {
    return currentChat;
  }

  return {
    ...currentChat,
    lastMessage: {
      id: payload.id,
      senderId: payload.senderId,
      preview: payload.content,
      sentAt: payload.createdAt,
    },
    updatedAt: payload.createdAt,
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
      queryClient.setQueriesData<InfiniteData<ChatListData, number>>(
        { queryKey: chatKeys.lists() },
        (currentData) => updateChatListLastMessageInCache(currentData, payload)
      );
      queryClient.setQueryData<Chat>(
        chatKeys.detail(payload.chatId),
        (currentChat) => updateChatDetailLastMessageInCache(currentChat, payload)
      );
    },
    [queryClient]
  );

  const updateReceiptInCache = useCallback(
    (payload: MessageReceiptPayload) => {
      queryClient.setQueryData<InfiniteData<MessageListData, number>>(
        chatKeys.messageList(payload.chatId),
        (currentData) => updateMessageReceiptInCache(currentData, payload)
      );
      void queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: chatKeys.detail(payload.chatId),
      });
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

    function handleReceiptUpdate(payload: MessageReceiptPayload) {
      if (payload.chatId === chatId) {
        updateReceiptInCache(payload);
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
    socket.on("message:delivered:update", handleReceiptUpdate);
    socket.on("message:read:update", handleReceiptUpdate);
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
      socket.off("message:delivered:update", handleReceiptUpdate);
      socket.off("message:read:update", handleReceiptUpdate);
      socket.off("chat:error", handleChatError);
      socket.off("connect_error", handleConnectError);
    };
  }, [addMessageToCache, chatId, updateReceiptInCache]);

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

      const response = await socket
        .timeout(MESSAGE_SEND_TIMEOUT_MS)
        .emitWithAck("message:send", {
          chatId,
          content: trimmedContent,
        });

      if (!response.ok) {
        throw new Error(response.error);
      }

      addMessageToCache(response.data);
    },
    [addMessageToCache, chatId]
  );

  const markMessageDelivered = useCallback(
    async (messageId: string) => {
      const socket = getChatSocket();

      if (!socket.connected) {
        return;
      }

      const response = await socket
        .timeout(MESSAGE_RECEIPT_TIMEOUT_MS)
        .emitWithAck("message:delivered", { chatId, messageId });

      if (!response.ok) {
        throw new Error(response.error);
      }

      updateReceiptInCache(response.data);
    },
    [chatId, updateReceiptInCache]
  );

  const markMessageRead = useCallback(
    async (messageId: string) => {
      const socket = getChatSocket();

      if (!socket.connected) {
        return;
      }

      const response = await socket
        .timeout(MESSAGE_RECEIPT_TIMEOUT_MS)
        .emitWithAck("message:read", { chatId, messageId });

      if (!response.ok) {
        throw new Error(response.error);
      }

      updateReceiptInCache(response.data);
    },
    [chatId, updateReceiptInCache]
  );

  return {
    connectionStatus,
    error,
    isConnected: connectionStatus === "connected",
    markMessageDelivered,
    markMessageRead,
    sendMessage,
  };
}
