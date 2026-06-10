import { type Server as HttpServer } from 'node:http';

import { createAdapter } from '@socket.io/redis-adapter';
import { type RedisClientType } from 'redis';
import { Server as SocketServer } from 'socket.io';

import { env } from './env.js';
import { getRedisClient } from './redis.js';

let io: SocketServer | null = null;
let socketRedisSubscriber: RedisClientType | null = null;

export async function initializeSocketServer(server: HttpServer) {
  io = new SocketServer(server, {
    cors: {
      origin: env.CLIENT_ORIGIN,
      credentials: true,
    },
  });

  const redisPublisher = getRedisClient();
  socketRedisSubscriber = redisPublisher.duplicate();
  await socketRedisSubscriber.connect();
  io.adapter(createAdapter(redisPublisher, socketRedisSubscriber));

  io.on('connection', (socket) => {
    socket.emit('connected', {
      socketId: socket.id,
    });

    socket.on('ping', (callback?: (response: { ok: true }) => void) => {
      callback?.({ ok: true });
    });
  });

  console.log('Socket.IO initialized');

  return io;
}

export function getSocketServer() {
  if (!io) {
    throw new Error('Socket.IO server is not initialized');
  }

  return io;
}

export async function closeSocketServer() {
  if (!io) {
    return;
  }

  await io.close();
  io = null;

  if (socketRedisSubscriber?.isOpen) {
    await socketRedisSubscriber.quit();
  }

  socketRedisSubscriber = null;
  console.log('Socket.IO closed');
}
