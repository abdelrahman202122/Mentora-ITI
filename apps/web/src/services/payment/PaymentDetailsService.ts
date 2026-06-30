import api from "@/lib/axios"

export interface PaymentDetails {
  _id: string
  bookingId: string
  learnerId: string
  tutorId: string
  amount: number
  currency: string
  status: "success" | "failed" | "refunded" | "pending"
  provider: string
  providerTransactionId: string | null
  providerOrderId: string | null
  providerCheckoutUrl: string | null
  paidAt: string | null
  failedAt: string | null
  refundedAt: string | null
  failureReason: string | null
  createdAt: string
  updatedAt: string
}

export async function getPaymentById(paymentId: string): Promise<PaymentDetails> {
  // 4xx/5xx are thrown automatically by the shared client's interceptor
  const response = await api.get(`/payments/${paymentId}`)
  const body = response.data

  if (!body.success) {
    throw new Error(body.message ?? "Failed to load payment details.")
  }

  // success === true should always come with data — if it doesn't, the API
  // broke its own contract
  if (!body.data) {
    throw new Error("Unexpected response from server: payment details are missing.")
  }

  return body.data
}