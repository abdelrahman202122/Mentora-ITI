import mongoose, { type Model } from 'mongoose';
import { EarningStatus, type IEarning } from './earning.types.js';

const { Schema, model, models } = mongoose;

const earningSchema = new Schema<IEarning>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking ID is required'],
    },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
      required: [true, 'Payment ID is required'],
    },
    tutorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Tutor ID is required'],
    },
    grossAmount: {
      type: Number,
      required: [true, 'Gross amount is required'],
      min: [0, 'Gross amount cannot be negative'],
    },
    commissionRate: {
      type: Number,
      required: [true, 'Commission rate is required'],
      min: [0, 'Commission rate cannot be negative'],
      max: [1, 'Commission rate cannot exceed 1'],
    },
    commissionAmount: {
      type: Number,
      required: [true, 'Commission amount is required'],
      min: [0, 'Commission amount cannot be negative'],
    },
    tutorAmount: {
      type: Number,
      required: [true, 'Tutor amount is required'],
      min: [0, 'Tutor amount cannot be negative'],
    },
    currency: {
      type: String,
      enum: ['EGP', 'USD', 'EUR'],
      default: 'EGP',
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(EarningStatus),
      default: EarningStatus.PENDING,
      required: true,
    },
    availableAt: {
      type: Date,
      default: null,
    },
    paidOutAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for common query paths (spec: earning by tutor and status)
earningSchema.index({ tutorId: 1 });
earningSchema.index({ tutorId: 1, status: 1 });
earningSchema.index({ bookingId: 1 });
earningSchema.index({ paymentId: 1 });

const Earning =
  (models.Earning as Model<IEarning> | undefined) ??
  model<IEarning>('Earning', earningSchema);

export default Earning;
export { IEarning, EarningStatus };
