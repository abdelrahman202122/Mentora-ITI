import mongoose, { type InferSchemaType, type Model } from 'mongoose';

const { model, models, Schema } = mongoose;

export const aiLogStatuses = ['success', 'fallback', 'failed'] as const;
export type AILogStatus = (typeof aiLogStatuses)[number];

const aiLogSchema = new Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'AIConversation',
      index: true,
      default: null,
    },
    learnerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      default: null,
    },
    provider: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    model: {
      type: String,
      trim: true,
      default: null,
    },
    status: {
      type: String,
      enum: aiLogStatuses,
      required: true,
      index: true,
    },
    latencyMs: {
      type: Number,
      min: 0,
      required: true,
    },
    promptMessagesCount: {
      type: Number,
      min: 0,
      required: true,
    },
    errorStatus: {
      type: Number,
      min: 100,
      default: null,
    },
    errorCode: {
      type: String,
      trim: true,
      default: null,
    },
    errorType: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

aiLogSchema.index({ createdAt: -1 });
aiLogSchema.index({ provider: 1, status: 1, createdAt: -1 });

export type AILogDocument = InferSchemaType<typeof aiLogSchema>;

export const AILogModel =
  (models.AILog as Model<AILogDocument> | undefined) ??
  model<AILogDocument>('AILog', aiLogSchema);
