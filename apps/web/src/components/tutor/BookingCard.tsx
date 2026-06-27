// "use client"
// import { CheckCircle, Mail, Loader2, XCircle, Clock } from "lucide-react";
// import { Booking } from "@/types/booking/booking-data";

// function isExpired(startAt: string): boolean {
//   return new Date(startAt) < new Date();
// }

// function getStatusLabel(booking: Booking): string {
//   // if (isExpired(booking.startAt) && booking.bookingStatus !== "completed") return "Expired";
//   if (booking.bookingStatus === "pending" && isExpired(booking.startAt) ) return "Expired";
//   if (booking.bookingStatus === "expired" ) return "Expired";
//   if (booking.bookingStatus === "canceled") return "Canceled";
//   if (booking.bookingStatus === "rejected") return "Rejected";
//   if (booking.bookingStatus === "completed") return "Completed";
//   if (booking.bookingStatus === "confirmed" && booking.paymentStatus === "paid") return "Confirmed & Paid";
//   if (booking.bookingStatus === "confirmed" && booking.paymentStatus === "unpaid") return "Confirmed & Awaiting Payment";
//   if (booking.bookingStatus === "confirmed" && booking.paymentStatus === "pending") return "Confirmed & Payment Pending";
//   if (booking.bookingStatus === "confirmed" && booking.paymentStatus === "failed") return "Confirmed & Payment Failed";
//   if (booking.bookingStatus === "confirmed") return "Confirmed";
//   if (booking.paymentStatus === "unpaid") return "Awaiting Payment";
//   if (booking.paymentStatus === "failed") return "Payment Failed";
//   if (booking.paymentStatus === "pending") return "Payment Pending";
//   return "Pending Approval";
// }

// function getStatusColor(booking: Booking): string {
//     if (booking.bookingStatus === "pending" && isExpired(booking.startAt) ) return "text-muted-foreground";
//     if (booking.bookingStatus === "expired" ) return "text-muted-foreground";
//   // if (isExpired(booking.startAt) && booking.bookingStatus !== "completed") return "text-muted-foreground";
//   if (booking.bookingStatus === "canceled") return "text-muted-foreground";
//   if (booking.bookingStatus === "rejected") return "text-red-500";
//   if (booking.bookingStatus === "completed") return "text-green-600";
//   if (booking.bookingStatus === "confirmed" && booking.paymentStatus === "paid") return "text-green-600";
//   if (booking.paymentStatus === "unpaid" || booking.paymentStatus === "failed") return "text-red-500";
//   return "text-primary";
// }

// function getIcon(booking: Booking): "user" | "check" | "x" | "clock" {
//   if (booking.bookingStatus === "pending" && isExpired(booking.startAt) ) return "clock";
//   if (booking.bookingStatus === "expired" ) return "clock";
//   // if (isExpired(booking.startAt) && booking.bookingStatus !== "completed") return "clock";
//   if (booking.bookingStatus === "completed") return "check";
//   if (booking.bookingStatus === "rejected" || booking.bookingStatus === "canceled") return "x";
//   return "user";
// }

// type ActionState = "pending" | "confirmed" | "none";

// function getActionState(booking: Booking): ActionState {
//   if (isExpired(booking.startAt)) return "none";
//   if (booking.bookingStatus === "pending") return "pending";
//   if (booking.bookingStatus === "confirmed") return "confirmed";
//   return "none";
// }

// export default function BookingCard({
//   booking,
//   onApprove,
//   onReject,
//   onCancel,
//   isApproving,
//   isRejecting,
//   isCanceling,
// }: {
//   booking: Booking;
//   onApprove: () => void;
//   onReject: () => void;
//   onCancel: () => void;
//   isApproving: boolean;
//   isRejecting: boolean;
//   isCanceling: boolean;
// }) {
//   const actionState = getActionState(booking);
//   const statusLabel = getStatusLabel(booking);
//   const statusColor = getStatusColor(booking);
//   const icon = getIcon(booking);
//   const isAnyLoading = isApproving || isRejecting || isCanceling;
//   console.log(booking)
//   return (
//     <div className="bg-card border border-border rounded-xl p-5 flex flex-col md:flex-row justify-between gap-4">

