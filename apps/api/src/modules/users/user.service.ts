/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */

import {
  ConflictError,
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
import { ListUsersQuery, UpdateUserByAdminInput } from './user.validation.js';
import { RegisterInput, LoginInput } from './user.validation.js';

export const register = async (
  data: RegisterInput
): Promise<AuthResult> => {

  try {
    logger.info({ event: 'registration.attempt', emailHash: emailHash(data.email) });

    const user = await UserModel.create({
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
    });

    const accessToken =
      generateAccessToken(
        user._id.toString(),
        user.role
      );

    const refreshToken =
      generateRefreshToken(
        user._id.toString()
      );

    await RefreshTokenModel.create({
      token: refreshToken,
      userId: user._id,
      expiresAt: new Date(
        Date.now() +
          7 * 24 * 60 * 60 * 1000
      ),
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
      }
    );
    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      'code' in error &&
      (error as { code?: number })
        .code === 11000
    ) {
      logger.warn({
        event: 'email.exists',
        emailHash: emailHash(
          data.email
        ),
      });

      throw new ConflictError(
        'Email already registered'
      );
    }

    throw error;
  }
};


export const login = async (
  data: LoginInput,
  ip?: string
): Promise<AuthResult> => {
  const user = await UserModel.findOne({ email: data.email }).select('+password').lean();

  if (
    !user ||
    !(await comparePassword(
      data.password,
      user.password
    ))
  ) {
    logger.warn({
      event: 'login.failed',
      reason: 'invalid_credentials',
    });

    throw new UnauthorizedError(
      'Invalid credentials'
    );
  }

  const accessToken =
    generateAccessToken(
      user._id.toString(),
      user.role
    );

  const refreshToken =
    generateRefreshToken(
      user._id.toString()
    );

  await RefreshTokenModel.create({
    token: refreshToken,
    userId: user._id,
    expiresAt: new Date(
      Date.now() +
        7 * 24 * 60 * 60 * 1000
    ),
  });

  logger.info({
    event: 'login.success',
    userId: user._id.toString(),
  });


  void createAuditLog(
    user._id.toString(),
    AuditAction.USER_LOGIN,
    'User',
    {
      ip
    }
  );

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

export const logout = async (
  userId: string
): Promise<void> => {
  await RefreshTokenModel.deleteMany({
    userId,
  });

  await createAuditLog(
  userId,
  AuditAction.USER_LOGOUT,
  'User'
);

  logger.info({
    event: 'logout.success',
    userId,
  });
};


export const refreshToken = async (
  oldRefreshToken: string,
): Promise<{
  accessToken: string;
  refreshToken: string;
}> => {
  let decoded: { userId: string };
  try {
    decoded = verifyRefreshToken(oldRefreshToken) as { userId: string };
  } catch (error) {
    logger.warn({ event: 'refresh_token.invalid_signature' });
    throw new UnauthorizedError('Invalid or expired refresh token');
  }
  // 2. Check token exists in DB
  const storedToken =
    await RefreshTokenModel.findOne({
      token: oldRefreshToken,
      userId: decoded.userId,
    });

  if (!storedToken) {
    logger.warn({
      event: 'refresh_token.reuse_detected',
      userId: decoded.userId,
    });

    // Revoke all sessions
    await RefreshTokenModel.deleteMany({
      userId: decoded.userId,
    });

    throw new UnauthorizedError(
      'Refresh token reuse detected. All sessions revoked.'
    );
  }

  // 3. Rotate token
  await storedToken.deleteOne();

  // 4. Verify user
  const user =
    await UserModel.findById(
      decoded.userId
    ).lean();

  if (!user || !user.isActive) {
    logger.warn({
      event: 'refresh_token.invalid_user',
      userId: decoded.userId,
    });

    throw new UnauthorizedError(
      'User not found or deactivated'
    );
  }

  // 5. Generate new tokens
  const accessToken =
    generateAccessToken(
      user._id.toString(),
      user.role
    );

  const refreshToken =
    generateRefreshToken(
      user._id.toString()
    );

  await RefreshTokenModel.create({
    token: refreshToken,
    userId: user._id,
    expiresAt: new Date(
      Date.now() +
        7 * 24 * 60 * 60 * 1000
    ),
  });

  logger.info({
    event: 'refresh_token.success',
    userId: user._id.toString(),
  });

  return {
    accessToken,
    refreshToken,
  };
};



const findUserProfile = async (userId: string): Promise<UserProfileDTO | null> => {
  const user = await UserModel.findById(userId).populate('tutorProfile').lean();
  if (!user) return null;

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    isEmailVerified: user.isEmailVerified,
    tutorProfile: user.tutorProfile,
  };
};


export const getCurrentUser = async (userId: string): Promise<UserProfileDTO> => {
  const profile = await findUserProfile(userId);
  if (!profile) {
    throw new UnauthorizedError('User not found');
  }
  return profile;
};

//  GET /users/:id
export const getUserById = async (userId: string): Promise<UserProfileDTO> => {
  const profile = await findUserProfile(userId);
  if (!profile) {
    throw new NotFoundError('User not found');
  }
  return profile;
};


