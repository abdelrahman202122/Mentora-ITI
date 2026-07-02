import { z } from 'zod';
import { UserRole } from './user.interface.js';
import { normalizePhoneNumber } from '../../utils/normalizePhoneNumber.js';

// Strong password: uppercase, lowercase, number, special char, min 8 chars
const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*\-_=+]).{8,}$/;

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

const emailSchema = z
  .string({
    required_error: 'Email is required',
  })
  .trim()
  .toLowerCase()
  .email('Email must be a valid email address');

export const phoneNumberSchema = z
  .string({
    required_error: 'Phone number is required',
  })
  .trim()
  .regex(/^(010|011|012|015)\d{8}$/, 'Invalid Egyptian phone number');

export const registerSchema = z.object({
  name: z
    .string({
      required_error: 'Name is required',
    })
    .trim()
    .min(2, 'Name must be at least 2 characters'),
  email: emailSchema,
  phoneNumber: phoneNumberSchema,
  password: z
    .string({
      required_error: 'Password is required',
    })
    .regex(
      strongPasswordRegex,
      'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character (!@#$%^&*-_=+)',
    ),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string({
    required_error: 'Password is required',
  }),
});

export const updateUserByAdminSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(100)
      .optional(),
    email: emailSchema.optional(),
    avatar: z.string().url('Avatar must be a valid URL').max(500).optional(),
    role: z.nativeEnum(UserRole).optional(),
    isActive: z.boolean().optional(),
    isEmailVerified: z.boolean().optional(),

    adminStatus: z.enum(['Active', 'Pending', 'Suspended']).optional(),
    roleLabel: z.string().trim().max(100).optional(),
  })
  .strict(); // rejects unknown keys: password, _id, __v, etc.

export type UpdateUserByAdminInput = z.infer<typeof updateUserByAdminSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string({ required_error: 'Current password is required' })
      .min(1),
    newPassword: z
      .string({ required_error: 'New password is required' })
      .regex(
        strongPasswordRegex,
        'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character (!@#$%^&*-_=+)',
      ),
  })
  .strict()
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

export const updateProfileSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(100)
      .optional(),
    avatar: z.string().url('Avatar must be a valid URL').max(500).optional(),
    phoneNumber: z.string().transform(normalizePhoneNumber).optional(),
  })
  .strict();

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;

export const forgotPasswordSchema = z
  .object({
    email: z.string().trim().email('Invalid email address'),
  })
  .strict();

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token is required'),
    newPassword: z
      .string()
      .regex(
        strongPasswordRegex,
        'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character (!@#$%^&*-_=+)',
      ),
  })
  .strict();

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/* ✅ NEW: Schema for the unified status-change endpoint
   PATCH /users/:id/status
   Body: { status: "Active" | "Pending" | "Suspended", reason: string } */
export const changeUserStatusSchema = z
  .object({
    status: z.enum(['Active', 'Pending', 'Suspended']),
    reason: z.string().min(1, 'Reason is required').max(500).trim(),
  })
  .strict();

export type ChangeUserStatusInput = z.infer<typeof changeUserStatusSchema>;
