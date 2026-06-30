import type { Tutor, ApprovalStatus, AccountStatus } from "@/types/admin";
import { apiFetch } from "@/lib/api/apiClient"; 

const BASE_URL = "/api/admin/tutors";

/* ─── Request / response types ─── */

export interface ListTutorsParams {
  page?: number;
  limit?: number;
  search?: string;
  statuses?: string[];      
  subjects?: string[];      // ["Physics", "Math"]
  minRating?: number;       // 4.0 | 4.5
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
  pages: number;
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
  experience?: Array<{
    title: string;
    startYear: number;
    startMonth: number;
    endYear?: number | null;
    endMonth?: number | null;
    isCurrent?: boolean;
  }>;
  education?: Array<{
    degree: string;
    field: string;
    institution: string;
    graduationYear?: number | null;
  }>;
  status?: "pending" | "approved" | "rejected";
  moderatorNotes?: string | null;
}

export interface RawTutorFromBackend {
  _id: string;
  userId: string | { _id?: string; id?: string; name: string; avatar?: string; isActive?: boolean };
  headline?: string;
  bio?: string;
  hourlyRate: number;
  languages?: string[];
  experience?: Array<{
    title: string;
    startYear: number;
    startMonth: number;
    endYear?: number;
    endMonth?: number;
    isCurrent?: boolean;
  }>;
  education?: Array<{
    degree: string;
    field: string;
    institution: string;
    graduationYear?: number;
  }>;
  isAvailable?: boolean;
  rating: number;
  totalReviews?: number;
  status: "pending" | "approved" | "rejected";
  moderatorNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

type RawTutorExperience = NonNullable<RawTutorFromBackend["experience"]>[number] & {
  description?: string;
  org?: string;
};

type AdminTutorApiRecord = RawTutorFromBackend & {
  commissionRate?: string;
  created_at?: string;
  degree?: string;
  hourly_rate?: number | string;
  id?: string;
  subjects?: string[];
  userData?: RawTutorFromBackend["userId"];
};

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
  Pending: "Pending",
  Approved: "Approved",
  Rejected: "Rejected",
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

function safeString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    return String(obj._id ?? obj.id ?? obj.name ?? fallback);
  }
  return fallback;
}

function safeNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

export function mapToTutor(raw: AdminTutorApiRecord): Tutor {
  let userName = "Tutor";
  let userAvatar: string | undefined;
  let userIsActive = true;
  let id = "";

  const userObj = raw?.userId ?? raw?.userData;

  if (userObj) {
    if (typeof userObj === "object") {
      userName = userObj.name ?? "Tutor";
      userAvatar = userObj.avatar ?? undefined;
      userIsActive = userObj.isActive !== false;
      id = String(userObj._id ?? userObj.id ?? "");
    } else if (typeof userObj === "string") {
      id = userObj;
    }
  }

  if (!id) {
    id = safeString(raw?._id ?? raw?.id);
  }

  const account: AccountStatus = userIsActive === false ? "Inactive" : "Active";

  const subjects: string[] = Array.isArray(raw?.languages)
    ? raw.languages
    : Array.isArray(raw?.subjects)
      ? raw.subjects
      : [];

  const experience = (raw?.experience ?? []).map((exp: RawTutorExperience) => {
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
    statusToFrontend[raw?.status] ??
    (raw?.status ? "Pending" : "Pending");

  return {
    id,
    name: userName,
    email: "",
    subjects,
    hourlyRate: safeNumber(raw?.hourlyRate ?? raw?.hourly_rate),
    rating: safeNumber(raw?.rating),
    approval,
    account,
    avatarUrl: userAvatar,
    degree: raw?.education?.[0]?.degree ?? raw?.degree,
    joinedDate: formatJoinedDate(raw?.createdAt ?? raw?.created_at),
    bio: raw?.bio,
    experience,
    commissionRate: raw?.commissionRate ?? "15%",
    moderatorNotes: raw?.moderatorNotes ?? undefined,
  };
}

/* ─── 1. GET /api/admin/tutors/stats ─── */

export async function getTutorStats(): Promise<TutorStats> {

  const res = await apiFetch(`${BASE_URL}/stats`, {
    method: "GET",
  });
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

  const res = await apiFetch(`${BASE_URL}/${tutorId}/approve`, {
    method: "POST",
  });
  await handleResponse<{ success: boolean }>(res);
}

/* ─── 4. POST /api/admin/tutors/:tutorId/reject ─── */

export async function rejectTutor(tutorId: string): Promise<void> {

  const res = await apiFetch(`${BASE_URL}/${tutorId}/reject`, {
    method: "POST",
  });
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
  const json = await handleResponse<{
    success: boolean;
    data: RawTutorFromBackend;
  }>(res);
  return mapToTutor(json.data);
}
