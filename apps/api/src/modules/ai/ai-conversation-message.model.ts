import mongoose, { type InferSchemaType, type Model } from 'mongoose';

import { aiConversationMessageRoles } from './ai-conversation.model.js';

const { model, models, Schema } = mongoose;

const aiConversationMessageSchema = new Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'AIConversation',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: aiConversationMessageRoles,
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10000,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

aiConversationMessageSchema.index({ conversationId: 1, createdAt: 1 });
aiConversationMessageSchema.index({ conversationId: 1, role: 1, createdAt: -1 });

export type AIConversationMessageDocument = InferSchemaType<
  typeof aiConversationMessageSchema
>;

export const AIConversationMessageModel =
  (models.AIConversationMessage as
    | Model<AIConversationMessageDocument>
    | undefined) ??
  model<AIConversationMessageDocument>(
    'AIConversationMessage',
    aiConversationMessageSchema,
  );
