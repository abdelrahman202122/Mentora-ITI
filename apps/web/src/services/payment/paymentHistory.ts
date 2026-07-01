

import api, { ApiClientError } from "@/lib/axios";
import type { ApiSuccess } from "@/types/apis/api-success";

export interface Payment {
  _id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: "success" | "failed" | "refunded" | "pending";
  paidAt: string | null;
  failedAt: string | null;
  refundedAt: string | null;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PaymentsData {
  payments: Payment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getMyPayments(): Promise<Payment[]> {
  try {
    const response = await api.get<ApiSuccess<PaymentsData>>("/payments/me");
    const body = response.data;

    // mirror the same envelope validation the fetch-based version had —
    // don't assume body.data.payments exists just because the request
    // itself didn't throw
    if (!body.success) {
      throw new Error(body.message ?? "Failed to fetch payments.");
    }

    if (!body.data || !Array.isArray(body.data.payments)) {
      throw new Error("Unexpected response from server.");
    }

    return body.data.payments;
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error("Get My Payments Error:", error.message);
    }
    throw error;
  }
}