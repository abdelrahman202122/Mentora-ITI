import api from "@/lib/axios";
import type { ApiSuccess } from "@/types/apis/api-success";
import type {
  ListNotificationsParams,
  MarkAllNotificationsReadResult,
  NotificationItem,
  NotificationListData,
  UnreadNotificationCount,
} from "@/types/notifications/notification-types";

export async function listNotifications(
  params: ListNotificationsParams = {}
): Promise<NotificationListData> {
  const response = await api.get<ApiSuccess<NotificationListData>>(
    "/notifications",
    { params }
  );

  return response.data.data;
}

export async function getUnreadNotificationCount(): Promise<number> {
  const response = await api.get<ApiSuccess<UnreadNotificationCount>>(
    "/notifications/unread-count"
  );

  return response.data.data.count;
}

export async function markNotificationRead(
  notificationId: string
): Promise<NotificationItem> {
  const response = await api.patch<ApiSuccess<NotificationItem>>(
    `/notifications/${notificationId}/read`
  );

  return response.data.data;
}

export async function markAllNotificationsRead(): Promise<MarkAllNotificationsReadResult> {
  const response = await api.patch<ApiSuccess<MarkAllNotificationsReadResult>>(
    "/notifications/read-all"
  );

  return response.data.data;
}
