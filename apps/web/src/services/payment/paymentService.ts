// import type { ApiResponse } from "@/types/bookingProcess/booking"

// interface CheckoutData {
//   paymentId: string
//   checkoutUrl: string
// }

// function extractErrorMessage(body: ApiResponse<CheckoutData>): string {
//   if (body.errors) {
//     return Object.values(body.errors).flat().join(" ")
//   }
//   return body.message ?? "Something went wrong. Please try again."
// }

// export async function initiateCheckout(bookingId: string): Promise<CheckoutData> {
//   const response = await fetch("/api/payments/checkout", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     credentials: "include",
//     body: JSON.stringify({ bookingId }),
//   })

//   const body: ApiResponse<CheckoutData> = await response.json()

//   if (!response.ok || !body.success) {
//     switch (response.status) {
//       case 400:
//         throw new Error(extractErrorMessage(body))
//       case 401:
//         throw new Error(extractErrorMessage(body))
//       case 403:
//         throw new Error(extractErrorMessage(body))
//       case 404:
//         throw new Error(extractErrorMessage(body))
//       case 409:
//         throw new Error(extractErrorMessage(body))
//       case 500:
//       default:
//         throw new Error(extractErrorMessage(body))
//     }
//   }

//   if (!body.data) {
//     throw new Error("Unexpected response from server.")
//   }

//   return body.data
// }


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
    return response.data.data;
  } catch (error) {
    if (error instanceof ApiClientError) {
      console.error("Checkout Initiation Error:", error.message);
    }
    throw error;
  }
}