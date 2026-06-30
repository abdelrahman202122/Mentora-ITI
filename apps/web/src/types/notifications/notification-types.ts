export type NotificationType =
  | "message"
  | "booking"
  | "payment"
  | "review"
  | "system";

export type NotificationStatus = "unread" | "read";

export type NotificationDestinationRole = "learner" | "tutor" | "admin";

export interface NotificationPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface NotificationActor {
  id: string;
  name: string;
  avatar?: string;
}

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown>;
  status: NotificationStatus;
  deliveredAt: string | null;
  readAt: string | null;
  createdAt: string;
  actor: NotificationActor | null;
}

export interface NotificationListData {
  notifications: NotificationItem[];
  pagination: NotificationPagination;
}

export interface ListNotificationsParams {
  page?: number;
  limit?: number;
  status?: NotificationStatus;
  type?: NotificationType;
}

export interface UnreadNotificationCount {
  count: number;
}

export interface MarkAllNotificationsReadResult {
  updatedCount: number;
  readAt: string;
}

export interface NotificationReadUpdatePayload {
  notificationId: string;
  readAt: string;
}

export interface NotificationReadAllUpdatePayload {
  readAt: string;
}
