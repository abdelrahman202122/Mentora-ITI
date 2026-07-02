import type { Tutor, ApprovalStatus, AccountStatus } from "@/types/admin";
import { apiFetch } from "@/lib/api/apiClient";

const BASE_URL = "/api/admin/tutors";

/* ─── Request / response types ─── */

export interface ListTutorsParams {
  page?: number;
  limit?: number;
  search?: string;
  statuses?: string[];
  subjects?: string[];
  minRating?: number;
}

export interface TutorStats {
  totalTutors: number;
  activeTutors: number;
  pendingApproval: number;
  avgRating: number;
}

export interface TutorsListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TutorsListResponse {
  success: boolean;
  message: string;
  data: {
    tutors: RawTutorFromBackend[];
    pagination: TutorsListMeta;
  };
}

export interface UpdateTutorPayload {
  headline?: string;
  bio?: string;
  hourlyRate?: number;
  languages?: string[];
  isAvailable?: boolean;
  experience?: Array<any>;
  education?: Array<any>;
  status?: "pending" | "approved" | "rejected";
  moderatorNotes?: string | null;
}

// ✅ FIX: This interface now matches your EXACT backend response shape
export interface RawTutorFromBackend {
  userId: string;
  name: string;
  isEmailVerified?: boolean;
  isActive?: boolean;
  profile?: {
    id: string;
    bio?: string;
    headline?: string;
    hourlyRate?: number;
    rating?: number;
    totalReviews?: number;
    languages?: string[];
    education?: Array<any>;
    experience?: Array<any>;
    isAvailable?: boolean;
    status?: "pending" | "approved" | "rejected";
  };
  subjects?: Array<{
    id: string;
    title: string;
  }>;
}

/* ─── Shared response handler ─── */

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) throw new Error("Authentication required");
  if (res.status === 403) throw new Error("You don't have permission to access this resource");
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      message = body.message || body.error || message;
    } catch {
      /* no JSON body */
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

/* ─── Helpers ─── */

const statusToFrontend: Record<string, ApprovalStatus> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

function formatJoinedDate(iso?: string): string | undefined {
  if (!iso) return undefined;
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  } catch {
    return undefined;
  }
}

function safeNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

export function mapToTutor(raw: RawTutorFromBackend): Tutor {
  // ✅ FIX: Data is flattened. Name and ID are at the root level.
  const id = raw?.userId ?? "";
  const userName = raw?.name ?? "Unknown Tutor";
  const userIsActive = raw?.isActive !== false;
  
  const account: AccountStatus = userIsActive === false ? "Inactive" : "Active";

  // ✅ FIX: Profile data is nested under `raw.profile`
  const profile = raw?.profile;

  // ✅ FIX: Subjects are an array of objects with a `title` property under `raw.subjects`
  const subjects: string[] = Array.isArray(raw?.subjects)
    ? raw.subjects.map((s) => s.title).filter(Boolean)
    : [];

  const experience = (profile?.experience ?? []).map((exp: any) => {
    const period = exp?.isCurrent
      ? `${exp.startYear ?? ""} - Present`
      : exp?.endYear
        ? `${exp.startYear ?? ""} - ${exp.endYear}`
        : String(exp?.startYear ?? "");
    return {
      title: exp?.title ?? "",
      org: exp?.org ?? "",
      period,
      description: exp?.description ?? "",
    };
  });

  const approval: ApprovalStatus =
    statusToFrontend[profile?.status ?? ""] ?? "Pending";

  const hourlyRate = safeNumber(profile?.hourlyRate);
  const rating = safeNumber(profile?.rating);

  return {
    id,
    name: userName,
    email: "",
    subjects,
    hourlyRate,
    rating,
    approval,
    account,
    avatarUrl: undefined, // Not returned in the API response
    degree: profile?.education?.[0]?.degree,
    joinedDate: formatJoinedDate(profile?.id), // Using profile ID as a fallback for join date context
    bio: profile?.bio,
    experience,
    commissionRate: "15%", // Not in API response, defaulting
    moderatorNotes: undefined, // Not in API response
  };
}

/* ─── 1. GET /api/admin/tutors/stats ─── */

export async function getTutorStats(): Promise<TutorStats> {
  const res = await apiFetch(`${BASE_URL}/stats`, { method: "GET" });
  const json = await handleResponse<{ success: boolean; data: TutorStats }>(res);
  return json.data;
}

/* ─── 2. GET /api/admin/tutors (list) ─── */

export async function listTutors(
  params: ListTutorsParams = {},
): Promise<{ tutors: Tutor[]; meta: TutorsListMeta }> {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.search) qs.set("q", params.search);

  if (params.statuses && params.statuses.length > 0) {
    const statusMap: Record<string, string> = {
      Approved: "approved",
      Pending: "pending",
      Rejected: "rejected",
    };
    params.statuses.forEach((s) => {
      qs.append("profileStatus", statusMap[s] ?? s.toLowerCase());
    });
  }

  if (params.subjects && params.subjects.length > 0) {
    params.subjects.forEach((s) => {
      qs.append("languages", s);
    });
  }

  if (params.minRating) {
    qs.set("minRating", String(params.minRating));
  }

  const res = await apiFetch(`${BASE_URL}?${qs.toString()}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  const json = await handleResponse<TutorsListResponse>(res);

  return {
    tutors: json.data.tutors.map(mapToTutor),
    meta: json.data.pagination,
  };
}

/* ─── 3. POST /api/admin/tutors/:tutorId/approve ─── */

export async function approveTutor(tutorId: string): Promise<void> {
  const res = await apiFetch(`${BASE_URL}/${tutorId}/approve`, { method: "POST" });
  await handleResponse<{ success: boolean }>(res);
}

/* ─── 4. POST /api/admin/tutors/:tutorId/reject ─── */

export async function rejectTutor(tutorId: string): Promise<void> {
  const res = await apiFetch(`${BASE_URL}/${tutorId}/reject`, { method: "POST" });
  await handleResponse<{ success: boolean }>(res);
}

/* ─── 5. PATCH /api/admin/tutors/:tutorId ─── */

export async function updateTutor(
  tutorId: string,
  payload: UpdateTutorPayload,
): Promise<Tutor> {
  const res = await apiFetch(`${BASE_URL}/${tutorId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await handleResponse<{ success: boolean; data: RawTutorFromBackend }>(res);
  return mapToTutor(json.data);
}