//       {/* Left side */}
//       <div className="flex items-center gap-4">
//         <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
//           {icon === "check" && <CheckCircle className="w-5 h-5 text-green-600" />}
//           {icon === "x"     && <XCircle     className="w-5 h-5 text-red-500"   />}
//           {icon === "clock" && <Clock       className="w-5 h-5 text-muted-foreground" />}
//           {icon === "user"  && <Mail        className="w-5 h-5 text-primary"   />}
//         </div>

//         <div>
//           <h4 className="font-semibold">{`Session — ${booking.subjectId}`}</h4>
//           <p className="text-sm text-muted-foreground">{formatTime(booking.startAt)}</p>
//           <p className={`text-xs font-bold mt-1 ${statusColor}`}>{statusLabel}</p>
//         </div>
//       </div>

//       {/* Right side — actions */}
//       {actionState === "pending" && (
//         <div className="flex gap-2 items-center">
//           <button
//             className="btn-primary flex items-center gap-2"
//             onClick={onApprove}
//             disabled={isAnyLoading}
//           >
//             {isApproving && <Loader2 className="w-4 h-4 animate-spin" />}
//             {isApproving ? "Approving…" : "Approve"}
//           </button>

//           <button
//             className="btn-outline flex items-center gap-2"
//             onClick={onReject}
//             disabled={isAnyLoading}
//           >
//             {isRejecting && <Loader2 className="w-4 h-4 animate-spin" />}
//             {isRejecting ? "Rejecting…" : "Reject"}
//           </button>
//         </div>
//       )}

//       {actionState === "confirmed" && (
//         <div className="flex gap-2 items-center">
//           <button
//             className="btn-outline text-red-500 border-red-300 hover:bg-red-50 flex items-center gap-2"
//             onClick={onCancel}
//             disabled={isAnyLoading}
//           >
//             {isCanceling && <Loader2 className="w-4 h-4 animate-spin" />}
//             {isCanceling ? "Canceling…" : "Cancel"}
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// function formatTime(isoString: string): string {
//   const date = new Date(isoString);
//   const today = new Date();
//   const isToday =
//     date.getDate() === today.getDate() &&
//     date.getMonth() === today.getMonth() &&
//     date.getFullYear() === today.getFullYear();

//   const time = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
//   if (isToday) return `Today, ${time}`;
//   return date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + `, ${time}`;
// }
"use client";

import { CheckCircle, Mail, Loader2, XCircle, Clock } from "lucide-react";
import { Booking } from "@/types/booking/booking-data";
import { isExpired , getActionState , getIcon , getStatusColor , getStatusLabel } from "@/utils/booking/booking-utils";

// function isExpired(startAt: string): boolean {
//   return new Date(startAt) < new Date();
// }

// function getStatusLabel(booking: Booking): string {
//   if (booking.bookingStatus === "pending" && isExpired(booking.startAt)) return "Expired";
//   if (booking.bookingStatus === "expired") return "Expired";
//   if (booking.bookingStatus === "canceled") return "Canceled";
//   if (booking.bookingStatus === "rejected") return "Rejected";
//   if (booking.bookingStatus === "completed") return "Completed";
//   if (booking.bookingStatus === "confirmed" && booking.paymentStatus === "paid") return "Confirmed & Paid";
//   if (booking.bookingStatus === "confirmed" && booking.paymentStatus === "unpaid") return "Confirmed & Awaiting Payment";
//   if (booking.bookingStatus === "confirmed" && booking.paymentStatus === "pending") return "Confirmed & Payment Pending";
//   if (booking.bookingStatus === "confirmed" && booking.paymentStatus === "failed") return "Confirmed & Payment Failed";
//   if (booking.bookingStatus === "confirmed") return "Confirmed";
//   if (booking.paymentStatus === "unpaid") return "Awaiting Payment";
//   if (booking.paymentStatus === "failed") return "Payment Failed";
//   if (booking.paymentStatus === "pending") return "Payment Pending";
//   return "Pending Approval";
// }

