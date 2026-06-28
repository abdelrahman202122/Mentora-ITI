
"use client";

import { useState, useEffect } from "react";
import { X, Camera, Star } from "lucide-react";
// import { useDrawerEffects } from "@/hooks/use-drawer-effects";
// import { DrawerOverlay } from "@/components/shared/drawer-overlay";
// import { Avatar } from "@/components/shared/avatar";
import type { User } from "@/types/admin";
import { useDrawerEffects } from "@/hooks/admin/use-drawer-effects";
import { Avatar, DrawerOverlay } from "../../shared";

export interface EditUserFormState {
  name: string;
  roleLabel: string;
  email: string;
}

interface EditUserDrawerProps {
  user: User | null;
  onClose: () => void;
  onSave: (user: User, form: EditUserFormState) => void;
}

export function EditUserDrawer({
  user,
  onClose,
  onSave,
}: EditUserDrawerProps) {
  const [form, setForm] = useState<EditUserFormState>({
    name: "",
    roleLabel: "",
    email: "",
  });

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name,
      roleLabel: user.roleLabel ?? "",
      email: user.email,
    });
  }, [user]);

  useDrawerEffects(!!user, onClose);

  if (!user) return null;

  const update = <K extends keyof EditUserFormState>(
    key: K,
    value: EditUserFormState[K],
  ) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <DrawerOverlay onClick={onClose} opacity="bg-black/50" />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Edit user: ${user.name}`}
        className="relative flex h-full w-full max-w-[400px] flex-col rounded-l-xl bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Edit User Profile
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close edit panel"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          {/* Avatar + change picture */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <Avatar
                name={user.name}
                seed={user.id}
                avatarUrl={user.avatarUrl}
                size="lg"
              />
              <span className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-gray-700">
                <Camera className="h-2.5 w-2.5 text-white" />
              </span>
            </div>
            <button
              type="button"
              className="text-xs font-medium text-indigo-600 transition-colors hover:text-indigo-700"
            >
              Change Picture
            </button>
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Professional Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-700">
              Professional Title
            </label>
            <input
              type="text"
              value={form.roleLabel}
              onChange={(e) => update("roleLabel", e.target.value)}
              placeholder="e.g. Senior Mathematics Tutor"
              className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Stats — read-only */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-700">
                Total Sessions
              </label>
              <div className="flex h-10 items-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm text-gray-500">
                {user.totalSessions ?? 0}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-700">
                Avg. Rating
              </label>
              <div className="flex h-10 items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-3 text-sm text-gray-500">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                {user.avgRating?.toFixed(1) ?? "—"}
              </div>
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Registration Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-700">
              Registration Date
            </label>
            <div className="flex h-10 items-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm text-gray-500">
              {user.regDate}
            </div>
          </div>

          {/* Last Activity */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-700">
              Last Activity
            </label>
            <div className="flex h-10 items-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm text-gray-500">
              {user.lastActivity ?? "—"}
            </div>
          </div>
        </div>

        {/* Sticky footer */}
        <div className="space-y-3 border-t border-gray-200 px-6 py-5">
          <button
            type="button"
            onClick={() => onSave(user, form)}
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-indigo-600 px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-full items-center justify-center rounded-md border border-gray-300 bg-transparent px-4 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </aside>
    </div>
  );
}
