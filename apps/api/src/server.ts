import { createServer, type Server } from 'node:http';

import { createApp } from './app.js';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { logger } from './config/logger.js';

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
  await connectRedis();

  const app = createApp();
  const server = createServer(app);
  await initializeSocketServer(server);

  await listen(server, env.PORT);
  // console.log(`API running on http://localhost:${env.PORT}`);
  logger.info(`Server started on http://localhost:${env.PORT}`);
  

  const shutdown = async (signal: NodeJS.Signals) => {
    // console.log(`${signal} received. Closing server.`);
    logger.warn(`Shutdown signal received: ${signal}. Closing server.`);

    server.close((error) => {
      if (error) {
        // console.error('Failed to close server', error);
        logger.error('Failed to start server', { error });
        process.exit(1);
      }

      void Promise.allSettled([
        closeSocketServer(),
        disconnectRedis(),
        disconnectDatabase(),
      ]).then((results) => {
        const failures = results.filter(
          (result): result is PromiseRejectedResult => result.status === 'rejected',
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
