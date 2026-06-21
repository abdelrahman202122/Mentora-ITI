import { z } from 'zod';

import {
  notificationStatuses,
  notificationTypes,
} from '../modules/notifications/notification.model.js';
import { objectIdSchema } from './common.js';

export const listNotificationsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(notificationStatuses).optional(),
  type: z.enum(notificationTypes).optional(),
});

export const notificationIdParamsSchema = z.object({
  notificationId: objectIdSchema,
});

export type ListNotificationsQuery = z.infer<
  typeof listNotificationsSchema
>;
