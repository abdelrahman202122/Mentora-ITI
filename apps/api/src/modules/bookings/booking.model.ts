import bcrypt from 'bcryptjs';
import mongoose, { type Model } from 'mongoose';
import type { IBooking } from './booking.types.js';
import {
  BookingStatus,
  PaymentStatus,
} from './booking.types.js';

const { Schema, model, models } = mongoose;

export const DEFAULT_CURRENCY = 'EGP';
export const DEFAULT_COMMISSION_RATE = 0.2; // 20%
const SALT_ROUNDS = 10;

const isValidDuration = (startAt: Date, endAt: Date, durationMinutes: number) =>
  endAt.getTime() - startAt.getTime() === durationMinutes * 60 * 1000;

const bookingSchema = new Schema<IBooking>(
  {
    learnerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Learner ID is required'],
    },
    tutorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Tutor ID is required'],
    },
    tutorProfileId: {
      type: Schema.Types.ObjectId,
      ref: 'TutorProfile',
      required: [true, 'Tutor Profile ID is required'],
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject ID is required'],
    },
    startAt: {
      type: Date,
      required: [true, 'Start time is required'],
      validate: {
        validator: function (this: IBooking, value: Date) {
          if (!this.isNew && !this.isModified('startAt')) {
            return true;
          }

          return value > new Date();
        },
        message: 'Start time must be in the future',
      },
    },
    endAt: {
      type: Date,
      required: [true, 'End time is required'],
      validate: {
        validator: function (this: IBooking, value: Date) {
          return value > this.startAt;
        },
        message: 'End time must be after start time',
      },
    },
    durationMinutes: {
      type: Number,
      required: [true, 'Duration in minutes is required'],
      min: [15, 'Minimum session duration is 15 minutes'],
      max: [480, 'Maximum session duration is 480 minutes'],
      validate: {
        validator: function (this: IBooking, value: number) {
          if (!this.startAt || !this.endAt) {
            return true;
          }

          return isValidDuration(this.startAt, this.endAt, value);
        },
        message: 'Duration must match the start and end time',
      },
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
      validate: {
        validator: function (value: number) {
          return !isNaN(value) && isFinite(value);
        },
        message: 'Price must be a valid number',
      },
    },
    currency: {
      type: String,
      default: DEFAULT_CURRENCY,
      enum: ['EGP', 'USD', 'EUR'],
      required: true,
    },
    bookingStatus: {
      type: String,
      enum: Object.values(BookingStatus),
      default: BookingStatus.PENDING,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.UNPAID,
      required: true,
    },
    confirmationCode: {
      type: String,
      default: null,
      validate: {
        validator: function (value: string | null) {
          if (value === null) return true;
          return value.length > 0;
        },
        message: 'Confirmation code must not be empty',
      },
    },
    confirmationCodeUsedAt: {
      type: Date,
      default: undefined,
    },
    completedAt: {
      type: Date,
      default: undefined,
    },
    learnerNote: {
      type: String,
      maxlength: [500, 'Learner note cannot exceed 500 characters'],
      default: undefined,
    },
    cancelReason: {
      type: String,
      maxlength: [500, 'Cancel reason cannot exceed 500 characters'],
      default: undefined,
    },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
      default: undefined,
    },
    reviewId: {
      type: Schema.Types.ObjectId,
      ref: 'Review',
      default: undefined,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for common query paths
bookingSchema.index({ learnerId: 1, createdAt: -1 });
bookingSchema.index({ tutorId: 1, createdAt: -1 });
bookingSchema.index({ tutorProfileId: 1 });
bookingSchema.index({ bookingStatus: 1 });
bookingSchema.index({ paymentStatus: 1 });
bookingSchema.index({ startAt: 1 });
bookingSchema.index({ learnerId: 1, bookingStatus: 1 });
bookingSchema.index({ tutorId: 1, bookingStatus: 1 });
bookingSchema.index({ paymentStatus: 1, bookingStatus: 1 });
bookingSchema.index({ confirmationCode: 1 }, { sparse: true });

// Pre-save hook to hash confirmation code if it's new
bookingSchema.pre('save', async function (next) {
  if (!this.isModified('confirmationCode')) {
    return next();
  }

  if (this.confirmationCode === null) {
    return next();
  }

  try {
    const hashed = await bcrypt.hash(this.confirmationCode, SALT_ROUNDS);
    this.confirmationCode = hashed;
    next();
  } catch (error) {
    next(error as Error);
  }
});

const Booking =
  (models.Booking as Model<IBooking> | undefined) ??
  model<IBooking>('Booking', bookingSchema);

export default Booking;
