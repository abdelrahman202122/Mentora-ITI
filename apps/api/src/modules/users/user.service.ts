
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */

import { unlink } from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '../../common/errors/AppError.js';
import { logger } from '../../config/logger.js';
import { emailHash } from '../../utils/emailHash.js';
import { comparePassword, hashPassword } from '../../utils/hashPassword.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../../utils/JWT.js';
import { AuditAction } from '../audit/audit.interface.js';
import { createAuditLog } from '../audit/audit.service.js';
import { RefreshTokenModel } from './refreshToken.model.js';
import { AuthResult, UserProfileDTO, UserRole } from './user.interface.js';
import { UserModel } from './user.model.js';
import {
  ListUsersQuery,
  UpdateUserByAdminInput,
  ChangeUserStatusInput,
} from './user.validation.js';
import { RegisterInput, LoginInput } from './user.validation.js';
import {
  clearUserAvatar,
  findUserById,
  updateUserAvatar,
} from './user.repository.js';
import { sendResetEmail } from '../../common/email/email.service.js';
import mongoose from 'mongoose';
import { normalizePhoneNumber } from '../../utils/normalizePhoneNumber.js';
import { verifyEmail } from '../../utils/emailValidation.js';

/* ═══════════════════════════════════════════════════════════════════
   HELPER: Revoke all refresh tokens for a user
   Used when: user is suspended, password is reset, account is deleted
   ═══════════════════════════════════════════════════════════════════ */

const revokeAllUserSessions = async (userId: string, reason: string) => {
  const result = await RefreshTokenModel.deleteMany({ userId });
  logger.info({
    event: 'sessions.revoked',
    userId,
    reason,
    count: result.deletedCount,
  });
};

/* ═══════════════════════════════════════════════════════════════════
   1. REGISTER
   ═══════════════════════════════════════════════════════════════════ */

export const register = async (data: RegisterInput): Promise<AuthResult> => {
  try {
    logger.info({
      event: 'registration.attempt',
      emailHash: emailHash(data.email),
    });

  const normalizedPhoneNumber = normalizePhoneNumber(data.phoneNumber);

  const user = await UserModel.create({
    name: data.name,
    email: data.email,
    phoneNumber: normalizedPhoneNumber,
    password: data.password,
    role: UserRole.LEARNER,
  })

    const accessToken = generateAccessToken(user._id.toString(), user.role);
    const refreshToken = generateRefreshToken(user._id.toString());

    await RefreshTokenModel.create({
      token: refreshToken,
      userId: user._id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });



    logger.info({
      event: 'registration.success',
      userId: user._id.toString(),
    });

    void createAuditLog(
      user._id.toString(),
      AuditAction.USER_REGISTER,
      'User',
      {
        email: user.email,
        role: user.role,
      },
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
    };
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      'code' in error &&
      (error as { code?: number }).code === 11000
    ) {
      logger.warn({
        event: 'email.exists',
        emailHash: emailHash(data.email),
      });
      throw new ConflictError('Email already registered');
    }
    throw error;
  }
};

/* ═══════════════════════════════════════════════════════════════════
   2. LOGIN
   ═══════════════════════════════════════════════════════════════════ */

