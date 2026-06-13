/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/consistent-type-imports */

import { Request, Response } from 'express';
import { logger } from '../../config/logger.js';
import { UserService } from './user.service.js';
import { cookieOptions } from '../../config/cookie.config.js';



export class UserController {
  static async register(
    req: Request,
    res: Response
  ): Promise<void> {

      const user =
        await UserService.register(req.body);

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
        data:user.user
      });

  }


static async login(req: Request, res: Response): Promise<void> {
  const result = await UserService.login(req.body.email, req.body.password);
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
  res.status(200).json({ success: true, data: result.user });
}



static async logout(
  req: Request,
  res: Response
): Promise<void> {
  try {
  const userId = req.user?.userId;


    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    await UserService.logout(userId);

    res.clearCookie('accessToken');

    res.clearCookie('refreshToken');

    logger.info('Logout completed');

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error: any) {
    logger.error(
      `Logout failed: ${error.message}`
    );

    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}


  static async refreshToken(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const refreshToken =
        req.cookies.refreshToken;

      if (!refreshToken) {
        logger.warn(
          'Refresh token missing'
        );

        res.status(401).json({
          success: false,
          message:
            'Refresh token missing',
        });
        return;
      }

      const tokens =
        await UserService.refreshToken(
          refreshToken
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

      logger.info(
        'Refresh token completed successfully'
      );

      res.status(200).json({
        success: true,
      });
    } catch (error: any) {
      logger.error(
        `Refresh token failed: ${error.message}`
      );

      res.status(401).json({
        success: false,
        message:
          'Invalid refresh token',
      });
    }
  }
}
