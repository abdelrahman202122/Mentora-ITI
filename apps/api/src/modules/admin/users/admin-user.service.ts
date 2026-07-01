import crypto from 'node:crypto';
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../../../common/errors/AppError.js';
import { logger } from '../../../config/logger.js';
import { AuditAction } from '../../audit/audit.interface.js';
import { createAuditLog } from '../../audit/audit.service.js';
import type {
  AdminUserDetail,
  AdminUserListItem,
  AuditLogDto,
} from './admin-user.interface.js';
import {
  findAdminUserById,
  findAdminUsers,
  updateAdminUserFields,
  createAdminUserInDb,
  findUserByEmail,
  getUserSessionCount,
  getUserAvgRating,
  getUserLastActivity,
  getUserReviews,
  findUserAuditLogs
} from './admin-user.repository.js';
import type {
  ListAdminUsersQuery,
  CreateAdminUserInput,
  UpdateAdminUserInput,
  ListAuditLogsQuery
} from './admin-user.validation.js';
import { sendResetEmail } from '../../../common/email/email.service.js';

/* ═════════════════════════════════════════════════════════════════
   PRIVATE HELPERS
   ═════════════════════════════════════════════════════════════════ */

/* Map DB role enum → frontend label */
  const roleToFrontend: Record<string, string> = {
    TUTOR: 'Tutor',
    LEARNER: 'Student',
    ADMIN: 'Admin',
  };

/* Format a Date as "Jan 15, 2023" */
const formatDate = (date: Date | undefined): string => {
  if (!date) return 'Unknown';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/* Convert a raw DB user document into the AdminUserListItem shape
   that the frontend expects */
const mapToListItem = (user: any): AdminUserListItem => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: roleToFrontend[user.role] ?? user.role,
  status: user.adminStatus ?? (user.isActive ? 'Active' : 'Pending'),
  regDate: formatDate(user.createdAt),
  totalSessions: 0,
  avgRating: null,
  lastActivity: null,
  avatarUrl: user.avatar ?? null,
  roleLabel: user.roleLabel ?? null,
});

/* ═════════════════════════════════════════════════════════════════
   1. GET /api/admin/users — List users
   ═════════════════════════════════════════════════════════════════ */

export const listUsers = async (
  adminId: string,
  query: ListAdminUsersQuery,
) => {
  logger.info({ event: 'admin.users.list', adminId, query });

  const { users, total } = await findAdminUsers(query);
  const items: AdminUserListItem[] = users.map(mapToListItem);

  void createAuditLog(adminId, AuditAction.ADMIN_VIEW_USERS, 'User', {
    count: items.length,
    page: query.page,
  });

  return {
    items,
    meta: {
      page: query.page,
      perPage: query.perPage,
      totalItems: total,
      totalPages: Math.ceil(total / query.perPage),
    },
  };
};

/* ═════════════════════════════════════════════════════════════════
   2. GET /api/admin/users/:id — Get user detail (for drawer)
   ═════════════════════════════════════════════════════════════════ */

export const getUserDetail = async (
  adminId: string,
  userId: string,
): Promise<AdminUserDetail> => {
  logger.info({ event: 'admin.users.detail', adminId, userId });

  const user = await findAdminUserById(userId);
  if (!user) throw new NotFoundError('User not found');

  /* Fetch enriched data in parallel */
  const [totalSessions, avgRating, lastActivity, reviews] = await Promise.all([
    getUserSessionCount(userId),
    getUserAvgRating(userId),
    getUserLastActivity(userId),
    getUserReviews(userId),
  ]);

  const base = mapToListItem(user);

  void createAuditLog(adminId, AuditAction.ADMIN_VIEW_USERS, 'User', {
    targetUserId: userId,
  });

  return { ...base, totalSessions, avgRating, lastActivity, reviews };
};

/* ═════════════════════════════════════════════════════════════════
   3. POST /api/admin/users — Create a new user
   ═════════════════════════════════════════════════════════════════ */

export const createUser = async (
  adminId: string,
  data: CreateAdminUserInput,
) => {
  logger.info({
    event: 'admin.users.create.attempt',
    adminId,
    email: data.email,
    role: data.role,
  });

  /* Prevent duplicate emails */
  const existing = await findUserByEmail(data.email);
  if (existing) {
    throw new ConflictError('Email already registered');
  }

  /* Map frontend role → DB role enum */
  const roleToDb: Record<string, string> = {
    Tutor: 'tutor',
    Student: 'learner',
    Admin: 'admin',
  };

  /* Generate a random temp password — the user will reset it
     via the invitation email */

  const temporaryPassword = crypto
  .randomBytes(32)
  .toString("hex");

  const user = await createAdminUserInDb({
    name: data.fullName,
    email: data.email,
    role: roleToDb[data.role] ?? data.role,
    adminStatus: data.status,
    isActive: data.status === 'Active',
    password: temporaryPassword,
  });

  logger.info({
    event: 'admin.users.create.success',
    userId: user._id.toString(),
  });

  void createAuditLog(adminId, AuditAction.USER_REGISTER, 'User', {
    targetUserId: user._id.toString(),
    role: user.role,
    createdByAdmin: true,
  });

  const resetToken = crypto
     .randomBytes(32)
     .toString('hex');
 
   const hashedToken = crypto
     .createHash('sha256')
     .update(resetToken)
     .digest('hex');
 
   const RESET_TOKEN_EXPIRATION_MS =
     15 * 60 * 1000;
 
   user.passwordResetToken = hashedToken;
   user.passwordResetExpires = new Date(
     Date.now() + RESET_TOKEN_EXPIRATION_MS
   );
 
   await user.save();
 
   logger.info({
     event: 'admin.user.invitation.created',
     userId: user._id.toString(),
   });
 
   // Send the raw token via email (not stored in DB)
   sendResetEmail(
     data.email,
     resetToken
   ).catch((error) => {
     logger.error({ event: 'password.reset.failed', userId: user._id.toString(), error });
   });

  return mapToListItem(user);
};

