
import type {
  Role,
  Status,
  ApprovalStatus,
  AccountStatus,
  TxStatus,
  WithdrawalStatus,
  BookingStatus,
} from "@/types/admin";

/* ----------------------------- Users --------------------------------- */
export const roleBadgeClasses: Record<Role, string> = {
  Tutor: "bg-blue-500/10 text-blue-600 ring-1 ring-inset ring-blue-500/20",
  Student: "bg-blue-500/10 text-blue-600 ring-1 ring-inset ring-blue-500/20",
  Admin: "bg-purple-500/10 text-purple-600 ring-1 ring-inset ring-purple-500/20",
};

export const statusBadgeClasses: Record<Status, string> = {
  Active:
    "bg-emerald-500/10 text-emerald-600 ring-1 ring-inset ring-emerald-500/20",
  Pending:
    "bg-amber-500/10 text-amber-600 ring-1 ring-inset ring-amber-500/20",
  Suspended:
    "bg-red-500/10 text-red-600 ring-1 ring-inset ring-red-500/20",
};

/* ----------------------------- Tutors -------------------------------- */
export const approvalBadgeClasses: Record<ApprovalStatus, string> = {
  Approved: "bg-emerald-500/10 text-emerald-700",
  Pending: "bg-amber-500/10 text-amber-700",
  Rejected: "bg-red-500/10 text-red-700",
};

export const accountBadgeClasses: Record<AccountStatus, string> = {
  Active: "bg-blue-500/10 text-blue-700",
  Inactive: "bg-gray-500/10 text-gray-700",
  Suspended: "bg-red-500/10 text-red-700",
};

/* ----------------------------- Finance ------------------------------- */
export const txStatusBadgeClasses: Record<TxStatus, string> = {
  COMPLETED: "bg-emerald-500 text-white",
  PROCESSING: "bg-blue-500 text-white",
  PENDING: "bg-amber-500 text-white",
  FAILED: "bg-red-500 text-white",
};

export const withdrawalStatusBadgeClasses: Record<WithdrawalStatus, string> = {
  PENDING: "bg-red-500 text-white",
  APPROVED: "bg-emerald-500 text-white",
  REJECTED: "bg-gray-400 text-white",
  PROCESSING: "bg-amber-500 text-white",
};

/* ----------------------------- Bookings ------------------------------ */
export const bookingStatusBadgeClasses: Record<BookingStatus, string> = {
    PENDING: "bg-amber-500 text-white",
    CONFIRMED: "bg-blue-500 text-white",
    REJECTED: "bg-rose-500 text-white",
    COMPLETED: "bg-emerald-500 text-white",
    CANCELLED: "bg-red-500 text-white",
    EXPIRED: "bg-gray-400 text-white",
};

/* ----------------------------- Reviews ------------------------------- */
export const REVIEW_AVATAR_COLORS = [
  "bg-indigo-100 text-indigo-600",
  "bg-rose-100 text-rose-600",
  "bg-emerald-100 text-emerald-600",
  "bg-amber-100 text-amber-600",
  "bg-sky-100 text-sky-600",
];
