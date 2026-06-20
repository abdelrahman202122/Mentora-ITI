import type { Document, Types } from 'mongoose';

export enum EarningStatus {
  PENDING = 'pending',
  AVAILABLE = 'available',
  PAID_OUT = 'paid_out',
  CANCELED = 'canceled',
}

export interface IEarning extends Document {
  bookingId: Types.ObjectId;
  paymentId: Types.ObjectId;
  tutorId: Types.ObjectId;
  grossAmount: number;
  commissionRate: number;
  commissionAmount: number;
  tutorAmount: number;
  currency: string;
  status: EarningStatus;
  availableAt?: Date | null;
  paidOutAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEarningInput {
  bookingId: Types.ObjectId;
  paymentId: Types.ObjectId;
  tutorId: Types.ObjectId;
  grossAmount: number;
  commissionRate: number;
  commissionAmount: number;
  tutorAmount: number;
  currency: string;
}

export interface UpdateEarningInput {
  status?: EarningStatus;
  availableAt?: Date | null;
  paidOutAt?: Date | null;
}
