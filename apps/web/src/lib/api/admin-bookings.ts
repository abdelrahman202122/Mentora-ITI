import type { Booking, BookingStatus, PaymentStatus } from "@/types/admin";
import { apiFetch } from "@/lib/api/apiClient";

const BASE_URL = "/api/admin/bookings";

/* ─── Request / response types ─── */

export interface ListBookingsParams {
  page?: number;
  limit?: number;
  bookingStatus?: string;
  paymentStatus?: string;
  startAtFrom?: string; // ISO date
  startAtTo?: string;   // ISO date
}

export interface BookingsListMeta {
  total: number;
  page: number;
  totalPages: number;
}

export interface BookingsListResponse {
  success: boolean;
  message: string;
  data: {
    bookings: RawBookingFromBackend[];
    total: number;
    page: number;
    totalPages: number;
  };
}

export interface RawBookingFromBackend {
  _id: string;
  bookingId?: string;
  learnerId?: string | { _id: string; name?: string };
  tutorId?: string | { _id: string; name?: string };
  subjectId?: string | { _id: string; title?: string; name?: string };
  startAt?: string | Date;
  bookingStatus?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  [key: string]: unknown;
}

/* ─── Shared response handler ─── */

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    throw new Error("Authentication required");
  }
  if (res.status === 403) {
    throw new Error("You don't have permission to access this resource");
  }
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      // ✅ Handle Zod validation error shape: { errors: { field: [msg] } }
      if (body.errors) {
        const firstField = Object.keys(body.errors)[0];
        const firstMsg = body.errors[firstField]?.[0];
        message = firstMsg || body.message || message;
      } else {
        message = body.message || body.error || message;
      }
    } catch {
      /* no JSON body */
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

/* ─── Helpers ─── */

/* ✅ FIXED: Map backend booking status (lowercase) → frontend BookingStatus
   Backend enum: pending, confirmed, rejected, completed, canceled, expired
   Note: 'canceled' (single L), NOT 'cancelled' */
const bookingStatusMap: Record<string, BookingStatus> = {
  pending: "PENDING",
  confirmed: "CONFIRMED",
  rejected: "REJECTED",
  completed: "COMPLETED",
  canceled: "CANCELLED",     // backend 'canceled' → frontend 'CANCELLED'
  cancelled: "CANCELLED",    // handle double-L just in case
  expired: "EXPIRED",
  // Uppercase variants (in case backend returns capitalized)
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  REJECTED: "REJECTED",
  COMPLETED: "COMPLETED",
  CANCELED: "CANCELLED",
  CANCELLED: "CANCELLED",
  EXPIRED: "EXPIRED",
};

/* ✅ FIXED: Map backend payment status (lowercase) → frontend PaymentStatus
   Backend enum: unpaid, pending, paid, failed, refunded */
const paymentStatusMap: Record<string, PaymentStatus> = {
  unpaid: "PENDING",     // map 'unpaid' to 'PENDING' for display
  pending: "PENDING",
  paid: "PAID",
  failed: "FAILED",
  refunded: "REFUNDED",
  // Uppercase variants
  UNPAID: "PENDING",
  PENDING: "PENDING",
  PAID: "PAID",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
};

/* Format ISO date → "Oct 25, 2023" */
function formatDate(iso?: string | Date): string {
  if (!iso) return "—";
  try {
    const date = typeof iso === "string" ? new Date(iso) : iso;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

/* Safely extract a name from a populated or string field */
function extractName(
  field: string | { _id: string; name?: string; title?: string } | undefined,
  fallback: string,
): string {
  if (!field) return fallback;
  if (typeof field === "string") return field.slice(-8); // show last 8 chars of ID if not populated
  return field.name ?? field.title ?? fallback;
}

/* Safely extract a subject title */
function extractSubject(
  field: string | { _id: string; title?: string; name?: string } | undefined,
): string {
  if (!field) return "Unknown";
  if (typeof field === "string") return "Subject";
  return field.title ?? field.name ?? "Unknown";
}

/**
 * Map a raw backend booking into the frontend `Booking` shape.
 */
export function mapToBooking(raw: RawBookingFromBackend): Booking {
  const bookingStatus: BookingStatus =
    bookingStatusMap[raw.bookingStatus ?? ""] ?? "PENDING";

  const payment: PaymentStatus =
    paymentStatusMap[raw.paymentStatus ?? ""] ?? "PENDING";

  return {
    id: raw._id,
    bookingId: raw.bookingId ?? `#BK-${raw._id.slice(-6).toUpperCase()}`,
    learner: extractName(raw.learnerId as any, "Unknown Learner"),
    tutor: extractName(raw.tutorId as any, "Unknown Tutor"),
    subject: extractSubject(raw.subjectId as any),
    hasBadge: false,
    date: formatDate(raw.startAt),
    status: bookingStatus,
    payment,
    paymentMethod: raw.paymentMethod,
  };
}

/* ─── 1. GET /api/admin/bookings ─── */

export async function listBookings(
  params: ListBookingsParams = {},
): Promise<{ bookings: Booking[]; meta: BookingsListMeta }> {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.bookingStatus) qs.set("bookingStatus", params.bookingStatus);
  if (params.paymentStatus) qs.set("paymentStatus", params.paymentStatus);
  if (params.startAtFrom) qs.set("startAtFrom", params.startAtFrom);
  if (params.startAtTo) qs.set("startAtTo", params.startAtTo);

  const res = await apiFetch(`${BASE_URL}?${qs.toString()}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const json = await handleResponse<BookingsListResponse>(res);

  return {
    bookings: json.data.bookings.map(mapToBooking),
    meta: {
      total: json.data.total,
      page: json.data.page,
      totalPages: json.data.totalPages,
    },
  };
}
