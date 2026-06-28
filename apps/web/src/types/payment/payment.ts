export type PaymentStatus =
  | "pending"
  | "success"
  | "failed"
  | "refunded";

export type PaymentProvider =
  | "paymob"
  | string;

export interface Payment {
  _id: string;

  bookingId: string;
  learnerId: string;
  tutorId: string;

  amount: number;
  currency: string;

  status: PaymentStatus;
  provider: PaymentProvider;

  providerTransactionId: string | null;
  providerOrderId: string | null;
  providerCheckoutUrl: string | null;

  paidAt: string | null;
  failedAt: string | null;
  refundedAt: string | null;

  failureReason: string | null;

  createdAt: string;
  updatedAt: string;
}