// GET /users

export const getUsers = async (adminId: string, query: ListUsersQuery) => {
  const { page, limit } = query;
  const skip = (page - 1) * limit;

 
  const [users, total] = await Promise.all([
    UserModel.find()
      .select('name email role avatar isEmailVerified isActive')
      .skip(skip)
      .limit(limit)
      .lean(),
    UserModel.countDocuments(),
  ]);

  logger.info({ event: 'users.fetch.success', count: users.length });
createAuditLog(adminId, AuditAction.ADMIN_VIEW_USERS, 'User', { count: users.length, page });

  return {
    items: users.map((user) => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified,
      isActive: user.isActive,
    })),
    meta: { total, page, limit, pages: Math.ceil(total / limit) },
  };
};


// PATCH /users/:id

export const updateUserById = async (
  userId: string,
  updateData: UpdateUserByAdminInput,
  adminId:string
) => {
  logger.info({
    event: 'user.update.attempt',
    userId,
    changedFields: Object.keys(updateData),
  });

  const user = await UserModel.findById(userId);

  if (!user) {
    logger.warn({
      event: 'user.update.not_found',
      userId,
    });

    throw new NotFoundError('User not found');
  }

    if (updateData.name !== undefined) user.name = updateData.name;
  if (updateData.email !== undefined) user.email = updateData.email;
  if (updateData.avatar !== undefined) user.avatar = updateData.avatar;
  if (updateData.role !== undefined) user.role = updateData.role;
  if (updateData.isActive !== undefined) user.isActive = updateData.isActive;
  if (updateData.isEmailVerified !== undefined) user.isEmailVerified = updateData.isEmailVerified;

  // If email changed, the new address is unverified until proven otherwise
  if (updateData.email !== undefined && updateData.isEmailVerified === undefined) {
    user.isEmailVerified = false;
  }

  try {
    await user.save();
  } catch (error: unknown) {
    if (
      typeof error === 'object' && error !== null &&
      'code' in error && (error as { code?: number }).code === 11000
    ) {
      throw new ConflictError('Email already in use');
    }
    throw error;
  }

  logger.info({ event: 'user.update.success', userId });

  void createAuditLog(adminId, AuditAction.USER_UPDATE, 'User', {
    targetUserId: userId,
    changedFields: Object.keys(updateData), // never log values
  });

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    isEmailVerified: user.isEmailVerified,
    isActive: user.isActive,
  };
};

//  DELETE /users/:id

export const deleteUserById = async (userId: string,adminId:string) => {
  logger.info({
    event: 'user.delete.attempt',
    userId,
  });

  const user = await UserModel.findById(userId);

  if (!user) {
    logger.warn({
      event: 'user.delete.not_found',
      userId,
    });

    throw new NotFoundError('User not found');
  }

  await user.deleteOne();

  // optional: also revoke sessions if needed
  await RefreshTokenModel.deleteMany({ userId });

  logger.info({
    event: 'user.delete.success',
    userId,
  });

  await createAuditLog(
    adminId,
    AuditAction.USER_DELETE,
    'User',
    {
      deletedUserId: userId,
    }
  );

  return {
    id: userId,
  };
};



// PATCH /users/change-password

export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
) => {
  logger.info({
    event: 'password.change.attempt',
    userId,
  });

  const user = await UserModel.findById(userId).select('+password');

  if (!user) {
    logger.warn({
      event: 'password.change.user_not_found',
      userId,
    });

    throw new UnauthorizedError('User not found');
  }

  const isMatch = await comparePassword(
    currentPassword,
    user.password
  );

  if (!isMatch) {
    logger.warn({
      event: 'password.change.invalid_password',
      userId,
    });

    throw new UnauthorizedError('Current password is incorrect');
  }

  if (newPassword.length < 6) {
    throw new ValidationError('Password must be at least 6 characters');
  }

  user.password = await hashPassword(newPassword);
  await user.save();

  logger.info({
    event: 'password.change.success',
    userId,
  });

  await createAuditLog(
    userId,
    AuditAction.PASSWORD_CHANGE,
    'User'
  );

  return true;
};



// PATCH /users/profile

export const updateProfile = async (
  userId: string,
  updateData: {
    name?: string;
    avatar?: string;
  }
) => {
  logger.info({
    event: 'profile.update.attempt',
    userId,
    updateData,
  });

  const user = await UserModel.findById(userId);

  if (!user) {
    logger.warn({
      event: 'profile.update.user_not_found',
      userId,
    });

    throw new NotFoundError('User not found');
  }

  if (updateData.name) {
    user.name = updateData.name;
  }

  if (updateData.avatar) {
    user.avatar = updateData.avatar;
  }

  await user.save();

  logger.info({
    event: 'profile.update.success',
    userId,
  });
  
  await createAuditLog(
  userId,
  AuditAction.PROFILE_UPDATE,
  'User',
  {
    updatedFields: Object.keys(updateData),
  }
);
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    isEmailVerified: user.isEmailVerified,
  };
};
