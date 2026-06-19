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
      validate: {
        validator: (v: number) => v > 0,
        message: 'Gross amount must be greater than zero',
      },
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
      validate: {
        validator: (v: number) => v >= 0,
        message: 'Commission amount must not be negative',
      },
    },
    tutorAmount: {
      type: Number,
      required: [true, 'Tutor amount is required'],
      validate: {
        validator: (v: number) => v >= 0,
        message: 'Tutor amount must not be negative',
      },
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

// Schema-level validator: enforce monetary invariants
// Acceptable floating-point tolerance for currency arithmetic (sub-cent)
const EPSILON = 0.001;

earningSchema.pre('validate', function (next) {
  const { grossAmount, commissionRate, commissionAmount, tutorAmount } = this;

  // Only run when all four fields are present (required validators fire separately)
  if (
    grossAmount == null ||
    commissionRate == null ||
    commissionAmount == null ||
    tutorAmount == null
  ) {
    return next();
  }

  // Invariant 1: commissionAmount ≈ grossAmount × commissionRate
  const expectedCommission = grossAmount * commissionRate;
  if (Math.abs(commissionAmount - expectedCommission) > EPSILON) {
    return next(
      new Error(
        `commissionAmount (${commissionAmount}) must equal grossAmount × commissionRate (${expectedCommission.toFixed(4)})`,
      ),
    );
  }

  // Invariant 2: tutorAmount + commissionAmount ≈ grossAmount
  const computedTotal = tutorAmount + commissionAmount;
  if (Math.abs(computedTotal - grossAmount) > EPSILON) {
    return next(
      new Error(
        `tutorAmount + commissionAmount (${computedTotal.toFixed(4)}) must equal grossAmount (${grossAmount})`,
      ),
    );
  }

  next();
});

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
