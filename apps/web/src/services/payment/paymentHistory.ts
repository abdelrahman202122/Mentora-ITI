// import type { ApiResponse } from "@/types/bookingProcess/booking"

// export interface Payment {
//   _id: string
//   bookingId: string
//   amount: number
//   currency: string
//   status: "success" | "failed" | "refunded" | "pending"
//   paidAt: string | null
//   failedAt: string | null
//   refundedAt: string | null
//   failureReason: string | null
//   createdAt: string
//   updatedAt: string
// }

// interface PaymentsData {
//   payments: Payment[]
//   pagination: {
//     page: number
//     limit: number
//     total: number
//     totalPages: number
//   }
// }

// export async function getMyPayments(): Promise<Payment[]> {
//   const response = await fetch("/api/payments/me", {
//     method: "GET",
//     headers: { "Content-Type": "application/json" },
//     credentials: "include",
//   })

//   const body: ApiResponse<PaymentsData> = await response.json()

//   if (!response.ok || !body.success) {
//     throw new Error(body.message ?? "Failed to load payments.")
//   }

//   if (!body.data) {
//     throw new Error("Unexpected response from server.")
//   }

//   return body.data.payments
// }


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
    return response.data.data.payments;
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error("Get My Payments Error:", error.message);
    }
    throw error;
  }
}