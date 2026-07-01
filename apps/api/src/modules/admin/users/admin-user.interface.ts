/* The 3 possible statuses shown in the admin UI */
export type AdminUserStatus = 'Active' | 'Pending' | 'Suspended';

/* The shape of one row in the admin users table */
export interface AdminUserListItem {
  id: string;
  name: string;
  email: string;
  role: string;           // "Tutor" | "Student" | "Admin" (frontend labels)
  status: AdminUserStatus;
  regDate: string;
  totalSessions: number;
  avgRating: number | null;
  lastActivity: string | null;
  avatarUrl: string | null;
  roleLabel: string | null;
}

/* The shape returned by GET /:id — includes reviews for the drawer */
export interface AdminUserReview {
  reviewer: string;
  rating: number;
  text: string;
  relativeTime: string;
}

export interface AdminUserDetail extends AdminUserListItem {
  reviews: AdminUserReview[];
}

/* Pagination metadata returned alongside the list */
export interface AdminUserListMeta {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
}





import type { Types } from 'mongoose';

/* ─── Types ─── */

/** Shape of a Review document AFTER populate('learnerId', 'name') */
export interface PopulatedReview {
  _id: Types.ObjectId;
  learnerId: { _id: Types.ObjectId; name: string } | null;
  tutorId: Types.ObjectId;
  rating: number;
  comment?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Shape returned to the service layer */
export interface UserReviewDto {
  reviewer: string;
  rating: number;
  text: string;
  relativeTime: string;
}


export interface AuditLogDto {
  id: string;
  action: string;
  performedBy: string;
  details: string | null;
  timestamp: string;
}
