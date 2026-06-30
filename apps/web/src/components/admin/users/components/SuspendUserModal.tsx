"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import { ModalOverlay } from "@/components/admin/shared/modal-overlay";
import type { User } from "@/types/admin";
import { useDrawerEffects } from "@/hooks/admin/use-drawer-effects";

interface SuspendUserModalProps {
  user: User | null;
  onClose: () => void;
  onConfirm: (user: User, reason: string) => void;
}

export function SuspendUserModal({
  user,
  onClose,
  onConfirm,
}: SuspendUserModalProps) {
  const [reason, setReason] = useState("");

  // Reset the reason input whenever a new user is opened
  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setReason("");
    }
  }, [user]);

  // ESC to close + lock body scroll while modal is open
  useDrawerEffects(!!user, onClose);

  if (!user) return null;

  const handleConfirm = () => {
    if (!reason.trim()) return;
    onConfirm(user, reason.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <ModalOverlay onClick={onClose} />

      {/* Modal panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Suspend user: ${user.name}`}
        className="relative z-10 w-full max-w-md rounded-xl bg-white shadow-2xl"
      >
        {/* ---------- Header ---------- */}
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </span>
            <h2 className="text-lg font-semibold text-gray-900">
              Suspend Account
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ---------- Body ---------- */}
        <div className="space-y-4 px-6 py-6">
          {/* Warning message */}
          <p className="text-sm leading-relaxed text-gray-600">
            Are you sure you want to suspend{" "}
            <span className="font-semibold text-gray-900">{user.name}</span>? They
            will immediately lose access to the platform and any active sessions
            will be terminated.
          </p>

          {/* Reason for suspension */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">
              Reason for Suspension
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Violation of terms of service…"
              rows={3}
              className="w-full resize-y rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
        </div>

        {/* ---------- Footer ---------- */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 items-center justify-center rounded-md border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!reason.trim()}
            className="inline-flex h-10 items-center justify-center rounded-md bg-red-600 px-4 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Confirm Suspension
          </button>
        </div>
      </div>
    </div>
  );
}
