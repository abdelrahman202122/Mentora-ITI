import { z } from 'zod';

/* ───────── Query params for GET /api/admin/users ───────── */

export const listAdminUsersQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => Math.max(1, parseInt(v ?? '1', 10))),
  perPage: z
    .string()
    .optional()
    .transform((v) => Math.min(100, Math.max(1, parseInt(v ?? '10', 10)))),
  search: z.string().optional(),
  role: z.enum(['Tutor', 'Student', 'Admin']).optional(),
  status: z.enum(['Active', 'Pending', 'Suspended']).optional(),
});

/* ───────── Body for POST /api/admin/users ───────── */

export const createAdminUserSchema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters').trim(),
    email: z.string().email('Invalid email address').toLowerCase().trim(),
    role: z.enum(['Tutor', 'Student', 'Admin']),
    status: z.enum(['Active', 'Pending', 'Suspended']).default('Active'),
  })
  .strict();

/* ───────── Body for PATCH /api/admin/users/:id ───────── */

export const updateAdminUserSchema = z
  .object({
    name: z.string().min(2).trim().optional(),
    email: z.string().email().toLowerCase().trim().optional(),
    roleLabel: z.string().trim().max(100).optional(),
    status: z.enum(['Active', 'Pending', 'Suspended']).optional(),
  })
  .strict();

/* ───────── Body for PATCH /api/admin/users/:id/suspend ───────── */

export const changeUserStatusSchema = z
  .object({
    status: z.enum(['Active', 'Pending', 'Suspended']),
    reason: z.string().min(1, 'Reason is required').max(500).trim(),
  })
  .strict();


/*  NEW: Query params for GET /:id/audit-logs */
export const listAuditLogsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => Math.max(1, parseInt(v ?? '1', 10))),
  perPage: z
    .string()
    .optional()
    .transform((v) => Math.min(100, Math.max(1, parseInt(v ?? '20', 10)))),
});

/* ─── Exported TypeScript types (auto-inferred from Zod) ─── */

export type ListAuditLogsQuery = z.infer<typeof listAuditLogsQuerySchema>;
export type ListAdminUsersQuery = z.infer<typeof listAdminUsersQuerySchema>;
export type CreateAdminUserInput = z.infer<typeof createAdminUserSchema>;
export type UpdateAdminUserInput = z.infer<typeof updateAdminUserSchema>;
export type ChangeUserStatusInput = z.infer<typeof changeUserStatusSchema>;

