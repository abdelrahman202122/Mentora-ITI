import mongoose, { type InferSchemaType, type Model } from 'mongoose';

const { model, models, Schema } = mongoose;

export const chatStatuses = ['active', 'archived'] as const;
export type ChatStatus = (typeof chatStatuses)[number];

const lastMessageSchema = new Schema(
  {
    messageId: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    preview: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    sentAt: {
      type: Date,
    },
  },
  {
    _id: false,
  },
);

const chatSchema = new Schema(
  {
    learnerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tutorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: chatStatuses,
      default: 'active',
      index: true,
    },
    lastMessage: {
      type: lastMessageSchema,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

chatSchema.index({ learnerId: 1, tutorId: 1 }, { unique: true });
chatSchema.index({ updatedAt: -1 });

export type ChatDocument = InferSchemaType<typeof chatSchema>;

export const ChatModel =
  (models.Chat as Model<ChatDocument> | undefined) ??
  model<ChatDocument>('Chat', chatSchema);
