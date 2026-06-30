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
    return response.data.data;
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error("Payment Fetch Error:", error.message);
    }
    throw error;
  }
}