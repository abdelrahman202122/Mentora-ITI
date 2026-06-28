
"use client";

import { useState, useEffect } from "react";
import { X, ChevronDown, Info } from "lucide-react";
import { useDrawerEffects } from "@/hooks/admin/use-drawer-effects";
import { ModalOverlay } from "../../shared";

export interface AddUserFormState {
  fullName: string;
  email: string;
  role: string;
  status: string;
}

interface AddUserModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (form: AddUserFormState) => void;
}

const ROLE_OPTIONS = ["Tutor", "Student", "Admin"];
const STATUS_OPTIONS = ["Active", "Pending", "Suspended"];

export function AddUserModal({ open, onClose, onCreate }: AddUserModalProps) {
  const [form, setForm] = useState<AddUserFormState>({
    fullName: "",
    email: "",
    role: "",
    status: "Active",
  });
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setForm({ fullName: "", email: "", role: "", status: "Active" });
    }
  }, [open]);

  useDrawerEffects(open, onClose);

  if (!open) return null;

  const update = <K extends keyof AddUserFormState>(
    key: K,
    value: AddUserFormState[K],
  ) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = () => {
    if (!form.fullName.trim() || !form.email.trim() || !form.role) return;
    onCreate(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <ModalOverlay onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Add New User"
        className="relative z-10 w-full max-w-md rounded-xl bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Add New User
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form body */}
        <div className="space-y-5 px-6 py-6">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              placeholder="e.g. John Doe"
              className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="john.doe@company.com"
              className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Role dropdown */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Role</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setRoleDropdownOpen(!roleDropdownOpen);
                  setStatusDropdownOpen(false);
                }}
                className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <span
                  className={form.role ? "text-gray-800" : "text-gray-400"}
                >
                  {form.role || "Select user role"}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>
              {roleDropdownOpen && (
                <div className="absolute left-0 top-full z-20 mt-1 w-full overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg">
                  {ROLE_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        update("role", option);
                        setRoleDropdownOpen(false);
                      }}
                      className={`flex w-full items-center px-3 py-2 text-left text-sm transition-colors hover:bg-indigo-50 hover:text-indigo-600 ${
                        form.role === option
                          ? "bg-indigo-50 font-medium text-indigo-600"
                          : "text-gray-700"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Status dropdown */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Status
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setStatusDropdownOpen(!statusDropdownOpen);
                  setRoleDropdownOpen(false);
                }}
                className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <span className="text-gray-800">{form.status}</span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>
              {statusDropdownOpen && (
                <div className="absolute left-0 top-full z-20 mt-1 w-full overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg">
                  {STATUS_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        update("status", option);
                        setStatusDropdownOpen(false);
                      }}
                      className={`flex w-full items-center px-3 py-2 text-left text-sm transition-colors hover:bg-indigo-50 hover:text-indigo-600 ${
                        form.status === option
                          ? "bg-indigo-50 font-medium text-indigo-600"
                          : "text-gray-700"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Info message */}
          <div className="flex items-start gap-2.5 rounded-md bg-blue-50 px-3 py-2.5">
            <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
            <p className="text-xs leading-relaxed text-blue-600">
              The new user will receive an automated invitation email to set up
              their password.
            </p>
          </div>
        </div>

        {/* Footer */}
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
            onClick={handleSubmit}
            disabled={
              !form.fullName.trim() || !form.email.trim() || !form.role
            }
            className="inline-flex h-10 items-center justify-center rounded-md bg-indigo-600 px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Create User
          </button>
        </div>
      </div>
    </div>
  );
}