// function getStatusColor(booking: Booking): string {
//   if (booking.bookingStatus === "pending" && isExpired(booking.startAt)) return "text-muted-foreground bg-muted/40";
//   if (booking.bookingStatus === "expired") return "text-muted-foreground bg-muted/40";
//   if (booking.bookingStatus === "canceled") return "text-muted-foreground bg-muted/40";
//   if (booking.bookingStatus === "rejected") return "text-red-500 bg-red-50";
//   if (booking.bookingStatus === "completed") return "text-green-600 bg-green-50";
//   if (booking.bookingStatus === "confirmed" && booking.paymentStatus === "paid") return "text-green-600 bg-green-50";
//   if (booking.paymentStatus === "unpaid" || booking.paymentStatus === "failed") return "text-red-500 bg-red-50";
//   return "text-primary bg-primary/10";
// }

// function getIcon(booking: Booking): "user" | "check" | "x" | "clock" {
//   if (booking.bookingStatus === "pending" && isExpired(booking.startAt)) return "clock";
//   if (booking.bookingStatus === "expired") return "clock";
//   if (booking.bookingStatus === "completed") return "check";
//   if (booking.bookingStatus === "rejected" || booking.bookingStatus === "canceled") return "x";
//   return "user";
// }

// type ActionState = "pending" | "confirmed" | "none";

// function getActionState(booking: Booking): ActionState {
//   if (isExpired(booking.startAt)) return "none";
//   if (booking.bookingStatus === "pending") return "pending";
//   if (booking.bookingStatus === "confirmed") return "confirmed";
//   return "none";
// }

export default function BookingCard({
  booking,
  onApprove,
  onReject,
  onCancel,
  isApproving,
  isRejecting,
  isCanceling,
}: {
  booking: Booking;
  onApprove: () => void;
  onReject: () => void;
  onCancel: () => void;
  isApproving: boolean;
  isRejecting: boolean;
  isCanceling: boolean;
}) {
  const actionState = getActionState(booking);
  const statusLabel = getStatusLabel(booking);
  const statusColor = getStatusColor(booking);
  const icon = getIcon(booking);
  const isAnyLoading = isApproving || isRejecting || isCanceling;

  return (
    <div className="group bg-card border border-border rounded-2xl p-5 flex flex-col md:flex-row justify-between gap-5 shadow-sm hover:shadow-md transition-all duration-200">

      {/* LEFT SIDE */}
      <div className="flex items-start gap-4">

        {/* ICON FRAME */}
        <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center shrink-0">
          {icon === "check" && <CheckCircle className="w-5 h-5 text-green-600" />}
          {icon === "x" && <XCircle className="w-5 h-5 text-red-500" />}
          {icon === "clock" && <Clock className="w-5 h-5 text-muted-foreground" />}
          {icon === "user" && <Mail className="w-5 h-5 text-primary" />}
        </div>

        {/* CONTENT */}
        <div className="space-y-2">
          <div>
            <h4 className="font-semibold text-base">
              Session — {booking.subjectId}
            </h4>
            <p className="text-sm text-muted-foreground">
              {formatTime(booking.startAt)}
            </p>
          </div>

          {/* STATUS FRAME */}
          <div
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusColor}`}
          >
            {statusLabel}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-2 md:justify-end">

        {actionState === "pending" && (
          <>
            <button
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition flex items-center gap-2"
              onClick={onApprove}
              disabled={isAnyLoading}
            >
              {isApproving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isApproving ? "Approving…" : "Approve"}
            </button>

            <button
              className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition flex items-center gap-2"
              onClick={onReject}
              disabled={isAnyLoading}
            >
              {isRejecting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isRejecting ? "Rejecting…" : "Reject"}
            </button>
          </>
        )}

        {actionState === "confirmed" && (
          <button
            className="px-4 py-2 rounded-lg border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition flex items-center gap-2"
            onClick={onCancel}
            disabled={isAnyLoading}
          >
            {isCanceling && <Loader2 className="w-4 h-4 animate-spin" />}
            {isCanceling ? "Canceling…" : "Cancel"}
          </button>
        )}
      </div>
    </div>
  );
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const today = new Date();

  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const time = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isToday) return `Today, ${time}`;

  return (
    date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }) + `, ${time}`
  );
}