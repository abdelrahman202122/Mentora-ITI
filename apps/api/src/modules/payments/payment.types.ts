import type { Document, Types } from 'mongoose';

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export interface IPayment extends Document {
  bookingId: Types.ObjectId;
  learnerId: Types.ObjectId;
  tutorId: Types.ObjectId;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: 'paymob';
  providerTransactionId?: string | null;
  providerOrderId?: string | null;
  providerCheckoutUrl?: string | null;
  paidAt?: Date | null;
  failedAt?: Date | null;
  refundedAt?: Date | null;
  failureReason?: string | null;
  rawProviderResponse?: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentInput {
  bookingId: Types.ObjectId;
  learnerId: Types.ObjectId;
  tutorId: Types.ObjectId;
  amount: number;
  currency: string;
  provider: 'paymob';
}

export interface UpdatePaymentInput {
  status?: PaymentStatus;
  providerTransactionId?: string | null;
  providerOrderId?: string | null;
  providerCheckoutUrl?: string | null;
  paidAt?: Date | null;
  failedAt?: Date | null;
  refundedAt?: Date | null;
  failureReason?: string | null;
  rawProviderResponse?: Record<string, any> | null;
}