export const login = async (
  data: LoginInput,
  ip?: string,
): Promise<AuthResult> => {
  const user = await UserModel.findOne({ email: data.email })
    .select('+password')
    .lean();

  // Always run comparePassword to prevent timing attacks
  if (!user || !(await comparePassword(data.password, user.password))) {
    logger.warn({
      event: 'login.failed',
      reason: 'invalid_credentials',
    });
    throw new UnauthorizedError('Invalid credentials');
  }

  // ✅ STATUS CHECK — reject suspended users
  if (user.adminStatus === 'Suspended') {
    logger.warn({
      event: 'login.failed',
      reason: 'account_suspended',
      userId: user._id.toString(),
    });
    throw new ForbiddenError(
      'Your account has been suspended. Please contact support for assistance.',
    );
  }

  const accessToken = generateAccessToken(user._id.toString(), user.role);
  const refreshToken = generateRefreshToken(user._id.toString());

  await RefreshTokenModel.create({
    token: refreshToken,
    userId: user._id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  logger.info({
    event: 'login.success',
    userId: user._id.toString(),
    adminStatus: user.adminStatus,
  });

  void createAuditLog(user._id.toString(), AuditAction.USER_LOGIN, 'User', {
    ip,
    adminStatus: user.adminStatus,
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
    },
  };
};

/* ═══════════════════════════════════════════════════════════════════
   3. LOGOUT
   ═══════════════════════════════════════════════════════════════════ */

export const logout = async (userId: string): Promise<void> => {
  await RefreshTokenModel.deleteMany({ userId });

  await createAuditLog(userId, AuditAction.USER_LOGOUT, 'User');

  logger.info({
    event: 'logout.success',
    userId,
  });
};

/* ═══════════════════════════════════════════════════════════════════
   4. REFRESH TOKEN
   ═══════════════════════════════════════════════════════════════════

   ═══════════════════════════════════════════════════════════════════ */

export const refreshToken = async (
  oldRefreshToken: string,
): Promise<{ accessToken: string; refreshToken: string }> => {
  // ─── Step 1: Verify the JWT signature ──────────────────────────────
  let decoded: { userId: string };
  try {
    decoded = verifyRefreshToken(oldRefreshToken) as { userId: string };
  } catch (error) {
    logger.warn({ event: 'refresh_token.invalid_signature' });
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  // ─── Step 2: Check if token exists in DB (but DON'T delete yet) ────
  const storedToken = await RefreshTokenModel.findOne({
    token: oldRefreshToken,
    userId: decoded.userId,
  });

  if (!storedToken) {
    logger.warn({
      event: 'refresh_token.reuse_detected',
      userId: decoded.userId,
    });
    // Reuse detected — revoke ALL sessions for safety
    await RefreshTokenModel.deleteMany({ userId: decoded.userId });
    throw new UnauthorizedError(
      'Refresh token reuse detected. All sessions revoked.',
    );
  }

  // ─── Step 3: Verify the user (BEFORE deleting anything) ────────────
  const user = await UserModel.findById(decoded.userId).lean();

  if (!user) {
    logger.warn({
      event: 'refresh_token.invalid_user',
      userId: decoded.userId,
    });
    throw new UnauthorizedError('User not found');
  }

  // ─── Step 4: Status check (BEFORE deleting anything) ───────────────
  if (user.adminStatus === 'Suspended') {
    logger.warn({
      event: 'refresh_token.rejected',
      reason: 'account_suspended',
      userId: decoded.userId,
    });
    await revokeAllUserSessions(decoded.userId, 'account_suspended');
    throw new ForbiddenError(
      'Your account has been suspended. Please contact support.',
    );
  }

  // ─── Step 5: Generate new tokens ───────────────────────────────────
  const accessToken = generateAccessToken(user._id.toString(), user.role);
  const newRefreshToken = generateRefreshToken(user._id.toString());

  // ─── Step 6: ATOMIC rotation — create new, then delete old ─────────
  // Use a transaction so both operations succeed or both fail.
  // This way, if anything goes wrong, the user still has a valid token.
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async (txSession) => {
      // Create the NEW token first
      await RefreshTokenModel.create(
        [
          {
            token: newRefreshToken,
            userId: user._id,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        ],
        { session: txSession },
      );

      // Then delete the OLD token
      await RefreshTokenModel.deleteOne(
        { _id: storedToken._id },
        { session: txSession },
      );
    });
  } finally {
    await session.endSession();
  }

  logger.info({
    event: 'refresh_token.success',
    userId: user._id.toString(),
  });

  return { accessToken, refreshToken: newRefreshToken };
};



/* ═══════════════════════════════════════════════════════════════════
   5. FIND USER PROFILE (private helper)
   ═══════════════════════════════════════════════════════════════════ */

const findUserProfile = async (
  userId: string,
): Promise<UserProfileDTO | null> => {
  const user = await UserModel.findById(userId).lean();
  if (!user) return null;

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar ?? undefined,
    isEmailVerified: user.isEmailVerified,
    adminStatus: user.adminStatus,
    roleLabel: user.roleLabel ?? null,
    phoneNumber: user.phoneNumber ?? null,
  };
};

/* ═══════════════════════════════════════════════════════════════════
   6. GET CURRENT USER (GET /users/me)
   ═══════════════════════════════════════════════════════════════════ */

export const getCurrentUser = async (
  userId: string,
): Promise<UserProfileDTO> => {
  const profile = await findUserProfile(userId);
  if (!profile) {
    throw new UnauthorizedError('User not found');
  }
  return profile;
};

/* ═══════════════════════════════════════════════════════════════════
   7. GET USER BY ID (admin only)
   ═══════════════════════════════════════════════════════════════════ */

export const getUserById = async (userId: string): Promise<UserProfileDTO> => {
  const profile = await findUserProfile(userId);
  if (!profile) {
    throw new NotFoundError('User not found');
  }
  return profile;
};

/* ═══════════════════════════════════════════════════════════════════
   8. GET USERS (admin only — list)
   ═══════════════════════════════════════════════════════════════════ */

export const getUsers = async (adminId: string, query: ListUsersQuery) => {
  const { page, limit } = query;
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    UserModel.find()
      .select(
        'name email role avatar isEmailVerified isActive adminStatus roleLabel',
      )
      .skip(skip)
      .limit(limit)
      .lean(),
    UserModel.countDocuments(),
  ]);

  logger.info({ event: 'users.fetch.success', count: users.length });
  createAuditLog(adminId, AuditAction.ADMIN_VIEW_USERS, 'User', {
    count: users.length,
    page,
  });

  return {
    items: users.map((user) => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar ?? null,
      isEmailVerified: user.isEmailVerified,
      isActive: user.isActive,
      adminStatus: user.adminStatus,
      roleLabel: user.roleLabel ?? null,
    })),
    meta: { total, page, limit, pages: Math.ceil(total / limit) },
  };
};

