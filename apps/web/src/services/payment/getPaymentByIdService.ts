

import api, { ApiClientError } from "@/lib/axios";
import type { ApiSuccess } from "@/types/apis/api-success";

// هنعرف شكل الـ Payment اللي راجع بناءً على الـ JSON بتاعك
export interface PaymentData {
  _id: string;
  bookingId: string;
  status: string; // 'pending' | 'success' | 'failed' ...الخ
  amount: number;
}

export async function getPaymentById(paymentId: string): Promise<PaymentData> {
  try {
    // هنكلم الـ endpoint بتاعة الـ payment عندك
    const response = await api.get<ApiSuccess<PaymentData>>(`/payments/${paymentId}`);
    const body = response.data;

    // guard the envelope before trusting it — an unsuccessful or malformed
    // response here would otherwise silently flow into the poller as if it
    // were a valid PaymentData, surfacing as confusing failures much later
    if (!body.success) {
      throw new Error(body.message ?? "Failed to fetch payment status.");
    }

    if (!body.data) {
      throw new Error("Unexpected response from server.");
    }

    return body.data;
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error("Payment Fetch Error:", error.message);
    }
    throw error;
  }
}