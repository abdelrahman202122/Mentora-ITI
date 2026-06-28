"use client";

import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import type { ApiClientError } from "@/lib/axios";
import {
  archiveChat,
  createChat,
  listChats,
  listMessages,
  restoreChat,
} from "@/services/chat/chat-service";
import type {
  Chat,
  ChatListData,
  ChatStatus,
  CreateChatInput,
  MessageListData,
} from "@/types/chat/chat-types";

const CHAT_PAGE_SIZE = 20;
const MESSAGE_PAGE_SIZE = 50;

export const chatKeys = {
  all: ["chats"] as const,
  lists: () => [...chatKeys.all, "list"] as const,
  list: (status: ChatStatus) =>
    [...chatKeys.lists(), { status }] as const,
  messages: () => [...chatKeys.all, "messages"] as const,
  messageList: (chatId: string) =>
    [...chatKeys.messages(), chatId] as const,
};

export function useChats(status: ChatStatus = "active") {
  return useInfiniteQuery<
    ChatListData,
    ApiClientError,
    InfiniteData<ChatListData, number>,
    ReturnType<typeof chatKeys.list>,
    number
  >({
    queryKey: chatKeys.list(status),
    queryFn: ({ pageParam }) =>
      listChats({ page: pageParam, limit: CHAT_PAGE_SIZE, status }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
  });
}

export function useChatMessages(chatId: string) {
  return useInfiniteQuery<
    MessageListData,
    ApiClientError,
    InfiniteData<MessageListData, number>,
    ReturnType<typeof chatKeys.messageList>,
    number
  >({
    queryKey: chatKeys.messageList(chatId),
    queryFn: ({ pageParam }) =>
      listMessages(chatId, {
        page: pageParam,
        limit: MESSAGE_PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    enabled: Boolean(chatId),
  });
}

export function useCreateChat() {
  const queryClient = useQueryClient();

  return useMutation<Chat, ApiClientError, CreateChatInput>({
    mutationFn: createChat,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: chatKeys.list("active"),
      });
    },
  });
}

export function useArchiveChat() {
  const queryClient = useQueryClient();

  return useMutation<Chat, ApiClientError, string>({
    mutationFn: archiveChat,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
    },
  });
}

export function useRestoreChat() {
  const queryClient = useQueryClient();

  return useMutation<Chat, ApiClientError, string>({
    mutationFn: restoreChat,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
    },
  });
}
