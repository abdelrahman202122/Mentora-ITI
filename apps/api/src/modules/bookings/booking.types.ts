import type { Document, Types } from 'mongoose';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
  EXPIRED = 'expired',
}

export enum PaymentStatus {
  UNPAID = 'unpaid',
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export interface IBooking extends Document {
  learnerId: Types.ObjectId;
  tutorId: Types.ObjectId;
  tutorProfileId: Types.ObjectId;
  subjectId: Types.ObjectId;
  startAt: Date;
  endAt: Date;
  durationMinutes: number;
  price: number; // Decimal amount
  currency: string;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  confirmationCode: string | null;
  confirmationCodeUsedAt?: Date;
  completedAt?: Date;
  learnerNote?: string;
  cancelReason?: string;
  paymentId?: Types.ObjectId;
  reviewId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBookingInput {
  learnerId: Types.ObjectId;
  tutorId: Types.ObjectId;
  tutorProfileId: Types.ObjectId;
  subjectId: Types.ObjectId;
  startAt: Date;
  endAt: Date;
  durationMinutes: number;
  price: number;
  currency?: string;
  learnerNote?: string;
}

export interface UpdateBookingInput {
  bookingStatus?: BookingStatus;
  paymentStatus?: PaymentStatus;
  confirmationCode?: string | null;
  confirmationCodeUsedAt?: Date;
  completedAt?: Date;
  cancelReason?: string;
  paymentId?: Types.ObjectId;
  reviewId?: Types.ObjectId;
}
