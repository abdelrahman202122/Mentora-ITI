// export type EarningStatus =
//   | "pending"
//   | "available"
//   | "paid_out";

export interface Earning {
  _id: string;
  bookingId: string;
  paymentId: string;
  tutorId: string;

  grossAmount: number;
  commissionRate: number;
  commissionAmount: number;
  tutorAmount: number;

  currency: string;
  status: string;

  availableAt: string | null;
  paidOutAt: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface EarningsData {
  earnings: Earning[];
  pagination: Pagination;
}