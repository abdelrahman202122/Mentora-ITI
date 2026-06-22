import { createServer, type Server } from 'node:http';

import { createApp } from './app.js';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { logger } from './config/logger.js';
import { connectRedis, disconnectRedis } from './config/redis.js';
import { closeSocketServer, initializeSocketServer } from './config/socket.js';

function listen(server: Server, port: number) {
  return new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, () => {
      server.off('error', reject);
      resolve();
    });
  });
}

async function bootstrap() {
  await connectDatabase();

  if (env.REDIS_ENABLED) {
    await connectRedis();
  } else {
    logger.warn('Redis disabled; Socket.IO will use the in-memory adapter');
  }

  const app = createApp();
  const server = createServer(app);
  await initializeSocketServer(server);

  await listen(server, env.PORT);
  logger.info(`Server started on http://localhost:${env.PORT}`);

  const shutdown = async (signal: NodeJS.Signals) => {
    logger.warn(`Shutdown signal received: ${signal}. Closing server.`);

    server.close((error) => {
      if (error) {
        logger.error('Failed to start server', { error });
        process.exit(1);
      }

      void Promise.allSettled([
        closeSocketServer(),
        disconnectRedis(),
        disconnectDatabase(),
      ]).then((results) => {
        const failures = results.filter(
          (result): result is PromiseRejectedResult =>
            result.status === 'rejected',
        );

        if (failures.length > 0) {
          console.error(
            'Failed to shutdown resources',
            failures.map((failure) => failure.reason),
          );
          process.exit(1);
        }

        process.exit(0);
      });
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap().catch(async (error) => {
  console.error('Failed to start server', error);
  await closeSocketServer();
  await disconnectRedis();
  await disconnectDatabase();
  process.exit(1);
});
