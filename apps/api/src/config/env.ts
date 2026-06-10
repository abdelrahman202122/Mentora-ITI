import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { config } from 'dotenv';
import { z } from 'zod';

const currentDir = dirname(fileURLToPath(import.meta.url));

config({
  path: resolve(currentDir, '../../.env'),
});
console.log('ENV PATH:', resolve(currentDir, '../../.env'));
console.log('MONGO_URI:', process.env.MONGO_URI);

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  CLIENT_ORIGIN: z.string().url().default('http://localhost:3000'),
  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
});

export const env = envSchema.parse(process.env);
