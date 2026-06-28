export type ChatStatus = "active" | "archived";

export type MessageType = "text" | "system";

export type MessageStatus = "sent" | "delivered" | "read";

export type ChatParticipantRole = "learner" | "tutor";

export interface ChatParticipant {
  id: string;
  name: string;
  role: ChatParticipantRole;
  avatar?: string;
}

export interface ChatLastMessage {
  id: string;
  senderId?: string;
  preview?: string;
  sentAt?: string;
}

export interface Chat {
  id: string;
  status: ChatStatus;
  participant: ChatParticipant;
  lastMessage: ChatLastMessage | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  recipientId: string;
  type: MessageType;
  content: string;
  status: MessageStatus;
  deliveredAt: string | null;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ChatListData {
  chats: Chat[];
  pagination: Pagination;
}

export interface MessageListData {
  messages: ChatMessage[];
  pagination: Pagination;
}

export interface CreateChatInput {
  tutorId: string;
}

export interface ListChatsParams {
  page?: number;
  limit?: number;
  status?: ChatStatus;
}

export interface ListMessagesParams {
  page?: number;
  limit?: number;
}

export interface ChatRoomInput {
  chatId: string;
}

export interface ChatRoomPayload {
  chatId: string;
  room: string;
}

export interface SendMessageInput {
  chatId: string;
  content: string;
}

export interface NewMessagePayload {
  id: string;
  chatId: string;
  senderId: string;
  recipientId: string;
  content: string;
  status: "sent";
  createdAt: string;
}

export interface MessageReceiptInput {
  chatId: string;
  messageId: string;
}

export interface MessageReceiptPayload {
  id: string;
  chatId: string;
  status: "delivered" | "read";
  deliveredAt: string | null;
  readAt: string | null;
}

export interface ChatErrorPayload {
  message: string;
}

export interface ConnectedPayload {
  socketId: string;
}

export interface PingAck {
  ok: true;
}

export type SocketAck<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export type SocketAckCallback<T> = (response: SocketAck<T>) => void;

export interface ServerToClientEvents {
  connected: (payload: ConnectedPayload) => void;
  "chat:joined": (payload: ChatRoomPayload) => void;
  "chat:left": (payload: ChatRoomPayload) => void;
  "chat:error": (payload: ChatErrorPayload) => void;
  "message:new": (payload: NewMessagePayload) => void;
  "message:delivered:update": (payload: MessageReceiptPayload) => void;
  "message:read:update": (payload: MessageReceiptPayload) => void;
}

export interface ClientToServerEvents {
  ping: (ack?: (response: PingAck) => void) => void;
  "chat:join": (
    payload: ChatRoomInput,
    ack?: SocketAckCallback<ChatRoomPayload>
  ) => void;
  "chat:leave": (
    payload: ChatRoomInput,
    ack?: SocketAckCallback<ChatRoomPayload>
  ) => void;
  "message:send": (
    payload: SendMessageInput,
    ack?: SocketAckCallback<NewMessagePayload>
  ) => void;
  "message:delivered": (
    payload: MessageReceiptInput,
    ack?: SocketAckCallback<MessageReceiptPayload>
  ) => void;
  "message:read": (
    payload: MessageReceiptInput,
    ack?: SocketAckCallback<MessageReceiptPayload>
  ) => void;
}
