import { z } from 'zod';

const emailSchema = z
  .string({
    required_error: 'Email is required',
  })
  .trim()
  .toLowerCase()
  .email('Email must be a valid email address');

export const registerSchema = z.object({
  name: z
    .string({
      required_error: 'Name is required',
    })
    .trim()
    .min(2, 'Name must be at least 2 characters'),
  email: emailSchema,
  password: z
    .string({
      required_error: 'Password is required',
    })
    .min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string({
    required_error: 'Password is required',
  }),
});
