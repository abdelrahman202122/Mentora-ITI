import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { config } from 'dotenv';
import { z } from 'zod';

const currentDir = dirname(fileURLToPath(import.meta.url));

config({
  path: resolve(currentDir, '../../.env'),
});

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  CLIENT_ORIGIN: z.string().url().default('http://localhost:3000'),
  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
  REDIS_URL: z.string().url().default('redis://localhost:6379'),
  OPENAI_API_KEY: z.string().min(1).optional(),
  OPENAI_MODEL: z.string().min(1).default('gpt-4.1-mini'),
  PAYMOB_API_KEY: z.string().min(1, 'PAYMOB_API_KEY is required'),
  PAYMOB_PUBLIC_KEY: z.string().min(1, 'PAYMOB_PUPLIC_KEY is required'),
  PAYMOB_SECRET_KEY: z.string().min(1, 'PAYMOB_SECRET_KEY is required'),
  PAYMOB_HMAC_SECRET: z.string().min(1, 'PAYMOB_HMAC_SECRET is required'),
  PAYMOB_INTEGRATION_ID: z.coerce.number().int().positive()
});

export const env = envSchema.parse(process.env);
