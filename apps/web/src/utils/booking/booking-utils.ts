import { Booking } from "@/types/booking/booking-data";

export function isExpired(startAt: string): boolean {
  return new Date(startAt) < new Date();
}

export function getStatusLabel(booking: Booking): string {
  if (booking.bookingStatus === "pending" && isExpired(booking.startAt)) return "Expired";
  if (booking.bookingStatus === "pending" ) return "Pending Approval";
  if (booking.bookingStatus === "expired") return "Expired";
  if (booking.bookingStatus === "canceled") return "Canceled";
  if (booking.bookingStatus === "rejected") return "Rejected";
  if (booking.bookingStatus === "completed") return "Completed";
  if (booking.bookingStatus === "confirmed" && booking.paymentStatus === "paid") return "Confirmed & Paid";
  if (booking.bookingStatus === "confirmed" && booking.paymentStatus === "unpaid") return "Confirmed & Awaiting Payment";
  if (booking.bookingStatus === "confirmed" && booking.paymentStatus === "pending") return "Confirmed & Payment Pending";
  if (booking.bookingStatus === "confirmed" && booking.paymentStatus === "failed") return "Confirmed & Payment Failed";
  if (booking.bookingStatus === "confirmed") return "Confirmed";
  if(booking.paymentStatus === "refunded") return "refunded"
  if (booking.paymentStatus === "unpaid") return "Awaiting Payment";
  if (booking.paymentStatus === "failed") return "Payment Failed";
  if (booking.paymentStatus === "pending") return "Payment Pending";
  return "Pending Approval";
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
