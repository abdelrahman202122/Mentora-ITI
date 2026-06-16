import mongoose, { type InferSchemaType, type Model } from 'mongoose';

const { model, models, Schema } = mongoose;

export const aiConversationStatuses = ['active', 'completed', 'abandoned'] as const;
export type AIConversationStatus = (typeof aiConversationStatuses)[number];

export const aiConversationMessageRoles = ['user', 'assistant', 'system', 'tool'] as const;
export type AIConversationMessageRole = (typeof aiConversationMessageRoles)[number];

const lastAIMessageSchema = new Schema(
  {
    messageId: {
      type: Schema.Types.ObjectId,
      ref: 'AIConversationMessage',
    },
    role: {
      type: String,
      enum: aiConversationMessageRoles,
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

const aiConversationSchema = new Schema(
  {
    learnerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: aiConversationStatuses,
      default: 'active',
      index: true,
    },
    locale: {
      type: String,
      trim: true,
      default: 'en',
      maxlength: 20,
    },
    goal: {
      type: String,
      trim: true,
      maxlength: 300,
      default: null,
    },
    extractedPreferences: {
      type: Schema.Types.Mixed,
      default: {},
    },
    recommendedTutorIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'TutorProfile',
      },
    ],
    lastMessage: {
      type: lastAIMessageSchema,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

aiConversationSchema.index({ learnerId: 1, status: 1, updatedAt: -1 });
aiConversationSchema.index({ updatedAt: -1 });

export type AIConversationDocument = InferSchemaType<typeof aiConversationSchema>;

export const AIConversationModel =
  (models.AIConversation as Model<AIConversationDocument> | undefined) ??
  model<AIConversationDocument>('AIConversation', aiConversationSchema);
