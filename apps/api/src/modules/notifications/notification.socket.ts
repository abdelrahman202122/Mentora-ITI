import { type Server as SocketServer, type Socket } from 'socket.io';

import { getSocketUser } from '../../middleware/socket-auth.middleware.js';
import {
  createNotification,
  markNotificationDelivered,
} from './notification.service.js';
import type { formatNotification } from './notification.service.js';

export const notificationEvents = {
  created: 'notification:new',
  read: 'notification:read:update',
  readAll: 'notification:read-all:update',
} as const;

type NotificationDto = ReturnType<typeof formatNotification>;

export function getUserRoomName(userId: string) {
  return `user:${userId}`;
}

function getChatRoomName(chatId: string) {
  return `chat:${chatId}`;
}

export async function joinNotificationRoom(socket: Socket) {
  const { userId } = getSocketUser(socket);
  await socket.join(getUserRoomName(userId));
}

export async function isUserViewingChat(
  io: SocketServer,
  userId: string,
  chatId: string,
) {
  const sockets = await io.in(getUserRoomName(userId)).fetchSockets();
  const chatRoom = getChatRoomName(chatId);
  return sockets.some((connectedSocket) =>
    connectedSocket.rooms.has(chatRoom),
  );
}

export async function deliverNotification(
  io: SocketServer,
  recipientId: string,
  notification: NotificationDto,
) {
  const room = getUserRoomName(recipientId);
  const sockets = await io.in(room).fetchSockets();

  if (sockets.length === 0) {
    return notification;
  }

  const deliveredNotification = await markNotificationDelivered(
    notification.id,
  );
  io.to(room).emit(notificationEvents.created, deliveredNotification);
  return deliveredNotification;
}

export function emitNotificationRead(
  io: SocketServer,
  recipientId: string,
  notification: NotificationDto,
) {
  io.to(getUserRoomName(recipientId)).emit(
    notificationEvents.read,
    notification,
  );
}

export function emitNotificationsReadAll(
  io: SocketServer,
  recipientId: string,
  payload: { updatedCount: number; readAt: Date },
) {
  io.to(getUserRoomName(recipientId)).emit(
    notificationEvents.readAll,
    payload,
  );
}

export async function createMessageNotification(
  io: SocketServer,
  input: {
    recipientId: string;
    senderId: string;
    chatId: string;
    messageId: string;
    content: string;
  },
) {
  if (await isUserViewingChat(io, input.recipientId, input.chatId)) {
    return null;
  }

  const notification = await createNotification({
    recipientId: input.recipientId,
    actorId: input.senderId,
    type: 'message',
    title: 'New message',
    body: input.content.slice(0, 160),
    data: {
      chatId: input.chatId,
      messageId: input.messageId,
      senderId: input.senderId,
    },
  });

  return deliverNotification(io, input.recipientId, notification);
}
