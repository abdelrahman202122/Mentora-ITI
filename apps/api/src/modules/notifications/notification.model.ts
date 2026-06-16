import mongoose, { type InferSchemaType, type Model } from 'mongoose';

const { model, models, Schema } = mongoose;

export const notificationTypes = [
  'message',
  'booking',
  'payment',
  'review',
  'system',
] as const;
export type NotificationType = (typeof notificationTypes)[number];

export const notificationStatuses = ['unread', 'read'] as const;
export type NotificationStatus = (typeof notificationStatuses)[number];

const notificationSchema = new Schema(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    actorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    type: {
      type: String,
      enum: notificationTypes,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: notificationStatuses,
      default: 'unread',
      index: true,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

notificationSchema.index({ recipientId: 1, status: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, type: 1, createdAt: -1 });

export type NotificationDocument = InferSchemaType<typeof notificationSchema>;

export const NotificationModel =
  (models.Notification as Model<NotificationDocument> | undefined) ??
  model<NotificationDocument>('Notification', notificationSchema);
