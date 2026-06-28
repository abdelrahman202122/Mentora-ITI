import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { config } from 'dotenv';
import { z } from 'zod';

const currentDir = dirname(fileURLToPath(import.meta.url));

config({
  path: resolve(currentDir, '../../.env'),
});

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    PORT: z.coerce.number().int().positive().default(4000),
    CLIENT_ORIGIN: z.string().url().default('http://localhost:3000'),
    MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
    TRANSACTIONS_ENABLED: z
      .enum(['true', 'false'])
      .default('true')
      .transform((value) => value === 'true'),
    REDIS_ENABLED: z
      .enum(['true', 'false'])
      .transform((value) => value === 'true')
      .optional(),
    REDIS_URL: z.string().url().default('redis://localhost:6379'),
    OPENAI_API_KEY: z.string().min(1).optional(),
    OPENAI_MODEL: z.string().min(1).default('gpt-4.1-mini'),
    PAYMOB_API_KEY: z.string().min(1, 'PAYMOB_API_KEY is required'),
    PAYMOB_PUBLIC_KEY: z.string().min(1, 'PAYMOB_PUBLIC_KEY is required'),
    PAYMOB_SECRET_KEY: z.string().min(1, 'PAYMOB_SECRET_KEY is required'),
    PAYMOB_HMAC_SECRET: z.string().min(1, 'PAYMOB_HMAC_SECRET is required'),
    PAYMOB_INTEGRATION_ID: z.coerce.number().int().positive(),
    PAYMOB_NOTIFICATION_URL: z.string().url().optional(),
    PAYMOB_REDIRECT_URL: z.string().url().optional(),
    EMAIL_USER: z.string().email().optional(),
    EMAIL_PASS: z.string().min(6).optional(),
  })
  .superRefine((values, context) => {
    if (values.NODE_ENV === 'production' && values.REDIS_ENABLED === false) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['REDIS_ENABLED'],
        message: 'REDIS_ENABLED cannot be false in production',
      });
    }

    if (
      values.NODE_ENV === 'production' &&
      values.TRANSACTIONS_ENABLED === false
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['TRANSACTIONS_ENABLED'],
        message: 'TRANSACTIONS_ENABLED cannot be false in production',
      });
    }

    if (values.NODE_ENV === 'production' && !values.EMAIL_USER) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['EMAIL_USER'],
        message: 'EMAIL_USER is required in production',
      });
    }

    if (values.NODE_ENV === 'production' && !values.EMAIL_PASS) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['EMAIL_PASS'],
        message: 'EMAIL_PASS is required in production',
      });
    }
  });

const parsedEnv = envSchema.parse(process.env);

export const env = {
  ...parsedEnv,
  REDIS_ENABLED: parsedEnv.REDIS_ENABLED ?? parsedEnv.NODE_ENV === 'production',
};
