import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../../../common/errors/AppError.js';
import * as adminUserService from './admin-user.service.js';
import {
  listAdminUsersQuerySchema,
  createAdminUserSchema,
  updateAdminUserSchema,
  listAuditLogsQuerySchema
} from './admin-user.validation.js';

/* Helper: extract adminId from req.user or throw */
const requireAdminId = (req: Request): string => {
  const adminId = req.user?.userId;
  if (!adminId) throw new UnauthorizedError('Unauthorized');
  return adminId;
};

/* ───────── 1. GET /api/admin/users ───────── */

export const listUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const adminId = requireAdminId(req);
    const query = listAdminUsersQuerySchema.parse(req.query);
    const result = await adminUserService.listUsers(adminId, query);

    res.status(200).json({
      success: true,
      data: result.items,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

/* ───────── 2. GET /api/admin/users/:id ───────── */

export const getUserDetail = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const adminId = requireAdminId(req);
    const userId = req.params.id;
    const user = await adminUserService.getUserDetail(adminId, userId);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/* ───────── 3. POST /api/admin/users ───────── */

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const adminId = requireAdminId(req);
    const data = createAdminUserSchema.parse(req.body);
    const user = await adminUserService.createUser(adminId, data);

    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/* ───────── 4. PATCH /api/admin/users/:id ───────── */

export const updateUser = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const adminId = requireAdminId(req);
    const userId = req.params.id;
    const data = updateAdminUserSchema.parse(req.body);
    const user = await adminUserService.updateUser(adminId, userId, data);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/* ───────── 5. PATCH /api/admin/users/:id/status ───────── */


import { changeUserStatusSchema } from './admin-user.validation.js';

/* PATCH /api/admin/users/:id/status */
export const changeUserStatus = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const adminId = requireAdminId(req);
    const userId = req.params.id;
    const data = changeUserStatusSchema.parse(req.body);
    const result = await adminUserService.changeUserStatus(
      adminId,
      userId,
      data,
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};



/* ───────── 6. GET /api/admin/users/export ───────── */

export const exportUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const adminId = requireAdminId(req);
    const query = listAdminUsersQuerySchema.parse(req.query);
    const csv = await adminUserService.exportUsersCsv(adminId, query);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="users-export.csv"',
    );
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};



/* ✅ NEW: GET /api/admin/users/:id/audit-logs */
export const getUserAuditLogs = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const adminId = requireAdminId(req);
    const userId = req.params.id;
    const query = listAuditLogsQuerySchema.parse(req.query);
    const result = await adminUserService.getUserAuditLogs(
      adminId,
      userId,
      query,
    );

    res.status(200).json({
      success: true,
      data: result.items,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};