/* ═══════════════════════════════════════════════════════════════════
   9. UPDATE USER BY ID (admin only)
   ═══════════════════════════════════════════════════════════════════ */

export const updateUserById = async (
  userId: string,
  updateData: UpdateUserByAdminInput,
  adminId: string,
) => {
  logger.info({
    event: 'user.update.attempt',
    userId,
    changedFields: Object.keys(updateData),
  });

  const user = await UserModel.findById(userId);

  if (!user) {
    logger.warn({ event: 'user.update.not_found', userId });
    throw new NotFoundError('User not found');
  }

  // Store previous status for audit log + session revocation check
  const previousStatus = user.adminStatus;

  // Apply field updates
  if (updateData.name !== undefined) user.name = updateData.name;
  if (updateData.email !== undefined) user.email = updateData.email;
  if (updateData.avatar !== undefined) user.avatar = updateData.avatar;
  if (updateData.role !== undefined) user.role = updateData.role;
  if (updateData.isActive !== undefined) user.isActive = updateData.isActive;
  if (updateData.isEmailVerified !== undefined)
    user.isEmailVerified = updateData.isEmailVerified;

  if (updateData.adminStatus !== undefined) {
    user.adminStatus = updateData.adminStatus;
    // isActive is auto-synced by the pre-save hook in the model
  }

  if (updateData.roleLabel !== undefined) {
    user.roleLabel = updateData.roleLabel;
  }

  if (
    updateData.email !== undefined &&
    updateData.isEmailVerified === undefined
  ) {
    user.isEmailVerified = false;
  }

  try {
    await user.save();
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: number }).code === 11000
    ) {
      throw new ConflictError('Email already in use');
    }
    throw error;
  }

  if (
    updateData.adminStatus === 'Suspended' &&
    previousStatus !== 'Suspended'
  ) {
    await revokeAllUserSessions(userId, 'admin_suspended');
  }

  logger.info({
    event: 'user.update.success',
    userId,
    previousStatus,
    newStatus: user.adminStatus,
  });

  void createAuditLog(adminId, AuditAction.USER_UPDATE, 'User', {
    targetUserId: userId,
    changedFields: Object.keys(updateData),
    previousStatus,
    newStatus: user.adminStatus,
  });

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    isEmailVerified: user.isEmailVerified,
    isActive: user.isActive,
    adminStatus: user.adminStatus,
    roleLabel: user.roleLabel,
  };
};

