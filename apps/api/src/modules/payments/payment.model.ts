import mongoose, { type Model } from 'mongoose';
import { PaymentStatus, type IPayment } from './payment.types.js';

const { Schema, model, models } = mongoose;

export const DEFAULT_CURRENCY = 'EGP';

const paymentSchema = new Schema<IPayment>(
    {
        bookingId: {
            type: Schema.Types.ObjectId,
            ref: 'Booking',
            required: [true, 'Booking ID is required'],
        },
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
        amount: {
            type: Number,
            required: [true, 'Amount is required'],
            min: [0, 'Amount cannot be negative'],
            validate: {
                validator: function (value: number) {
                    return !isNaN(value) && isFinite(value);
                },
                message: 'Amount must be a valid number',
            },
        },
        currency: {
            type: String,
            default: DEFAULT_CURRENCY,
            enum: ['EGP', 'USD', 'EUR'],
            required: true,
        },
        status: {
            type: String,
            enum: Object.values(PaymentStatus),
            default: PaymentStatus.PENDING,
            required: true,
        },
        provider: {
            type: String,
            default: 'paymob',
            enum: ['paymob'],
            required: true,
        },
        providerTransactionId: {
            type: String,
            default: null,
        },
        providerOrderId: {
            type: String,
            default: null,
        },
        providerCheckoutUrl: {
            type: String,
            default: null,
        },
        paidAt: {
            type: Date,
            default: null,
        },
        failedAt: {
            type: Date,
            default: null,
        },
        refundedAt: {
            type: Date,
            default: null,
        },
        failureReason: {
            type: String,
            default: null,
        },
        rawProviderResponse: {
            type: Schema.Types.Mixed,
            default: null,
        },
    },
    {
        timestamps: true,
    },
);

// Indexes for common query paths and provider references
// Unique constraint: only one payment document per booking at any time.
// This is a database-level guard against the race condition where two concurrent
// requests both pass the application-level duplicate check and try to insert.
paymentSchema.index({ bookingId: 1 }, { unique: true });
paymentSchema.index({ learnerId: 1 });
paymentSchema.index({ tutorId: 1 });
paymentSchema.index({ status: 1 });

const Payment =
    (models.Payment as Model<IPayment> | undefined) ??
    model<IPayment>('Payment', paymentSchema);

export default Payment;
export { IPayment, PaymentStatus };
