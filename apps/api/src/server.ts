import { createServer, type Server } from 'node:http';

import { createApp } from './app.js';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';

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

  const app = createApp();
  const server = createServer(app);

  await listen(server, env.PORT);
  console.log(`API running on http://localhost:${env.PORT}`);

  const shutdown = async (signal: NodeJS.Signals) => {
    console.log(`${signal} received. Closing server.`);

    server.close((error) => {
      if (error) {
        console.error('Failed to close server', error);
        process.exit(1);
      }

      disconnectDatabase()
        .then(() => {
          process.exit(0);
        })
        .catch((disconnectError) => {
          console.error('Failed to disconnect database', disconnectError);
          process.exit(1);
        });
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap().catch(async (error) => {
  console.error('Failed to start server', error);
  await disconnectDatabase();
  process.exit(1);
});