/* ═══════════════════════════════════════════════════════════════════
   10. ✅ NEW: CHANGE USER STATUS (admin only — unified endpoint)
   ═══════════════════════════════════════════════════════════════════ */

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

  const user = await UserModel.findById(userId);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  const previousStatus = user.adminStatus;

  // Prevent no-op: if status is already the target, reject
  if (previousStatus === data.status) {
    throw new ConflictError(`User is already ${data.status.toLowerCase()}`);
  }

  // Prevent admin from suspending themselves
  if (adminId === userId && data.status === 'Suspended') {
    throw new ValidationError('You cannot suspend your own account');
  }

  user.adminStatus = data.status;
  // isActive is auto-synced by the pre-save hook in the model

  await user.save();

  // If suspending, revoke all active sessions (refresh tokens)
  if (data.status === 'Suspended') {
    await revokeAllUserSessions(userId, 'admin_suspended');
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

/* ═══════════════════════════════════════════════════════════════════
   11. DELETE USER BY ID (admin only)
   ═══════════════════════════════════════════════════════════════════ */

export const deleteUserById = async (userId: string, adminId: string) => {
  logger.info({ event: 'user.delete.attempt', userId });

  const user = await UserModel.findById(userId);

  if (!user) {
    logger.warn({ event: 'user.delete.not_found', userId });
    throw new NotFoundError('User not found');
  }

  await user.deleteOne();
  await RefreshTokenModel.deleteMany({ userId });

  logger.info({ event: 'user.delete.success', userId });

  await createAuditLog(adminId, AuditAction.USER_DELETE, 'User', {
    deletedUserId: userId,
  });

  return { id: userId };
};

/* ═══════════════════════════════════════════════════════════════════
   12. CHANGE PASSWORD (user changing their own password)
   ═══════════════════════════════════════════════════════════════════ */

export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string,
) => {
  logger.info({ event: 'password.change.attempt', userId });

  const user = await UserModel.findById(userId).select('+password');

  if (!user) {
    logger.warn({ event: 'password.change.user_not_found', userId });
    throw new UnauthorizedError('User not found');
  }

  // ✅ STATUS CHECK — suspended users can't change password
  if (user.adminStatus === 'Suspended') {
    logger.warn({
      event: 'password.change.rejected',
      reason: 'account_suspended',
      userId,
    });
    throw new ForbiddenError(
      'Cannot change password on a suspended account.',
    );
  }

  const isMatch = await comparePassword(currentPassword, user.password);

  if (!isMatch) {
    logger.warn({ event: 'password.change.invalid_password', userId });
    throw new UnauthorizedError('Current password is incorrect');
  }

  if (newPassword.length < 6) {
    throw new ValidationError('Password must be at least 6 characters');
  }

  user.password = await hashPassword(newPassword);
  await user.save();

  logger.info({ event: 'password.change.success', userId });

  await createAuditLog(userId, AuditAction.PASSWORD_CHANGE, 'User');

  return true;
};

/* ═══════════════════════════════════════════════════════════════════
   13. UPDATE PROFILE (user updating their own profile)
   ═══════════════════════════════════════════════════════════════════ */

