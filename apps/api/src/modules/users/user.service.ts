/* eslint-disable @typescript-eslint/consistent-type-imports */

import {
  ConflictError,
  UnauthorizedError,
} from '../../common/errors/AppError.js';
import { logger } from '../../config/logger.js';
import { emailHash } from '../../utils/emailHash.js';
import { comparePassword } from '../../utils/hashPassword.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../../utils/JWT.js';
import { RefreshTokenModel } from './refreshToken.model.js';
import { AuthResult, RegisterUserInput, UserRole } from './user.interface.js';
import { UserModel } from './user.model.js';

export class UserService {
  static async register(data: RegisterUserInput): Promise<AuthResult> {
    try {
      logger.info({
        event: 'registration.attempt',
        emailHash: emailHash(data.email),
      });
      const user = await UserModel.create({
        name: data.name,
        email: data.email,
        password: data.password,
        role: UserRole.LEARNER,
      });

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
        (error as { code?: number }).code === 11000
      ) {
        logger.warn({
          event: 'Email already exists:',
          emailHash: emailHash(data.email),
        });
        throw new ConflictError('Email already registered');
      }
      throw error;
    }
  }

  static async login(email: string, password: string): Promise<AuthResult> {
    const user = await UserModel.findOne({ email }).select('+password').lean();
    if (!user || !(await comparePassword(password, user.password))) {
      logger.warn({
        event: 'login.failed',
        reason: 'invalid_credentials',
      });
      throw new UnauthorizedError('Invalid credentials');
    }

    const accessToken = generateAccessToken(user._id.toString(), user.role);
    const refreshToken = generateRefreshToken(user._id.toString());

    await RefreshTokenModel.create({
      token: refreshToken,
      userId: user._id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    logger.info(`Login successful: ${user._id}`);
    logger.info({
      event: 'login.success',
      userId: user._id.toString(),
    });

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
  }

  static async logout(userId: string): Promise<void> {
    // Delete ALL refresh tokens for this user (logout from all devices)
    await RefreshTokenModel.deleteMany({ userId });
    logger.info(`Refresh tokens revoked for user: ${userId}`);
  }

  static async refreshToken(
    oldRefreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // 1. Verify the token signature
    const decoded = verifyRefreshToken(oldRefreshToken) as { userId: string };

    // 2. Check it exists in the database (not already revoked)
    const storedToken = await RefreshTokenModel.findOne({
      token: oldRefreshToken,
      userId: decoded.userId,
    });

    if (!storedToken) {
      // Token reuse detected — revoke ALL tokens for this user
      await RefreshTokenModel.deleteMany({ userId: decoded.userId });
      throw new UnauthorizedError(
        'Refresh token reuse detected. All sessions revoked.',
      );
    }

    // 3. Delete the old token (rotation)
    await storedToken.deleteOne();

    // 4. Verify user still exists and is active
    const user = await UserModel.findById(decoded.userId).lean();
    if (!user || !user.isActive) {
      throw new UnauthorizedError('User not found or deactivated');
    }

    // 5. Issue brand-new pair
    const newAccessToken = generateAccessToken(user._id.toString(), user.role);
    const newRefreshToken = generateRefreshToken(user._id.toString());

    await RefreshTokenModel.create({
      token: newRefreshToken,
      userId: user._id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }
}
