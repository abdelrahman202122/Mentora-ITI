/* eslint-disable @typescript-eslint/consistent-type-imports */
import {
  Request,
  Response,
  NextFunction,
} from 'express';
import { hasAnyRole } from '../modules/users/role.utils.js';

export const roleMiddleware =
  (...roles: string[]) =>
  (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    if (!hasAnyRole(req.user, roles)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden',
      });
    }

    next();
  };
