import mongoose from 'mongoose';

import {
  NotificationModel,
  type NotificationStatus,
  type NotificationType,
} from './notification.model.js';

const { Types } = mongoose;

type NotificationFilters = {
  status?: NotificationStatus;
  type?: NotificationType;
};

type CreateNotificationInput = {
  recipientId: string;
  actorId?: string | null;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
};

function recipientFilter(recipientId: string, filters: NotificationFilters) {
  return {
    recipientId: new Types.ObjectId(recipientId),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.type ? { type: filters.type } : {}),
  };
}

function populatedNotificationQuery() {
  return NotificationModel.find().populate('actorId', 'name avatar');
}

export function createNotification(input: CreateNotificationInput) {
  return NotificationModel.create({
    ...input,
    recipientId: new Types.ObjectId(input.recipientId),
    actorId: input.actorId ? new Types.ObjectId(input.actorId) : null,
  });
}

export function findNotificationsForRecipient(
  recipientId: string,
  filters: NotificationFilters,
  skip: number,
  limit: number,
) {
  return populatedNotificationQuery()
    .find(recipientFilter(recipientId, filters))
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
}

export function countNotificationsForRecipient(
  recipientId: string,
  filters: NotificationFilters,
) {
  return NotificationModel.countDocuments(
    recipientFilter(recipientId, filters),
  ).exec();
}

export function countUnreadNotifications(recipientId: string) {
  return NotificationModel.countDocuments({
    recipientId: new Types.ObjectId(recipientId),
    status: 'unread',
  }).exec();
}

export function findOwnedNotification(
  notificationId: string,
  recipientId: string,
) {
  return populatedNotificationQuery()
    .findOne({
      _id: new Types.ObjectId(notificationId),
      recipientId: new Types.ObjectId(recipientId),
    })
    .lean()
    .exec();
}

export function markOwnedNotificationRead(
  notificationId: string,
  recipientId: string,
  readAt: Date,
) {
  return NotificationModel.findOneAndUpdate(
    {
      _id: new Types.ObjectId(notificationId),
      recipientId: new Types.ObjectId(recipientId),
      status: 'unread',
    },
    {
      $set: {
        status: 'read',
        readAt,
      },
    },
    { new: true },
  )
    .populate('actorId', 'name avatar')
    .lean()
    .exec();
}

export function markAllNotificationsRead(recipientId: string, readAt: Date) {
  return NotificationModel.updateMany(
    {
      recipientId: new Types.ObjectId(recipientId),
      status: 'unread',
    },
    {
      $set: {
        status: 'read',
        readAt,
      },
    },
  ).exec();
}

export function markNotificationDelivered(notificationId: string, at: Date) {
  return NotificationModel.findOneAndUpdate(
    {
      _id: new Types.ObjectId(notificationId),
      deliveredAt: null,
    },
    { $set: { deliveredAt: at } },
    { new: true },
  )
    .populate('actorId', 'name avatar')
    .lean()
    .exec();
}
