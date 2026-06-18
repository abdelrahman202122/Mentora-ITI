import { createClient } from 'redis';

import { env } from './env.js';

let redisClient: ReturnType<typeof createClient> | null = null;
let redisAvailable = false;

export async function connectRedis() {
  if (redisClient?.isOpen) {
    return redisClient;
  }

  redisClient = createClient({
    url: env.REDIS_URL,
    socket: {
      reconnectStrategy: false,
    },
  });

  redisClient.on('error', (error) => {
    console.error('Redis client error', error);
  });

  try {
    await redisClient.connect();
    redisAvailable = true;
    console.log('Redis connected');
  } catch (error) {
    redisAvailable = false;
    redisClient = null;

    if (env.NODE_ENV === 'production') {
      throw error;
    }

    console.warn(
      'Redis unavailable. Continuing without Redis in development.',
      error,
    );
    return null;
  }

  return redisClient;
}

export function isRedisAvailable() {
  return redisAvailable && !!redisClient?.isOpen;
}

export function getRedisClient() {
  if (!redisClient?.isOpen) {
    throw new Error('Redis client is not connected');
  }

  return redisClient;
}

export async function disconnectRedis() {
  if (!redisClient?.isOpen) {
    return;
  }

  try {
    await redisClient.quit();
    console.log('Redis disconnected');
  } catch (error) {
    console.error('Failed to disconnect Redis', error);
  } finally {
    redisClient = null;
    redisAvailable = false;
  }
}
