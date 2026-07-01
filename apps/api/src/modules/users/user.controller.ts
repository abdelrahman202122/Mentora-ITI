/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/consistent-type-imports */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../../config/logger.js';
import { cookieOptions } from '../../config/cookie.config.js';
import * as userService from './user.service.js';
import {
  UnauthorizedError,
  ValidationError,
} from '../../common/errors/AppError.js';
import { sendSuccess } from '../../utils/api-response.js';
import { listUsersQuerySchema } from './user.validation.js';
import { changeUserStatusSchema } from './user.validation.js';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = await userService.register(req.body);

    res.cookie('accessToken', user.accessToken, cookieOptions.accessToken);

    res.cookie('refreshToken', user.refreshToken, cookieOptions.refreshToken);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: user.user,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await userService.login(req.body, req.ip);

    res.cookie('accessToken', result.accessToken, cookieOptions.accessToken);

    res.cookie('refreshToken', result.refreshToken, cookieOptions.refreshToken);

    res.status(200).json({
      success: true,
      data: result.user,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });

      return;
    }

    await userService.logout(userId);

    res.clearCookie('accessToken');

    res.clearCookie('refreshToken');

    logger.info({
      event: 'logout.completed',
      userId,
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};


export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {

   const oldRefreshToken = req.cookies.refreshToken;
    if (!oldRefreshToken) {
      throw new UnauthorizedError('Refresh token missing');
    }
    const tokens = await userService.refreshToken(oldRefreshToken);
    res.cookie('accessToken', tokens.accessToken, cookieOptions.accessToken);
    res.cookie('refreshToken', tokens.refreshToken, cookieOptions.refreshToken);
    res.status(200).json({ success: true });
  } catch (error) {
 
    next(error);
  }
};



export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new UnauthorizedError('Unauthorized');
    }

    const user = await userService.getCurrentUser(userId);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

//  GET /users/:id

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const rawId = req.params.id;
    const userId = Array.isArray(rawId) ? rawId[0] : rawId;
    const user = await userService.getUserById(userId);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// GET /users

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const adminId = req.user?.userId;
    if (!adminId) throw new UnauthorizedError('Unauthorized');

    const query = listUsersQuerySchema.parse(req.query);
    const result = await userService.getUsers(adminId, query);

    res
      .status(200)
      .json({ success: true, data: result.items, meta: result.meta });
  } catch (error) {
    next(error);
  }
};

// // PATCH /users/:id

export const updateUserById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const adminId = req.user?.userId;
    if (!adminId) {
      throw new UnauthorizedError('Unauthorized');
    }
    const rawId = req.params.id;
    const userId = Array.isArray(rawId) ? rawId[0] : rawId;
    const user = await userService.updateUserById(userId, req.body, adminId);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

//  DELETE /users/:id

export const deleteUserById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const adminId = req.user?.userId;
    if (!adminId) {
      throw new UnauthorizedError('Unauthorized');
    }
    const rawId = req.params.id;
    const userId = Array.isArray(rawId) ? rawId[0] : rawId;
    await userService.deleteUserById(userId, adminId);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /users/change-password

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new UnauthorizedError('Unauthorized');
    }

    const { currentPassword, newPassword } = req.body;

    await userService.changePassword(userId, currentPassword, newPassword);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /users/profile

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new UnauthorizedError('Unauthorized');
    }

    const user = await userService.updateProfile(userId, req.body);

    sendSuccess(res, 200, 'Profile updated successfully', user);
  } catch (error) {
    next(error);
  }
};

//  get public user profile (name, avata, role only)
export const getUserProfileById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const rawId = req.params.id;
    const userId = Array.isArray(rawId) ? rawId[0] : rawId;
    const user = await userService.getUserProfileById(userId);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadAvatar = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new UnauthorizedError('Unauthorized');
    }

    if (!req.file) {
      throw new ValidationError('Avatar file is required');
    }

    // console.log(req.file);

    const user = await userService.uploadAvatar(userId, req.file);

    sendSuccess(res, 200, 'Avatar uploaded successfully', user);
  } catch (error) {
    next(error);
  }
};

export const deleteAvatar = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new UnauthorizedError('Unauthorized');
    }

    const user = await userService.deleteAvatar(userId);

    sendSuccess(res, 200, 'Avatar removed successfully', user);
  } catch (error) {
    next(error);
  }
};



export const forgotPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
try {
    const { email } = req.body;

    const resetToken = await userService.forgotPassword(email);

    // In development with no email credentials configured, expose the OTP
    // directly in the response so devs can test without a real email account.
    const isDev = process.env.NODE_ENV !== 'production';
    const hasEmailCreds = !!process.env.EMAIL_USER && !!process.env.EMAIL_PASS;
    const devCode =
      isDev && !hasEmailCreds && resetToken ? resetToken : undefined;

    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a verification code has been sent.',
      ...(devCode && { devCode }),
    });

} catch (error) {
    next(error);
}
};


export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
try {
const { email, code, newPassword } = req.body;

await userService.resetPassword(email, code, newPassword);

res.status(200).json({
  success: true,
  message: 'Password reset successfully. Please log in with your new password.',
});


} catch (error) {
next(error);
}
};



/* ✅ NEW: PATCH /users/:id/status — Change user status */
export const changeUserStatus = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const adminId = req.user?.userId;
    if (!adminId) {
      throw new UnauthorizedError('Unauthorized');
    }
    const userId = req.params.id;
    const data = changeUserStatusSchema.parse(req.body);
    const result = await userService.changeUserStatus(adminId, userId, data);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
