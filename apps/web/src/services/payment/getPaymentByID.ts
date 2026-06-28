import api, { ApiClientError } from "@/lib/axios";
import type { ApiSuccess } from "@/types/apis/api-success";
import type { Payment } from "@/types/payment/payment";

export async function getPaymentById(
  paymentId: string
): Promise<Payment> {
  try {
    const response = await api.get<ApiSuccess<Payment>>(
      `/payments/${paymentId}`
    );

    return response.data.data;
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error(error.message);
    }

    throw error;
  }
}