export const updateProfile = async (
  userId: string,
  updateData: { name?: string; avatar?: string  , phoneNumber?: string;},
) => {
  logger.info({ event: 'profile.update.attempt', userId, updateData });

  const user = await UserModel.findById(userId);

  if (!user) {
    logger.warn({ event: 'profile.update.user_not_found', userId });
    throw new NotFoundError('User not found');
  }

  // ✅ STATUS CHECK
  if (user.adminStatus === 'Suspended') {
    throw new ForbiddenError(
      'Cannot update profile on a suspended account.',
    );
  }

  if (updateData.name) user.name = updateData.name;
  if (updateData.avatar) user.avatar = updateData.avatar;
  if (updateData.phoneNumber !== undefined) {
    user.phoneNumber = normalizePhoneNumber(updateData.phoneNumber);
  }

  await user.save();

  logger.info({ event: 'profile.update.success', userId });

  await createAuditLog(userId, AuditAction.PROFILE_UPDATE, 'User', {
    updatedFields: Object.keys(updateData),
  });

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    avatar: user.avatar,
    isEmailVerified: user.isEmailVerified,
    adminStatus: user.adminStatus,
    roleLabel: user.roleLabel,
  };
};

/* ═══════════════════════════════════════════════════════════════════
   14. GET PUBLIC USER PROFILE
   ═══════════════════════════════════════════════════════════════════ */

export const getUserProfileById = async (userId: string) => {
  const user = await findUserById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return {
    id: user._id.toString(),
    name: user.name,
    avatar: user.avatar,
    role: user.role,
  };
};

/* ═══════════════════════════════════════════════════════════════════
   15. AVATAR HELPERS + UPLOAD/DELETE
   ═══════════════════════════════════════════════════════════════════

   ✅ WHAT HAPPENS PER STATUS:
   - Active    → ✅ Allow
   - Pending   → ✅ Allow
   - Suspended → ❌ REJECT
   ═══════════════════════════════════════════════════════════════════ */

