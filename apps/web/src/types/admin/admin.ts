
export type Role = "Tutor" | "Student" | "Admin";
export type Status = "Active" | "Pending" | "Suspended";

export interface UserReview {
  reviewer: string;
  rating: number;
  text: string;
  relativeTime: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  regDate: string;
  totalSessions: number;
  avgRating: number | null;
  lastActivity: string | null;
  avatarUrl: string | null;
  roleLabel: string | null;
  // ✅ Only present in detail response (GET /:id)
  reviews?: UserReview[];
}


export type ApprovalStatus = "Approved" | "Pending" | "Rejected";
export type AccountStatus = "Active" | "Inactive" | "Suspended";

export interface TutorExperience {
  title: string;
  org: string;
  period: string;
  description: string;
}

export interface Tutor {
  id: string;
  name: string;
  email: string;
  subjects: string[];
  hourlyRate: number;
  rating: number;
  approval: ApprovalStatus;
  account: AccountStatus;
  avatarUrl?: string;
  degree?: string;
  location?: string;
  joinedDate?: string;
  bio?: string;
  experience?: TutorExperience[];
  commissionRate?: string;
  moderatorNotes?: string;
}

export interface Review {
  id: string;
  tutor: string;
  tutorAvatarColor: string;
  learner: string;
  rating: number;
  snippet: string;
  fullReview: string;
  date: string;
  dateFull: string;
  topicArea: string;
  sessionDuration: string;
}

export type TxStatus = "COMPLETED" | "PROCESSING" | "PENDING" | "FAILED";
export type WithdrawalStatus = "PENDING" | "APPROVED" | "REJECTED" | "PROCESSING";

export interface Transaction {
  id: string;
  txId: string;
  learner: string;
  tutor: string;
  amount: number;
  commission: number;
  status: TxStatus;
  date: string;
}

export interface Withdrawal {
  id: string;
  tutor: string;
  avatarUrl: string;
  requestedAmount: number;
  walletBalance: number;
  requestDate: string;
  status: WithdrawalStatus;
}
export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "REJECTED"
  | "COMPLETED"
  | "CANCELLED"
  | "EXPIRED";
export type PaymentStatus = "PAID" | "PENDING" | "REFUNDED" | "FAILED";

export interface Booking {
  id: string;
  bookingId: string;
  learner: string;
  tutor: string;
  subject: string;
  hasBadge?: boolean;
  date: string;
  status: BookingStatus;
  payment: PaymentStatus;
  paymentMethod?: string;
}
