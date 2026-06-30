"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Loader2, AlertCircle } from "lucide-react";
import { useDrawerEffects } from "@/hooks/admin/use-drawer-effects";
import { ModalOverlay } from "@/components/admin/shared/modal-overlay";
import type { User } from "@/types/admin";
import {
  getUserAuditLogs,
  type AuditLogEntry,
} from "@/lib/api/admin-users";

interface AuditLogsModalProps {
  user: User | null;
  onClose: () => void;
}

/* ─── Color coding per action type ─── */

interface ActionStyle {
  label: string;
  dotColor: string;
  textColor: string;
}

function getActionStyle(action: string): ActionStyle {
  const lower = action.toLowerCase();

  // Suspended / Deleted / Banned → red
  if (
    lower.includes("suspend") ||
    lower.includes("delete") ||
    lower.includes("ban") ||
    lower.includes("reject") ||
    lower.includes("fail")
  ) {
    return {
      label: prettifyAction(action),
      dotColor: "bg-red-500",
      textColor: "text-red-600",
    };
  }

  // Created / Registered / Approved → green
  if (
    lower.includes("create") ||
    lower.includes("register") ||
    lower.includes("approve") ||
    lower.includes("login") ||
    lower.includes("active")
  ) {
    return {
      label: prettifyAction(action),
      dotColor: "bg-emerald-500",
      textColor: "text-emerald-600",
    };
  }

  // Updated / Changed / Restored → blue
  if (
    lower.includes("update") ||
    lower.includes("change") ||
    lower.includes("restore") ||
    lower.includes("role") ||
    lower.includes("status")
  ) {
    return {
      label: prettifyAction(action),
      dotColor: "bg-blue-500",
      textColor: "text-blue-600",
    };
  }

  // Default → gray
  return {
    label: prettifyAction(action),
    dotColor: "bg-gray-400",
    textColor: "text-gray-600",
  };
}

/* Convert "PROFILE_UPDATED" → "Profile Updated" */
function prettifyAction(action: string): string {
  return action
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/* Format ISO date → "JUNE 29, 2026" */
function formatDateHeading(iso: string): string {
  try {
    return new Date(iso)
      .toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
      .toUpperCase();
  } catch {
    return iso;
  }
}

/* Format ISO date → "1:50 PM" */
function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return iso;
  }
}

export function AuditLogsModal({ user, onClose }: AuditLogsModalProps) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useDrawerEffects(!!user, onClose);

  /* ─── Fetch logs whenever a user is opened ─── */
  const fetchLogs = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getUserAuditLogs(userId, { page: 1, perPage: 50 });
      setLogs(result.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load audit logs.",
      );
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void fetchLogs(user.id);
    } else {
      // Reset when modal closes
      setLogs([]);
      setError(null);
    }
  }, [user, fetchLogs]);

  if (!user) return null;

  /* ─── Group logs by date for display ─── */
  const groupedByDate = logs.reduce<
    Record<string, AuditLogEntry[]>
  >((acc, log) => {
    const dateKey = formatDateHeading(log.timestamp);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(log);
    return acc;
  }, {});

  const dateKeys = Object.keys(groupedByDate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <ModalOverlay onClick={onClose} />

      {/* Modal panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Audit logs: ${user.name}`}
        className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col rounded-xl bg-white shadow-2xl"
      >
        {/* ─── Header ─── */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold text-gray-900">
              Audit Logs
            </h2>
            <p className="text-xs text-gray-500">{user.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            disabled={loading}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ─── Body (scrollable) ─── */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
              <p className="text-sm text-gray-500">Loading audit logs…</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <div className="flex items-center gap-2 text-sm text-red-700">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={() => fetchLogs(user.id)}
                className="text-sm font-medium text-indigo-600 underline hover:text-indigo-700"
              >
                Retry
              </button>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-sm text-gray-500">
              No audit logs found for this user.
            </div>
          ) : (
            <div className="space-y-6">
              {dateKeys.map((dateKey) => (
                <div key={dateKey}>
                  {/* Date heading */}
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    {dateKey}
                  </p>

                  {/* Log entries for this date */}
                  <div className="space-y-4">
                    {groupedByDate[dateKey].map((log) => {
                      const style = getActionStyle(log.action);
                      return (
                        <div
                          key={log.id}
                          className="flex items-start gap-3"
                        >
                          {/* Colored dot */}
                          <span
                            className={`mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full ${style.dotColor}`}
                          />

                          {/* Content */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline justify-between gap-2">
                              <p
                                className={`text-sm font-semibold ${style.textColor}`}
                              >
                                {style.label}
                              </p>
                              <span className="flex-shrink-0 text-xs text-gray-400">
                                {formatTime(log.timestamp)}
                              </span>
                            </div>
                            <p className="mt-0.5 text-xs text-gray-500">
                              by {log.performedBy}
                            </p>
                            {log.details && (
                              <p className="mt-1 text-sm text-gray-600">
                                {log.details}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── Footer ─── */}
        <div className="flex items-center justify-end border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 items-center justify-center rounded-md border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
