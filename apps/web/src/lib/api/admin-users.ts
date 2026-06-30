
import type { User, Status, Role } from "@/types/admin";

const BASE_URL = "/api/admin/users";

export interface ListUsersParams {
  page?: number;
  perPage?: number;
  search?: string;
  role?: Role | "";        // ✅ typed Role, not generic string
  status?: Status | "";
}

export interface UsersListMeta {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
}

export interface UsersListResponse {
  success: boolean;
  data: User[];
  meta: UsersListMeta;
}

export interface CreateUserPayload {
  fullName: string;
  email: string;
  role: Role;
  status: Status;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  roleLabel?: string;
  status?: Status;
}

export interface ChangeStatusPayload {
  status: Status;
  reason: string;
}

export interface ChangeStatusResult {
  id: string;
  previousStatus: Status;
  newStatus: Status;
}

/* ─── Shared response handler ─── */

async function handleResponse<T>(res: Response): Promise<T> {
  // ✅ 401 = not authenticated → user-facing message
  if (res.status === 401) {
    throw new Error("Authentication required");
  }
  // ✅ 403 = authenticated but not admin
  if (res.status === 403) {
    throw new Error("You don't have permission to access this resource");
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      message = body.message || body.error || message;
    } catch {
      /* response had no JSON body */
    }
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

/* ─── 1. GET /api/admin/users ─── */

export async function listUsers(
  params: ListUsersParams = {},
): Promise<UsersListResponse> {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.perPage) qs.set("perPage", String(params.perPage));
  if (params.search) qs.set("search", params.search);
  // ✅ CHANGED: send role as-is (backend Zod accepts "Tutor"/"Student"/"Admin")
  if (params.role) qs.set("role", params.role);
  if (params.status) qs.set("status", params.status);

  const res = await fetch(`${BASE_URL}?${qs.toString()}`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  return handleResponse<UsersListResponse>(res);
}

/* ─── 2. GET /api/admin/users/:id ─── */

export async function getUserDetail(userId: string): Promise<User> {
  const res = await fetch(`${BASE_URL}/${userId}`, {
    method: "GET",
    credentials: "include",
  });
  const json = await handleResponse<{ success: boolean; data: User }>(res);
  return json.data;
}

/* ─── 3. POST /api/admin/users ─── */

export async function createUser(
  payload: CreateUserPayload,
): Promise<User> {
  const res = await fetch(`${BASE_URL}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await handleResponse<{ success: boolean; data: User }>(res);
  return json.data;
}

/* ─── 4. PATCH /api/admin/users/:id ─── */

export async function updateUser(
  userId: string,
  payload: UpdateUserPayload,
): Promise<User> {
  const res = await fetch(`${BASE_URL}/${userId}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await handleResponse<{ success: boolean; data: User }>(res);
  return json.data;
}

/* ─── 5. PATCH /api/admin/users/:id/status ─── */

export async function changeUserStatus(
  userId: string,
  payload: ChangeStatusPayload,
): Promise<ChangeStatusResult> {
  const res = await fetch(`${BASE_URL}/${userId}/status`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await handleResponse<{
    success: boolean;
    data: ChangeStatusResult;
  }>(res);
  return json.data;
}

/* ─── 6. GET /api/admin/users/export ─── */

export async function exportUsersCsv(
  params: Omit<ListUsersParams, "page" | "perPage"> = {},
): Promise<Blob> {
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (params.role) qs.set("role", params.role);
  if (params.status) qs.set("status", params.status);

  const res = await fetch(`${BASE_URL}/export?${qs.toString()}`, {
    method: "GET",
    credentials: "include",
  });
  if (res.status === 401) throw new Error("Authentication required");
  if (res.status === 403) throw new Error("Permission denied");
  if (!res.ok) throw new Error(`Export failed (${res.status})`);
  return res.blob();
}


/* ─── 7. GET /api/admin/users/:id/audit-logs ─── */

export interface AuditLogEntry {
  id: string;
  action: string;            // e.g. "PROFILE_UPDATED", "STATUS_CHANGED"
  performedBy: string;       // e.g. "Admin User" or "System"
  details: string | null;    // human-readable description
  timestamp: string;         // ISO date string
}

export interface AuditLogsResponse {
  success: boolean;
  data: AuditLogEntry[];
  meta: {
    page: number;
    perPage: number;
    totalItems: number;
  };
}

export async function getUserAuditLogs(
  userId: string,
  params: { page?: number; perPage?: number } = {},
): Promise<AuditLogsResponse> {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.perPage) qs.set("perPage", String(params.perPage));

  const res = await fetch(`${BASE_URL}/${userId}/audit-logs?${qs.toString()}`, {
    method: "GET",
    credentials: "include",
  });
  return handleResponse<AuditLogsResponse>(res);
}

