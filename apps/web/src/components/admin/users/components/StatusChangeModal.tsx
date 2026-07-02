
"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, RotateCcw, X, Loader2, type LucideIcon } from "lucide-react";
import { useDrawerEffects } from "@/hooks/admin/use-drawer-effects";
import { ModalOverlay } from "@/components/admin/shared/modal-overlay";
import type { User, Status } from "@/types/admin";

interface StatusChangeConfig {
  title: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  confirmButtonText: string;
  confirmButtonBg: string;
  confirmButtonHover: string;
  reasonLabel: string;
  reasonPlaceholder: string;
  buildMessage: (userName: string) => string;
}

const STATUS_CONFIG: Record<Status, StatusChangeConfig> = {
  Suspended: {
    title: "Suspend Account",
    icon: AlertTriangle,
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    confirmButtonText: "Confirm Suspension",
    confirmButtonBg: "bg-red-600",
    confirmButtonHover: "hover:bg-red-700",
    reasonLabel: "Reason for Suspension",
    reasonPlaceholder: "e.g., Violation of terms of service…",
    buildMessage: (name) =>
      `Are you sure you want to suspend ${name}? They will immediately lose access to the platform and any active sessions will be terminated.`,
  },
  Active: {
    title: "Restore Account",
    icon: RotateCcw,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    confirmButtonText: "Restore Account",
    confirmButtonBg: "bg-emerald-600",
    confirmButtonHover: "hover:bg-emerald-700",
    reasonLabel: "Reason for Restoration",
    reasonPlaceholder: "e.g., Issue resolved, user reinstated…",
    buildMessage: (name) =>
      `Are you sure you want to restore ${name}'s account? They will regain full access to the platform immediately.`,
  },
  Pending: {
    title: "Set to Pending",
    icon: AlertTriangle,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    confirmButtonText: "Set as Pending",
    confirmButtonBg: "bg-amber-600",
    confirmButtonHover: "hover:bg-amber-700",
    reasonLabel: "Reason for Pending Status",
    reasonPlaceholder: "e.g., Awaiting verification…",
    buildMessage: (name) =>
      `Are you sure you want to set ${name}'s account to pending? They will have limited access until the account is reactivated.`,
  },
};

interface StatusChangeModalProps {
  user: User | null;
  targetStatus: Status | null;
  onClose: () => void;
  onConfirm: (user: User, targetStatus: Status, reason: string) => void;
  mutating?: boolean; // ✅ NEW: disable buttons during API call
}

export function StatusChangeModal({
  user,
  targetStatus,
  onClose,
  onConfirm,
  mutating = false,
}: StatusChangeModalProps) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (user && targetStatus) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setReason("");
    }
  }, [user, targetStatus]);

  useDrawerEffects(!!(user && targetStatus), onClose);

  if (!user || !targetStatus) return null;

  const config = STATUS_CONFIG[targetStatus];
  const Icon = config.icon;

  const handleConfirm = () => {
    if (!reason.trim() || mutating) return;
    onConfirm(user, targetStatus, reason.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <ModalOverlay onClick={mutating ? () => {} : onClose} />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${config.title}: ${user.name}`}
        className="relative z-10 w-full max-w-md rounded-xl bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${config.iconBg}`}
            >
              <Icon className={`h-5 w-5 ${config.iconColor}`} />
            </span>
            <h2 className="text-lg font-semibold text-gray-900">
              {config.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={mutating}
            aria-label="Close modal"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 px-6 py-6">
          <p className="text-sm leading-relaxed text-gray-600">
            {config.buildMessage(user.name)}
          </p>

          <div className="flex items-center gap-2 rounded-md bg-gray-50 px-3 py-2 text-xs">
            <span className="text-gray-500">Current status:</span>
            <span className="font-semibold text-gray-700">{user.status}</span>
            <span className="text-gray-400">→</span>
            <span className="text-gray-500">New status:</span>
            <span className="font-semibold text-gray-900">{targetStatus}</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">
              {config.reasonLabel}
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={config.reasonPlaceholder}
              rows={3}
              disabled={mutating}
              className={`w-full resize-y rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:opacity-50 ${targetStatus === "Suspended" ? "focus:border-red-500 focus:ring-red-500" : targetStatus === "Active" ? "focus:border-emerald-500 focus:ring-emerald-500" : "focus:border-amber-500 focus:ring-amber-500"}`}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={mutating}
            className="inline-flex h-10 items-center justify-center rounded-md border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!reason.trim() || mutating}
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${config.confirmButtonBg} ${config.confirmButtonHover}`}
          >
            {mutating && <Loader2 className="h-4 w-4 animate-spin" />}
            {config.confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
}

