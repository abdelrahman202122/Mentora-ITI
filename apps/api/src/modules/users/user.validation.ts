import { z } from 'zod';
import { UserRole } from './user.interface.js';
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

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
  role: z
    .nativeEnum(UserRole)
    .optional()
    .default(UserRole.LEARNER),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string({
    required_error: 'Password is required',
  }),
});


export const updateUserByAdminSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100).optional(),
    email: emailSchema.optional(),
    avatar: z.string().url('Avatar must be a valid URL').max(500).optional(),
    role: z.nativeEnum(UserRole).optional(),
    isActive: z.boolean().optional(),
    isEmailVerified: z.boolean().optional(),
  })
  .strict(); // rejects unknown keys: password, _id, __v, etc.

export type UpdateUserByAdminInput = z.infer<typeof updateUserByAdminSchema>;


export const changePasswordSchema = z
  .object({
    currentPassword: z.string({ required_error: 'Current password is required' }).min(1),
    newPassword: z
      .string({ required_error: 'New password is required' })
      .min(6, 'Password must be at least 6 characters'),
  })
  .strict()
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100).optional(),
    avatar: z.string().url('Avatar must be a valid URL').max(500).optional(),
  })
  .strict();


  export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
