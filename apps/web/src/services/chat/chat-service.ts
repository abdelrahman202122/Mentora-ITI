import api from "@/lib/axios";
import type { ApiSuccess } from "@/types/apis/api-success";
import type {
  Chat,
  ChatListData,
  CreateChatInput,
  ListChatsParams,
  ListMessagesParams,
  MessageListData,
} from "@/types/chat/chat-types";

export async function createChat(input: CreateChatInput): Promise<Chat> {
  const response = await api.post<ApiSuccess<Chat>>("/chats", input);
  return response.data.data;
}

export async function listChats(
  params: ListChatsParams = {}
): Promise<ChatListData> {
  const response = await api.get<ApiSuccess<ChatListData>>("/chats", {
    params,
  });
  return response.data.data;
}

export async function listMessages(
  chatId: string,
  params: ListMessagesParams = {}
): Promise<MessageListData> {
  const response = await api.get<ApiSuccess<MessageListData>>(
    `/chats/${chatId}/messages`,
    { params }
  );
  return response.data.data;
}

export async function archiveChat(chatId: string): Promise<Chat> {
  const response = await api.patch<ApiSuccess<Chat>>(
    `/chats/${chatId}/archive`
  );
  return response.data.data;
}

export async function restoreChat(chatId: string): Promise<Chat> {
  const response = await api.patch<ApiSuccess<Chat>>(
    `/chats/${chatId}/restore`
  );
  return response.data.data;
}
