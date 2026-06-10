import { createClient } from 'redis';

import { env } from './env.js';

let redisClient: ReturnType<typeof createClient> | null = null;

export async function connectRedis() {
  if (redisClient?.isOpen) {
    return redisClient;
  }

  redisClient = createClient({
    url: env.REDIS_URL,
  });

  redisClient.on('error', (error) => {
    console.error('Redis client error', error);
  });

  await redisClient.connect();
  console.log('Redis connected');

  return redisClient;
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

  await redisClient.quit();
  redisClient = null;
  console.log('Redis disconnected');
}
