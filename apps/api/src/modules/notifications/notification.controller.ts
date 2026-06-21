import type { NextFunction, Request, Response } from 'express';

import { UnauthorizedError } from '../../common/errors/AppError.js';
import { getSocketServer } from '../../config/socket.js';
import { sendSuccess } from '../../utils/api-response.js';
import type { ListNotificationsQuery } from '../../validators/notification.js';
import {
  emitNotificationRead,
  emitNotificationsReadAll,
} from './notification.socket.js';
import * as notificationService from './notification.service.js';

function getAuthenticatedUserId(req: Request) {
  if (!req.user?.userId) {
    throw new UnauthorizedError('User not authenticated');
  }

  return req.user.userId;
}

export async function listNotifications(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = getAuthenticatedUserId(req);
    const result = await notificationService.listNotifications(
      userId,
      req.query as unknown as ListNotificationsQuery,
    );
    return sendSuccess(
      res,
      200,
      'Notifications retrieved successfully',
      result,
    );
  } catch (error) {
    next(error);
  }
}

export async function getUnreadCount(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = getAuthenticatedUserId(req);
    const result = await notificationService.getUnreadCount(userId);
    return sendSuccess(
      res,
      200,
      'Unread notification count retrieved successfully',
      result,
    );
  } catch (error) {
    next(error);
  }
}

export async function markNotificationRead(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = getAuthenticatedUserId(req);
    const { notificationId } = req.params as { notificationId: string };
    const notification = await notificationService.markNotificationRead(
      notificationId,
      userId,
    );
    emitNotificationRead(getSocketServer(), userId, notification);
    return sendSuccess(
      res,
      200,
      'Notification marked as read',
      notification,
    );
  } catch (error) {
    next(error);
  }
}

export async function markAllNotificationsRead(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = getAuthenticatedUserId(req);
    const result = await notificationService.markAllNotificationsRead(userId);
    emitNotificationsReadAll(getSocketServer(), userId, result);
    return sendSuccess(
      res,
      200,
      'All notifications marked as read',
      result,
    );
  } catch (error) {
    next(error);
  }
}
