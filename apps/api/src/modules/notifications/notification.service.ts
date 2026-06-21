import { NotFoundError } from '../../common/errors/AppError.js';
import type { ListNotificationsQuery } from '../../validators/notification.js';
import type {
  NotificationStatus,
  NotificationType,
} from './notification.model.js';
import * as notificationRepository from './notification.repository.js';

type Identifier = { toString(): string };

type Actor = {
  _id: Identifier;
  name: string;
  avatar?: string;
};

type PopulatedNotification = {
  _id: Identifier;
  recipientId: Identifier;
  actorId?: Actor | null;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  status: NotificationStatus;
  deliveredAt?: Date | null;
  readAt?: Date | null;
  createdAt: Date;
};

export type CreateNotificationInput = {
  recipientId: string;
  actorId?: string | null;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
};

export function formatNotification(notification: PopulatedNotification) {
  return {
    id: notification._id.toString(),
    type: notification.type,
    title: notification.title,
    body: notification.body,
    data: notification.data ?? {},
    status: notification.status,
    deliveredAt: notification.deliveredAt ?? null,
    readAt: notification.readAt ?? null,
    createdAt: notification.createdAt,
    actor: notification.actorId
      ? {
          id: notification.actorId._id.toString(),
          name: notification.actorId.name,
          avatar: notification.actorId.avatar,
        }
      : null,
  };
}

export async function createNotification(input: CreateNotificationInput) {
  const notification = await notificationRepository.createNotification(input);
  const populated = await notificationRepository.findOwnedNotification(
    notification._id.toString(),
    input.recipientId,
  );

  if (!populated) {
    throw new NotFoundError('Notification not found after creation');
  }

  return formatNotification(populated as unknown as PopulatedNotification);
}

export async function listNotifications(
  recipientId: string,
  query: ListNotificationsQuery,
) {
  const skip = (query.page - 1) * query.limit;
  const filters = {
    status: query.status,
    type: query.type,
  };
  const [notifications, total] = await Promise.all([
    notificationRepository.findNotificationsForRecipient(
      recipientId,
      filters,
      skip,
      query.limit,
    ),
    notificationRepository.countNotificationsForRecipient(
      recipientId,
      filters,
    ),
  ]);

  return {
    notifications: (notifications as unknown as PopulatedNotification[]).map(
      formatNotification,
    ),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

export async function getUnreadCount(recipientId: string) {
  const count =
    await notificationRepository.countUnreadNotifications(recipientId);
  return { count };
}

export async function markNotificationRead(
  notificationId: string,
  recipientId: string,
) {
  const current = await notificationRepository.findOwnedNotification(
    notificationId,
    recipientId,
  );

  if (!current) {
    throw new NotFoundError('Notification not found');
  }

  if (current.status === 'read') {
    return formatNotification(current as unknown as PopulatedNotification);
  }

  const updated = await notificationRepository.markOwnedNotificationRead(
    notificationId,
    recipientId,
    new Date(),
  );

  if (!updated) {
    const latest = await notificationRepository.findOwnedNotification(
      notificationId,
      recipientId,
    );

    if (!latest) {
      throw new NotFoundError('Notification not found');
    }

    return formatNotification(latest as unknown as PopulatedNotification);
  }

  return formatNotification(updated as unknown as PopulatedNotification);
}

export async function markAllNotificationsRead(recipientId: string) {
  const readAt = new Date();
  const result = await notificationRepository.markAllNotificationsRead(
    recipientId,
    readAt,
  );

  return {
    updatedCount: result.modifiedCount,
    readAt,
  };
}

export async function markNotificationDelivered(notificationId: string) {
  const notification =
    await notificationRepository.markNotificationDelivered(
      notificationId,
      new Date(),
    );

  if (!notification) {
    throw new NotFoundError('Notification not found');
  }

  return formatNotification(notification as unknown as PopulatedNotification);
}