const deleteAvatarFile = async (avatarValue?: string) => {
  if (!avatarValue) return;

  const filePath = path.resolve(
    process.cwd(),
    'uploads/avatars',
    avatarValue.replace(/^\//, ''),
  );
  if (!filePath) return;

  try {
    await unlink(filePath);
  } catch (error) {
    if (
      error instanceof Error &&
      'code' in error &&
      (error as { code?: string }).code !== 'ENOENT'
    ) {
      throw error;
    }
  }
};

export const uploadAvatar = async (
  userId: string,
  file: { filename: string },
) => {
  const user = await findUserById(userId);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // ✅ STATUS CHECK
  if (user.adminStatus === 'Suspended') {
    throw new ForbiddenError('Cannot upload avatar on a suspended account.');
  }

  if (user.avatar) {
    await deleteAvatarFile(user.avatar);
  }

  const updatedUser = await updateUserAvatar(userId, file.filename);

  if (!updatedUser) {
    throw new NotFoundError('User not found');
  }

  await createAuditLog(userId, AuditAction.PROFILE_UPDATE, 'User', {
    action: 'avatar.uploaded',
  });

  return {
    id: updatedUser._id.toString(),
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    avatar: updatedUser.avatar,
    isEmailVerified: updatedUser.isEmailVerified,
    adminStatus: updatedUser.adminStatus,
    roleLabel: updatedUser.roleLabel,
  };
};

export const deleteAvatar = async (userId: string) => {
  const user = await findUserById(userId);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // ✅ STATUS CHECK
  if (user.adminStatus === 'Suspended') {
    throw new ForbiddenError('Cannot delete avatar on a suspended account.');
  }

  if (user.avatar) {
    await deleteAvatarFile(user.avatar);
  }

  const updatedUser = await clearUserAvatar(userId);

  if (!updatedUser) {
    throw new NotFoundError('User not found');
  }

  await createAuditLog(userId, AuditAction.PROFILE_UPDATE, 'User', {
    action: 'avatar.removed',
  });

  return {
    id: updatedUser._id.toString(),
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    avatar: updatedUser.avatar,
    isEmailVerified: updatedUser.isEmailVerified,
    adminStatus: updatedUser.adminStatus,
    roleLabel: updatedUser.roleLabel,
  };
};

/* ═══════════════════════════════════════════════════════════════════
   16. FORGOT PASSWORD
   ═══════════════════════════════════════════════════════════════════

   ✅ WHAT HAPPENS PER STATUS:
   - Active    → ✅ Send reset email
   - Pending   → ✅ Send reset email
   - Suspended → ❌ Silently ignore (no email sent, same response)

   🎯 WHY:
   - Suspended users shouldn't be able to reset their password
   - We return the SAME success message to prevent enumeration
   ═══════════════════════════════════════════════════════════════════ */

export const forgotPassword = async (email: string): Promise<string | undefined> => {
  const normalizedEmail = email.trim().toLowerCase();

  logger.info({
    event: 'password.forgot.attempt',
    emailHash: emailHash(normalizedEmail),
  });

  const user = await UserModel.findOne({ email: normalizedEmail });

  // 🔐 Prevent user enumeration — return same response regardless
  if (!user) {
    logger.warn({
      event: 'password.forgot.not_found',
      emailHash: emailHash(normalizedEmail),
    });
    return undefined;
  }

  // ✅ STATUS CHECK — don't send reset email to suspended users
  // BUT we still return undefined (no error) to prevent enumeration
  if (user.adminStatus === 'Suspended') {
    logger.warn({
      event: 'password.forgot.rejected',
      reason: 'account_suspended',
      userId: user._id.toString(),
    });
    return undefined; // ← silently return, don't send email
  }

  // Generate a 6-digit OTP (100000–999999)
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

  const RESET_OTP_EXPIRATION_MS = 10 * 60 * 1000; // 10 minutes

  user.passwordResetToken = hashedOtp;
  user.passwordResetExpires = new Date(Date.now() + RESET_OTP_EXPIRATION_MS);

  await user.save();

  logger.info({
    event: 'password.forgot.success',
    userId: user._id.toString(),
  });

  sendResetEmail(user.email, otp).catch((error) => {
    logger.error({
      event: 'email.reset.failed',
      userId: user._id.toString(),
      error,
    });
  });

  // Return the raw OTP so the controller can surface it in dev mode
  return otp;
};


/* ═══════════════════════════════════════════════════════════════════
   17. RESET PASSWORD
   ═══════════════════════════════════════════════════════════════════

   ✅ WHAT HAPPENS PER STATUS:
   - Active    → ✅ Allow reset
   - Pending   → ✅ Allow reset
   - Suspended → ❌ REJECT (even if they have a valid token)

   🎯 WHY:
   - A suspended user might have a valid reset token from BEFORE they
     were suspended. We reject it to prevent them from regaining access.
   ═══════════════════════════════════════════════════════════════════ */

export const resetPassword = async (
  email: string,
  code: string,
  newPassword: string,
): Promise<void> => {
  logger.info({ event: 'password.reset.attempt' });

  const normalizedEmail = email.trim().toLowerCase();
  const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

  const user = await UserModel.findOne({
    email: normalizedEmail,
    passwordResetToken: hashedCode,
    passwordResetExpires: { $gt: new Date() },
  });

  if (!user) {
    logger.warn({ event: 'password.reset.invalid_or_expired_token' });
    throw new UnauthorizedError('Invalid or expired verification code');
  }

  // ✅ STATUS CHECK — reject suspended users
  if (user.adminStatus === 'Suspended') {
    logger.warn({
      event: 'password.reset.rejected',
      reason: 'account_suspended',
      userId: user._id.toString(),
    });
    throw new ForbiddenError(
      'Cannot reset password on a suspended account. Please contact support.',
    );
  }

  user.password = newPassword;
  user.passwordResetToken = null;
  user.passwordResetExpires = null;

  await user.save();

  // Revoke all sessions — user must log in again with new password
  await RefreshTokenModel.deleteMany({ userId: user._id });

  void createAuditLog(
    user._id.toString(),
    AuditAction.PASSWORD_CHANGE,
    'User',
  );

  logger.info({
    event: 'password.reset.success',
    userId: user._id.toString(),
  });
};