/* ═════════════════════════════════════════════════════════════════
   4. PATCH /api/admin/users/:id — Update user profile
   ═════════════════════════════════════════════════════════════════ */

export const updateUser = async (
  adminId: string,
  userId: string,
  data: UpdateAdminUserInput,
) => {
  logger.info({
    event: 'admin.users.update.attempt',
    adminId,
    userId,
    changedFields: Object.keys(data),
  });

  const user = await findAdminUserById(userId);
  if (!user) throw new NotFoundError('User not found');

  const updateData: Record<string, any> = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.roleLabel !== undefined) updateData.roleLabel = data.roleLabel;

  if (data.status !== undefined) {
    updateData.adminStatus = data.status;
    updateData.isActive = data.status === 'Active';
  }

  /* If email changed, mark as unverified */
  if (data.email !== undefined && data.email !== user.email) {
    updateData.isEmailVerified = false;
  }

  const updated = await updateAdminUserFields(userId, updateData);
  if (!updated) throw new NotFoundError('User not found after update');

  logger.info({ event: 'admin.users.update.success', userId });

  void createAuditLog(adminId, AuditAction.USER_UPDATE, 'User', {
    targetUserId: userId,
    changedFields: Object.keys(data),
  });

  return mapToListItem(updated);
};

/* ═════════════════════════════════════════════════════════════════
   5.  PATCH /api/admin/users/:id/status — Change user status (Active, Pending, Suspended)
   ═════════════════════════════════════════════════════════════════ */

import type { ChangeUserStatusInput } from './admin-user.validation.js';
import { updateUserStatusInDb } from './admin-user.repository.js';
import { RefreshTokenModel } from '../../users/refreshToken.model.js';

/**
 * Change a user's status to any of: Active, Pending, Suspended.
 * Writes an audit log entry capturing the previous → new status
 * and the admin-provided reason.
 */
export const changeUserStatus = async (
  adminId: string,
  userId: string,
  data: ChangeUserStatusInput,
) => {
  logger.info({
    event: 'admin.users.status_change.attempt',
    adminId,
    userId,
    newStatus: data.status,
  });

  const user = await findAdminUserById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  const previousStatus = user.adminStatus ?? 'Active';

  // Prevent no-op: if status is already the target, reject
  if (previousStatus === data.status) {
    throw new ConflictError(
      `User is already ${data.status.toLowerCase()}`,
    );
  }

  // Prevent admin from suspending themselves
  if (adminId === userId && data.status === 'Suspended') {
    throw new ValidationError('You cannot suspend your own account');
  }

  await updateUserStatusInDb(userId, data.status);

  // If suspending, revoke all active sessions (refresh tokens)
  if (data.status === 'Suspended') {
    await RefreshTokenModel.deleteMany({ userId });
    logger.info({
      event: 'admin.users.status_change.sessions_revoked',
      userId,
    });
  }

  logger.info({
    event: 'admin.users.status_change.success',
    userId,
    previousStatus,
    newStatus: data.status,
  });

  // Audit log — capture the FULL transition for compliance
  void createAuditLog(adminId, AuditAction.USER_UPDATE, 'User', {
    targetUserId: userId,
    action: 'status_change',
    previousStatus,
    newStatus: data.status,
    reason: data.reason,
  });

  return {
    id: userId,
    previousStatus,
    newStatus: data.status,
  };
};
/* ═════════════════════════════════════════════════════════════════
   6. GET /api/admin/users/export — Export users as CSV
   ═════════════════════════════════════════════════════════════════ */

export const exportUsersCsv = async (
  adminId: string,
  query: ListAdminUsersQuery,
): Promise<string> => {
  logger.info({ event: 'admin.users.export', adminId });

  /* Fetch ALL matching users — no pagination for CSV export */
  const exportQuery: ListAdminUsersQuery = {
    ...query,
    page: 1,
    perPage: 10000,
  };

  const { users } = await findAdminUsers(exportQuery);

  const header = 'ID,Name,Email,Role,Status,Registration Date,Role Label\n';

  const rows = users
    .map((u) => {
      const item = mapToListItem(u);
      return [
        item.id,
        `"${item.name}"`,
        item.email,
        item.role,
        item.status,
        item.regDate,
        `"${item.roleLabel ?? ''}"`,
      ].join(',');
    })
    .join('\n');

  void createAuditLog(adminId, AuditAction.ADMIN_VIEW_USERS, 'User', {
    action: 'export_csv',
  });

  return header + rows;
};



export const getUserAuditLogs = async (
  adminId: string,
  userId: string,
  query: ListAuditLogsQuery,
) => {
  logger.info({
    event: 'admin.users.audit_logs',
    adminId,
    targetUserId: userId,
    page: query.page,
  });

  const { logs, total } = await findUserAuditLogs(userId, query);

  /* Map DB documents → API response shape.
     Adjust the field names below to match your actual AuditModel schema. */
  const items: AuditLogDto[] = logs.map((log: any) => ({
    id: log._id.toString(),
    action: log.action ?? 'UNKNOWN',
    performedBy: log.performedBy ?? log.metadata?.adminName ?? 'System',
    details: log.details ?? log.metadata?.description ?? null,
    timestamp: log.createdAt?.toISOString() ?? new Date().toISOString(),
  }));

  return {
    items,
    meta: {
      page: query.page,
      perPage: query.perPage,
      totalItems: total,
    },
  };
};
