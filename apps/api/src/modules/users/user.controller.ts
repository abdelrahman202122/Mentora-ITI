/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/consistent-type-imports */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../../config/logger.js';
import { cookieOptions } from '../../config/cookie.config.js';
import * as userService from './user.service.js';
import { UnauthorizedError } from '../../common/errors/AppError.js';
import { listUsersQuerySchema } from './user.validation.js';


export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user =
      await userService.register(
        req.body
      );

    res.cookie(
      'accessToken',
      user.accessToken,
      cookieOptions.accessToken
    );

    res.cookie(
      'refreshToken',
      user.refreshToken,
      cookieOptions.refreshToken
    );

    res.status(201).json({
      success: true,
      message:
        'User registered successfully',
      data: user.user,
    });
  } catch (error) {
    next(error);
  }
};
      
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result =
      await userService.login(
        req.body,
        req.ip
      );

    res.cookie(
      'accessToken',
      result.accessToken,
      cookieOptions.accessToken
    );

    res.cookie(
      'refreshToken',
      result.refreshToken,
      cookieOptions.refreshToken
    );

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
  next: NextFunction
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

    res.clearCookie(
      'accessToken'
    );

    res.clearCookie(
      'refreshToken'
    );

    logger.info({
      event: 'logout.completed',
      userId,
    });

    res.status(200).json({
      success: true,
      message:
        'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
}

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const oldRefreshToken =
      req.cookies.refreshToken;

    if (!oldRefreshToken) {
      logger.warn({
        event: 'refresh_token.missing',
      });

      throw new UnauthorizedError(
        'Refresh token missing'
      );
    }

    const tokens =
      await userService.refreshToken(
        oldRefreshToken
      );

    res.cookie(
      'accessToken',
      tokens.accessToken,
      cookieOptions.accessToken
    );

    res.cookie(
      'refreshToken',
      tokens.refreshToken,
      cookieOptions.refreshToken
    );

    logger.info({
      event: 'refresh_token.completed',
    });

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    next(error);
  }
};




export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new UnauthorizedError(
        'Unauthorized'
      );
    }

    const user =
      await userService.getCurrentUser(
        userId
      );

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
  next: NextFunction
): Promise<void> => {
  try {

    const rawId = req.params.id
    const userId = Array.isArray(rawId)? rawId[0]: rawId
    const user = await userService.getUserById(
      userId
    );

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
  next: NextFunction
): Promise<void> => {
  try {
    const adminId = req.user?.userId;
    if (!adminId) throw new UnauthorizedError('Unauthorized');

    const query = listUsersQuerySchema.parse(req.query);
    const result = await userService.getUsers(adminId, query);

    res.status(200).json({ success: true, data: result.items, meta: result.meta });
  } catch (error) {
    next(error);
  }
};



// // PATCH /users/:id

export const updateUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {

    const adminId = req.user?.userId
    if (!adminId) {
      throw new UnauthorizedError('Unauthorized');
    }
    const rawId = req.params.id
    const userId = Array.isArray(rawId)? rawId[0]: rawId
    const user = await userService.updateUserById(
      userId,
      req.body,
      adminId
    );

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
  next: NextFunction
): Promise<void> => {
  try {
    const adminId = req.user?.userId
    if (!adminId) {
      throw new UnauthorizedError('Unauthorized');
    }
    const rawId = req.params.id
    const userId = Array.isArray(rawId)? rawId[0]: rawId
    await userService.deleteUserById(userId,adminId);

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
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new UnauthorizedError('Unauthorized');
    }

    const { currentPassword, newPassword } = req.body;

    await userService.changePassword(
      userId,
      currentPassword,
      newPassword
    );

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
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new UnauthorizedError('Unauthorized');
    }

    const user = await userService.updateProfile(
      userId,
      req.body
    );

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};