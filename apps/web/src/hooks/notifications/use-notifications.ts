"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ApiClientError } from "@/lib/axios";
import {
  getUnreadNotificationCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/services/notifications/notification-service";
import type {
  ListNotificationsParams,
  MarkAllNotificationsReadResult,
  NotificationItem,
  NotificationListData,
} from "@/types/notifications/notification-types";

const DEFAULT_NOTIFICATION_LIMIT = 20;

export const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
  list: (params: ListNotificationsParams) =>
    [...notificationKeys.lists(), params] as const,
  unreadCount: () => [...notificationKeys.all, "unread-count"] as const,
};

export function useNotifications(params: ListNotificationsParams = {}) {
  const queryParams = {
    page: 1,
    limit: DEFAULT_NOTIFICATION_LIMIT,
    ...params,
  };

  return useQuery<NotificationListData, ApiClientError>({
    queryKey: notificationKeys.list(queryParams),
    queryFn: () => listNotifications(queryParams),
  });
}

export function useUnreadNotificationCount() {
  return useQuery<number, ApiClientError>({
    queryKey: notificationKeys.unreadCount(),
    queryFn: getUnreadNotificationCount,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation<NotificationItem, ApiClientError, string>({
    mutationFn: markNotificationRead,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: notificationKeys.lists() }),
        queryClient.invalidateQueries({
          queryKey: notificationKeys.unreadCount(),
        }),
      ]);
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation<MarkAllNotificationsReadResult, ApiClientError>({
    mutationFn: markAllNotificationsRead,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: notificationKeys.lists() }),
        queryClient.invalidateQueries({
          queryKey: notificationKeys.unreadCount(),
        }),
      ]);
    },
  });
}
