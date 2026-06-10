import {
  model,
  models,
  Schema,
  type InferSchemaType,
  type Model,
} from 'mongoose';

export const messageTypes = ['text', 'system'] as const;
export type MessageType = (typeof messageTypes)[number];

export const messageStatuses = ['sent', 'delivered', 'read'] as const;
export type MessageStatus = (typeof messageStatuses)[number];

const messageSchema = new Schema(
  {
    chatId: {
      type: Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: messageTypes,
      default: 'text',
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    status: {
      type: String,
      enum: messageStatuses,
      default: 'sent',
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
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

messageSchema.index({ chatId: 1, deletedAt: 1, createdAt: -1 });
messageSchema.index({ recipientId: 1, deletedAt: 1, status: 1 });

export type MessageDocument = InferSchemaType<typeof messageSchema>;

export const MessageModel =
  (models.Message as Model<MessageDocument> | undefined) ??
  model<MessageDocument>('Message', messageSchema);
