import { Booking } from "@/types/booking/booking-data";
import type { useTranslations } from "next-intl";

type T = ReturnType<typeof useTranslations<"bookingStatusLabel">>;

export function isExpired(startAt: string): boolean {
  return new Date(startAt) < new Date();
}


export function getStatusLabel(booking: Booking, t: T): string {
  if (booking.bookingStatus === "pending" && isExpired(booking.startAt)) return t("expired");
  if (booking.bookingStatus === "pending") return t("pendingApproval");
  if (booking.bookingStatus === "expired") return t("expired");
  if (booking.bookingStatus === "canceled") return t("canceled");
  if (booking.bookingStatus === "rejected") return t("rejected");
  if (booking.bookingStatus === "completed") return t("completed");
  if (booking.bookingStatus === "confirmed" && booking.paymentStatus === "paid") return t("confirmedPaid");
  if (booking.bookingStatus === "confirmed" && booking.paymentStatus === "unpaid") return t("confirmedAwaitingPayment");
  if (booking.bookingStatus === "confirmed" && booking.paymentStatus === "pending") return t("confirmedPaymentPending");
  if (booking.bookingStatus === "confirmed" && booking.paymentStatus === "failed") return t("confirmedPaymentFailed");
  if (booking.bookingStatus === "confirmed") return t("confirmed");
  if (booking.paymentStatus === "refunded") return t("refunded");
  if (booking.paymentStatus === "unpaid") return t("awaitingPayment");
  if (booking.paymentStatus === "failed") return t("paymentFailed");
  if (booking.paymentStatus === "pending") return t("paymentPending");
  return t("pendingApproval");
}
export function getStatusColor(booking: Booking): string {
  if (booking.bookingStatus === "pending" && isExpired(booking.startAt)) return "text-muted-foreground bg-muted/40";
  if (booking.bookingStatus === "expired") return "text-muted-foreground bg-muted/40";
  if (booking.bookingStatus === "canceled") return "text-muted-foreground bg-muted/40";
  if (booking.bookingStatus === "rejected") return "text-red-500 bg-red-50";
  if (booking.bookingStatus === "completed") return "text-green-600 bg-green-50";
  if (booking.bookingStatus === "confirmed" && booking.paymentStatus === "paid") return "text-green-600 bg-green-50";
  if (booking.paymentStatus === "unpaid" || booking.paymentStatus === "failed") return "text-red-500 bg-red-50";
  return "text-primary bg-primary/10";
}

export function getIcon(booking: Booking): "user" | "check" | "x" | "clock" {
  if (booking.bookingStatus === "pending" && isExpired(booking.startAt)) return "clock";
  if (booking.bookingStatus === "expired") return "clock";
  if (booking.bookingStatus === "completed") return "check";
  if (booking.bookingStatus === "rejected" || booking.bookingStatus === "canceled") return "x";
  return "user";
}

type ActionState = "pending" | "confirmed" | "none";

export function getActionState(booking: Booking): ActionState {
  if (isExpired(booking.startAt)) return "none";
  if (booking.bookingStatus === "expired") return "none";
  if (booking.bookingStatus === "pending") return "pending";
  if (booking.bookingStatus === "confirmed") return "confirmed";
  return "none";
}
