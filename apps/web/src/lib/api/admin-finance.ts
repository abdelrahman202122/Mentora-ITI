import { apiFetch } from "@/lib/api/apiClient";

const BASE_URL = "/api/admin/finance";

/* ═══════════════════════════════════════════════════════════════════
   TYPES — match backend FinanceStats shape
   ═══════════════════════════════════════════════════════════════════ */

export interface FinanceStats {
  bookings: {
    total: number;
    confirmed: number;
    completed: number;
    canceled: number;
    expired: number;
  };
  earnings: {
    totalPaidRevenue: number;
    platformCommissionTotal: number;
    tutorEarningsTotal: number;
    pending: { count: number; amount: number };
    available: { count: number; amount: number };
    paidOut: { count: number; amount: number };
  };
}

export interface Withdrawal {
  id: string;
  tutor: string;
  avatarUrl: string;
  requestedAmount: number;
  walletBalance: number;
  requestDate: string;
  status: "PENDING" | "AVAILABLE" | "PAID_OUT" | "CANCELED";
}

/* Raw IEarning shape from backend (before population) */
interface RawEarning {
  _id: string;
  tutorId?: string | { _id: string; name?: string; avatar?: string };
  tutorAmount?: number;
  grossAmount?: number;
  commissionAmount?: number;
  status?: string;
  createdAt?: string;
  paidOutAt?: string;
  bookingId?: string | { _id: string };
  [key: string]: unknown;
}

interface WithdrawalsListResponse {
  success: boolean;
  message: string;
  data: {
    earnings: RawEarning[];
    total: number;
    page: number;
    totalPages: number;
  };
}

interface ApproveAllResult {
  approvedCount: number;
  matchedCount: number;
  modifiedCount: number;
}

/* ═══════════════════════════════════════════════════════════════════
   SHARED RESPONSE HANDLER
   ═══════════════════════════════════════════════════════════════════ */

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) throw new Error("Authentication required");
  if (res.status === 403) throw new Error("You don't have permission to access this resource");
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body.errors) {
        const firstField = Object.keys(body.errors)[0];
        message = body.errors[firstField]?.[0] || body.message || message;
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

/* ═══════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════ */

export function formatCurrency(n: number, currency = "EGP"): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatDate(iso?: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

/* Map backend EarningStatus → frontend display status
   Backend enum: PENDING, AVAILABLE, PAID_OUT, CANCELED */
const earningStatusMap: Record<string, Withdrawal["status"]> = {
  pending: "PENDING",
  available: "AVAILABLE",
  paid_out: "PAID_OUT",
  paidout: "PAID_OUT",
  canceled: "CANCELED",
  cancelled: "CANCELED",
  PENDING: "PENDING",
  AVAILABLE: "AVAILABLE",
  PAID_OUT: "PAID_OUT",
  CANCELED: "CANCELED",
};

function mapToWithdrawal(raw: RawEarning): Withdrawal {
  let tutorName = "Unknown Tutor";
  let avatarUrl = "";

  if (raw.tutorId) {
    if (typeof raw.tutorId === "object") {
      tutorName = raw.tutorId.name ?? "Unknown Tutor";
      avatarUrl = raw.tutorId.avatar ?? "";
    } else if (typeof raw.tutorId === "string") {
      tutorName = `Tutor ${raw.tutorId.slice(-6)}`;
    }
  }

  return {
    id: raw._id,
    tutor: tutorName,
    avatarUrl,
    requestedAmount: raw.tutorAmount ?? 0,
    walletBalance: 0, // not available in Earning model; show 0
    requestDate: formatDate(raw.createdAt),
    status: earningStatusMap[raw.status ?? ""] ?? "PENDING",
  };
}

/* ═══════════════════════════════════════════════════════════════════
   1. GET /api/admin/finance/stats
   ═══════════════════════════════════════════════════════════════════ */

export async function getFinanceStats(): Promise<FinanceStats> {
  const res = await apiFetch(`${BASE_URL}/stats`, { method: "GET" });
  const json = await handleResponse<{ success: boolean; data: FinanceStats }>(res);
  return json.data;
}

/* ═══════════════════════════════════════════════════════════════════
   2. GET /api/admin/finance/withdrawals
   ═══════════════════════════════════════════════════════════════════ */

export interface ListWithdrawalsParams {
  page?: number;
  limit?: number;
  status?: string;
  tutorId?: string;
}

export async function listWithdrawals(
  params: ListWithdrawalsParams = {},
): Promise<{ withdrawals: Withdrawal[]; meta: { total: number; page: number; totalPages: number } }> {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.status) qs.set("status", params.status);
  if (params.tutorId) qs.set("tutorId", params.tutorId);

  const res = await apiFetch(`${BASE_URL}/withdrawals?${qs.toString()}`, {
    method: "GET",
  });
  const json = await handleResponse<WithdrawalsListResponse>(res);

  return {
    withdrawals: (json.data.earnings ?? []).map(mapToWithdrawal),
    meta: {
      total: json.data.total ?? 0,
      page: json.data.page ?? 1,
      totalPages: json.data.totalPages ?? 1,
    },
  };
}

/* ═══════════════════════════════════════════════════════════════════
   3. POST /api/admin/finance/withdrawals/approveAll
   ═══════════════════════════════════════════════════════════════════ */

export async function approveAllWithdrawals(): Promise<ApproveAllResult> {
  const res = await apiFetch(`${BASE_URL}/withdrawals/approveAll`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  const json = await handleResponse<{ success: boolean; data: ApproveAllResult }>(res);
  return json.data;
}

/* ═══════════════════════════════════════════════════════════════════
   4. POST /api/admin/finance/withdrawals/:earningId/approve
   ═══════════════════════════════════════════════════════════════════ */

export async function approveWithdrawal(earningId: string): Promise<void> {
  const res = await apiFetch(`${BASE_URL}/withdrawals/${earningId}/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  await handleResponse<{ success: boolean }>(res);
}

/* ═══════════════════════════════════════════════════════════════════
   5. POST /api/admin/finance/withdrawals/:earningId/cancel
   ═══════════════════════════════════════════════════════════════════ */

export async function cancelWithdrawal(earningId: string): Promise<void> {
  const res = await apiFetch(`${BASE_URL}/withdrawals/${earningId}/cancel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  await handleResponse<{ success: boolean }>(res);
}
