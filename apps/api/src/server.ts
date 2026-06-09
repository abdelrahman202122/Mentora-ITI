import { createServer } from 'node:http';

import { createApp } from './app.js';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';

async function bootstrap() {
  await connectDatabase();

  const app = createApp();
  const server = createServer(app);

  server.listen(env.PORT, () => {
    console.log(`API running on http://localhost:${env.PORT}`);
  });

  const shutdown = async (signal: NodeJS.Signals) => {
    console.log(`${signal} received. Closing server.`);

    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
