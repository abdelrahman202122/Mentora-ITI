import { Types } from 'mongoose';
import { type Server as SocketServer, type Socket } from 'socket.io';
import { z } from 'zod';

import { MessageModel } from '../messages/message.model.js';
import { ChatModel, type ChatDocument } from './chat.model.js';

const chatEvents = {
  join: 'chat:join',
  joined: 'chat:joined',
  leave: 'chat:leave',
  left: 'chat:left',
  sendMessage: 'message:send',
  newMessage: 'message:new',
  deliveredMessage: 'message:delivered',
  messageDelivered: 'message:delivered:update',
  readMessage: 'message:read',
  messageRead: 'message:read:update',
  error: 'chat:error',
} as const;

const objectIdSchema = z.string().refine((value) => Types.ObjectId.isValid(value), {
  message: 'Invalid ObjectId',
});

const joinChatPayloadSchema = z.object({
  chatId: objectIdSchema,
  userId: objectIdSchema,
});

const sendMessagePayloadSchema = z.object({
  chatId: objectIdSchema,
  senderId: objectIdSchema,
  content: z.string().trim().min(1).max(5000),
});

const messageReceiptPayloadSchema = z.object({
  chatId: objectIdSchema,
  messageId: objectIdSchema,
  userId: objectIdSchema,
});

type JoinChatPayload = z.infer<typeof joinChatPayloadSchema>;
type SendMessagePayload = z.infer<typeof sendMessagePayloadSchema>;
type MessageReceiptPayload = z.infer<typeof messageReceiptPayloadSchema>;

type SocketAck<T> = (response: { ok: true; data: T } | { ok: false; error: string }) => void;
type SocketErrorAck = (response: { ok: false; error: string }) => void;

function getChatRoomName(chatId: string) {
  return `chat:${chatId}`;
}

function toIdString(value: Types.ObjectId) {
  return value.toString();
}

async function findParticipantChat(chatId: string, userId: string) {
  const chat = await ChatModel.findById(chatId);

  if (!chat) {
    throw new Error('Chat not found');
  }

  const participantIds = [toIdString(chat.learnerId), toIdString(chat.tutorId)];

  if (!participantIds.includes(userId)) {
    throw new Error('User is not a participant in this chat');
  }

  return chat;
}

function getRecipientId(chat: ChatDocument, senderId: string) {
  const learnerId = toIdString(chat.learnerId);
  const tutorId = toIdString(chat.tutorId);

  if (senderId === learnerId) {
    return tutorId;
  }

  if (senderId === tutorId) {
    return learnerId;
  }

  throw new Error('Sender is not a participant in this chat');
}

function emitError(socket: Socket, message: string) {
  socket.emit(chatEvents.error, {
    message,
  });
}

function parsePayload<T>(
  socket: Socket,
  schema: z.ZodType<T>,
  payload: unknown,
  ack?: SocketErrorAck,
) {
  const result = schema.safeParse(payload);

  if (!result.success) {
    const error = result.error.issues[0]?.message ?? 'Invalid socket payload';
    emitError(socket, error);
    ack?.({ ok: false, error });
    return null;
  }

  return result.data;
}

async function handleJoinChat(
  socket: Socket,
  payload: unknown,
  ack?: SocketAck<{ chatId: string; room: string }>,
) {
  const data = parsePayload(socket, joinChatPayloadSchema, payload, ack);

  if (!data) {
    return;
  }

  try {
    await findParticipantChat(data.chatId, data.userId);

    const room = getChatRoomName(data.chatId);
    await socket.join(room);

    const response = {
      chatId: data.chatId,
      room,
    };

    socket.emit(chatEvents.joined, response);
    ack?.({ ok: true, data: response });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to join chat';
    emitError(socket, message);
    ack?.({ ok: false, error: message });
  }
}

async function handleLeaveChat(
  socket: Socket,
  payload: unknown,
  ack?: SocketAck<{ chatId: string; room: string }>,
) {
  const data = parsePayload(socket, joinChatPayloadSchema, payload, ack);

  if (!data) {
    return;
  }

  try {
    const room = getChatRoomName(data.chatId);
    await socket.leave(room);

    const response = {
      chatId: data.chatId,
      room,
    };

    socket.emit(chatEvents.left, response);
    ack?.({ ok: true, data: response });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to leave chat';
    emitError(socket, message);
    ack?.({ ok: false, error: message });
  }
}

