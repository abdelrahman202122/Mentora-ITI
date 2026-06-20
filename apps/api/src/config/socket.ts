import { type Server as HttpServer } from 'node:http';

import { createAdapter } from '@socket.io/redis-adapter';
import { type RedisClientType } from 'redis';
import { Server as SocketServer } from 'socket.io';

import { env } from './env.js';
import { getRedisClient } from './redis.js';
import { authenticateSocket } from '../middleware/socket-auth.middleware.js';
import { registerChatSocketHandlers } from '../modules/chats/chat.socket.js';

let io: SocketServer | null = null;
let socketRedisSubscriber: RedisClientType | undefined;

export async function initializeSocketServer(server: HttpServer) {
  const socketServer = new SocketServer(server, {
    cors: {
      origin: env.CLIENT_ORIGIN,
      credentials: true,
    },
  });
  io = socketServer;

  const redisPublisher = getRedisClient();
  socketRedisSubscriber = redisPublisher.duplicate();

  try {
    await socketRedisSubscriber.connect();
    socketServer.adapter(createAdapter(redisPublisher, socketRedisSubscriber));
  } catch (error) {
    try {
      if (socketRedisSubscriber.isOpen) {
        await socketRedisSubscriber.quit();
      }
    } catch (disconnectError) {
      console.error(
        'Failed to close Socket.IO Redis subscriber',
        disconnectError,
      );
    } finally {
      socketRedisSubscriber = undefined;
    }

    throw error;
  }

  socketServer.use(authenticateSocket);

  socketServer.on('connection', (socket) => {
    registerChatSocketHandlers(socketServer, socket);

    socket.emit('connected', {
      socketId: socket.id,
    });

    socket.on('ping', (callback?: (response: { ok: true }) => void) => {
      callback?.({ ok: true });
    });
  });

  console.log('Socket.IO initialized');

  return socketServer;
}

export function getSocketServer() {
  if (!io) {
    throw new Error('Socket.IO server is not initialized');
  }

  return io;
}

export async function closeSocketServer() {
  if (io) {
    try {
      await io.close();
    } catch (error) {
      console.error('Failed to close Socket.IO server', error);
    } finally {
      io = null;
    }
  }

  try {
    if (socketRedisSubscriber?.isOpen) {
      await socketRedisSubscriber.quit();
    }
  } catch (error) {
    console.error('Failed to close Socket.IO Redis subscriber', error);
  } finally {
    socketRedisSubscriber = undefined;
  }

  console.log('Socket.IO closed');
}
