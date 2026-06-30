"use client";

import { X, Send, MoreHorizontal, Clock, Star, Mail, Calendar, Activity, Ban, ScrollText, RotateCcw } from "lucide-react";
import { useDrawerEffects } from "@/hooks/admin/use-drawer-effects";
import { DrawerOverlay } from "@/components/admin/shared/drawer-overlay";
import { Avatar } from "@/components/admin/shared/avatar";
import type { User, Status } from "@/types/admin";

interface UserDrawerProps {
  user: User | null;
  onClose: () => void;
  onSuspend: (user: User) => void;
  onRestore: (user: User) => void;
  onAuditLogs: (user: User) => void;
}

export function UserDrawer({
  user,
  onClose,
  onSuspend,
  onRestore,
  onAuditLogs,
}: UserDrawerProps) {
  useDrawerEffects(!!user, onClose);

  if (!user) return null;

  // 🎯 CONDITIONAL BUTTONS based on current status:
  // - Suspended → show "Restore Account" button (green)
  // - Active / Pending → show "Suspend Account" button (red)
  const isSuspended = user.status === "Suspended";

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <DrawerOverlay onClick={onClose} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`User details: ${user.name}`}
        className="relative flex h-full w-full max-w-[400px] flex-col rounded-l-xl bg-white shadow-2xl"
      >
        {/* ---------- Header ---------- */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-medium text-gray-900">User Details</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ---------- Scrollable body ---------- */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Avatar + name + role + actions */}
          <div className="flex flex-col items-start gap-4">
            <div className="relative">
              <Avatar
                name={user.name}
                seed={user.id}
                avatarUrl={user.avatarUrl ?? undefined}
                size="lg"
              />
              {/* Status indicator dot — color changes with status */}
              <span
                className={`absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white ${
                  user.status === "Active"
                    ? "bg-emerald-500"
                    : user.status === "Pending"
                      ? "bg-amber-500"
                      : "bg-red-500"
                }`}
              />
            </div>

            <div className="w-full">
              <h3 className="text-xl font-semibold text-gray-900">
                {user.name}
              </h3>
              {user.roleLabel && (
                <p className="mt-0.5 text-sm text-gray-500">
                  {user.roleLabel}
                </p>
              )}

              {/* Status badge prominently displayed */}
              <span
                className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  user.status === "Active"
                    ? "bg-emerald-500/10 text-emerald-600 ring-1 ring-inset ring-emerald-500/20"
                    : user.status === "Pending"
                      ? "bg-amber-500/10 text-amber-600 ring-1 ring-inset ring-amber-500/20"
                      : "bg-red-500/10 text-red-600 ring-1 ring-inset ring-red-500/20"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    user.status === "Active"
                      ? "bg-emerald-500"
                      : user.status === "Pending"
                        ? "bg-amber-500"
                        : "bg-red-500"
                  }`}
                />
                {user.status}
              </span>

              {/* Send Message + More buttons */}
              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
                >
                  <Send className="h-4 w-4" />
                  Send Message
                </button>
                <button
                  type="button"
                  aria-label="More actions"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* ---------- Stats grid ---------- */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-gray-400" />
                <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">
                  Total Sessions
                </p>
              </div>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {user.totalSessions ?? 0}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">
                  Avg. Rating
                </p>
              </div>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {user.avgRating?.toFixed(1) ?? "—"}
              </p>
            </div>
          </div>

          {/* ---------- Metadata ---------- */}
          <div className="mt-6">
            <div className="border-t border-gray-100">
              <div className="flex items-start gap-3 py-3">
                <Mail className="mt-0.5 h-4 w-4 text-gray-400" />
                <div className="flex-1">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">
                    Email Address
                  </p>
                  <p className="mt-0.5 text-sm text-gray-900">{user.email}</p>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-100">
              <div className="flex items-start gap-3 py-3">
                <Calendar className="mt-0.5 h-4 w-4 text-gray-400" />
                <div className="flex-1">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">
                    Registration Date
                  </p>
                  <p className="mt-0.5 text-sm text-gray-900">{user.regDate}</p>
                </div>
              </div>
            </div>
            <div className="border-t border-b border-gray-100">
              <div className="flex items-start gap-3 py-3">
                <Activity className="mt-0.5 h-4 w-4 text-gray-400" />
                <div className="flex-1">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">
                    Last Activity
                  </p>
                  <p className="mt-0.5 text-sm text-gray-900">
                    {user.lastActivity ?? "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- Sticky footer with CONDITIONAL action buttons ---------- */}
        <div className="border-t border-gray-100 bg-white px-6 py-4">
          <div className="flex gap-3">
            {/* 🎯 CONDITIONAL: Suspend OR Restore button */}
            {isSuspended ? (
              <button
                type="button"
                onClick={() => onRestore(user)}
                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md border border-emerald-500 bg-white px-4 text-sm font-semibold text-emerald-600 transition-colors hover:bg-emerald-50"
              >
                <RotateCcw className="h-4 w-4" />
                Restore Account
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onSuspend(user)}
                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md border border-red-500 bg-white px-4 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50"
              >
                <Ban className="h-4 w-4" />
                Suspend Account
              </button>
            )}
            <button
              type="button"
              onClick={() => onAuditLogs(user)}
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-gray-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
            >
              <ScrollText className="h-4 w-4" />
              Audit Logs
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
