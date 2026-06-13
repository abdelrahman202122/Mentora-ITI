/* eslint-disable @typescript-eslint/consistent-type-imports */
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/JWT.js';

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
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
      role: string;
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