import mongoose, { type InferSchemaType, type Model } from 'mongoose';

const { Schema, model, models } = mongoose;

export const reviewSchema = new Schema(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true,
      index: true,
    },
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
    tutorProfileId: {
      type: Schema.Types.ObjectId,
      ref: 'TutorProfile',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      validate: {
        validator: Number.isInteger,
        message: 'Rating must be an integer',
      },
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating must be at most 5'],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
      default: undefined,
    },
    isVisible: {
      type: Boolean,
      default: true,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

reviewSchema.index({ tutorProfileId: 1, isVisible: 1, createdAt: -1 });
reviewSchema.index({ learnerId: 1, createdAt: -1 });

export type ReviewDocument = InferSchemaType<typeof reviewSchema>;

export const ReviewModel =
  (models.Review as Model<ReviewDocument> | undefined) ??
  model<ReviewDocument>('Review', reviewSchema);

export default ReviewModel;
