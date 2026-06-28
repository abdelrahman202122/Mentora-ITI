/* eslint-disable @typescript-eslint/consistent-type-imports */
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/JWT.js';
import { type UserRole } from '../modules/users/user.interface.js';

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const decoded = verifyAccessToken(token) as {
      userId: string;
      role: UserRole;
    };

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: `Invalid or expired token ${error}`,
    });
  }
};

// this middleware is used for public endpoints that return different data based on user role
export const optionalAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies.accessToken;

    if (token) {
      const decoded = verifyAccessToken(token) as {
        userId: string;
        role: UserRole;
      };

      req.user = {
        userId: decoded.userId,
        role: decoded.role,
      };
    }

    next();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // invalid token, just continue as unauthenticated
    next();
  }
};
