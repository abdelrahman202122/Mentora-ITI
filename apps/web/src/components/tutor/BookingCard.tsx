"use client";

import { CheckCircle, Mail, Loader2, XCircle, Clock } from "lucide-react";
import { Booking } from "@/types/booking/booking-data";
import { isExpired , getActionState , getIcon , getStatusColor , getStatusLabel } from "@/utils/booking/booking-utils";


import { useTranslations, useLocale } from "next-intl";
import { formatTime } from "@/utils/tutor/formateDate"; 

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
  const t = useTranslations("bookingCard");
  const tStatus = useTranslations("bookingStatusLabel");
  const locale = useLocale();

  const actionState = getActionState(booking);
  const statusLabel = getStatusLabel(booking, tStatus);
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
              {t("sessionTitle", { subject: booking.subjectId })}
            </h4>
            <p className="text-sm text-muted-foreground">
              {formatTime(booking.startAt, locale, t)}
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
              {isApproving ? t("approving") : t("approve")}
            </button>

            <button
              className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition flex items-center gap-2"
              onClick={onReject}
              disabled={isAnyLoading}
            >
              {isRejecting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isRejecting ? t("rejecting") : t("reject")}
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
            {isCanceling ? t("canceling") : t("cancel")}
          </button>
        )}
      </div>
    </div>
  );
}