async function handleSendMessage(
  io: SocketServer,
  socket: Socket,
  payload: unknown,
  ack?: SocketAck<{
    id: string;
    chatId: string;
    senderId: string;
    recipientId: string;
    content: string;
    status: string;
    createdAt: Date;
  }>,
) {
  const data = parsePayload(socket, sendMessagePayloadSchema, payload, ack);

  if (!data) {
    return;
  }

  try {
    const chat = await findParticipantChat(data.chatId, data.senderId);
    const recipientId = getRecipientId(chat, data.senderId);

    const message = await MessageModel.create({
      chatId: data.chatId,
      senderId: data.senderId,
      recipientId,
      content: data.content,
    });

    chat.lastMessage = {
      messageId: message._id,
      senderId: new Types.ObjectId(data.senderId),
      preview: message.content,
      sentAt: message.createdAt,
    };
    await chat.save();

    const response = {
      id: message._id.toString(),
      chatId: data.chatId,
      senderId: data.senderId,
      recipientId,
      content: message.content,
      status: message.status,
      createdAt: message.createdAt,
    };

    io.to(getChatRoomName(data.chatId)).emit(chatEvents.newMessage, response);
    ack?.({ ok: true, data: response });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send message';
    emitError(socket, message);
    ack?.({ ok: false, error: message });
  }
}

async function updateMessageReceipt(
  io: SocketServer,
  socket: Socket,
  payload: unknown,
  receiptType: 'delivered' | 'read',
  ack?: SocketAck<{
    id: string;
    chatId: string;
    status: string;
    deliveredAt: Date | null;
    readAt: Date | null;
  }>,
) {
  const data = parsePayload(socket, messageReceiptPayloadSchema, payload, ack);

  if (!data) {
    return;
  }

  try {
    await findParticipantChat(data.chatId, data.userId);

    const message = await MessageModel.findOne({
      _id: data.messageId,
      chatId: data.chatId,
      recipientId: data.userId,
      deletedAt: null,
    });

    if (!message) {
      throw new Error('Message not found');
    }

    const now = new Date();

    if (receiptType === 'delivered' && message.status === 'sent') {
      message.status = 'delivered';
      message.deliveredAt = message.deliveredAt ?? now;
    }

    if (receiptType === 'read') {
      message.status = 'read';
      message.deliveredAt = message.deliveredAt ?? now;
      message.readAt = message.readAt ?? now;
    }

    await message.save();

    const response = {
      id: message._id.toString(),
      chatId: data.chatId,
      status: message.status,
      deliveredAt: message.deliveredAt ?? null,
      readAt: message.readAt ?? null,
    };

    io.to(getChatRoomName(data.chatId)).emit(
      receiptType === 'delivered' ? chatEvents.messageDelivered : chatEvents.messageRead,
      response,
    );
    ack?.({ ok: true, data: response });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : `Failed to mark message as ${receiptType}`;
    emitError(socket, message);
    ack?.({ ok: false, error: message });
  }
}

export function registerChatSocketHandlers(io: SocketServer, socket: Socket) {
  socket.on(chatEvents.join, (payload: JoinChatPayload, ack?: SocketAck<{ chatId: string; room: string }>) => {
    void handleJoinChat(socket, payload, ack);
  });

  socket.on(chatEvents.leave, (payload: JoinChatPayload, ack?: SocketAck<{ chatId: string; room: string }>) => {
    void handleLeaveChat(socket, payload, ack);
  });

  socket.on(
    chatEvents.sendMessage,
    (
      payload: SendMessagePayload,
      ack?: SocketAck<{
        id: string;
        chatId: string;
        senderId: string;
        recipientId: string;
        content: string;
        status: string;
        createdAt: Date;
      }>,
    ) => {
      void handleSendMessage(io, socket, payload, ack);
    },
  );

  socket.on(
    chatEvents.deliveredMessage,
    (
      payload: MessageReceiptPayload,
      ack?: SocketAck<{
        id: string;
        chatId: string;
        status: string;
        deliveredAt: Date | null;
        readAt: Date | null;
      }>,
    ) => {
      void updateMessageReceipt(io, socket, payload, 'delivered', ack);
    },
  );

  socket.on(
    chatEvents.readMessage,
    (
      payload: MessageReceiptPayload,
      ack?: SocketAck<{
        id: string;
        chatId: string;
        status: string;
        deliveredAt: Date | null;
        readAt: Date | null;
      }>,
    ) => {
      void updateMessageReceipt(io, socket, payload, 'read', ack);
    },
  );
}
