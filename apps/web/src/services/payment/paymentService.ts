
import api, { ApiClientError } from "@/lib/axios";
import type { ApiSuccess } from "@/types/apis/api-success";

interface CheckoutData {
  paymentId: string;
  checkoutUrl: string;
}

export async function initiateCheckout(bookingId: string): Promise<CheckoutData> {
  try {
    const response = await api.post<ApiSuccess<CheckoutData>>(
      "/payments/checkout",
      { bookingId },
    );
    const body = response.data;

    // guard the envelope — without this, a { success: false } or a missing
    // payload would silently flow through as a "valid" CheckoutData, and the
    // caller's `window.location.href = checkoutUrl` would redirect to
    // "undefined" instead of surfacing the real backend error
    if (!body.success) {
      throw new Error(body.message ?? "Failed to start checkout.");
    }

    if (!body.data || !body.data.checkoutUrl) {
      throw new Error("Unexpected response from server.");
    }

    return body.data;
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error("Checkout Initiation Error:", error.message);
    }
    throw error;
  }
}