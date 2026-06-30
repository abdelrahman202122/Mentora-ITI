"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { getChatSocket } from "@/services/chat/chat-socket";
import type {
  NotificationItem,
  NotificationListData,
  NotificationReadAllUpdatePayload,
  NotificationReadUpdatePayload,
} from "@/types/notifications/notification-types";

import { notificationKeys } from "./use-notifications";

function updateUnreadCount(
  currentCount: number | undefined,
  updater: (count: number) => number
) {
  return Math.max(0, updater(currentCount ?? 0));
}

function prependNotification(
  currentData: NotificationListData | undefined,
  notification: NotificationItem
) {
  if (!currentData) {
    return currentData;
  }

  if (currentData.notifications.some((item) => item.id === notification.id)) {
    return currentData;
  }

  return {
    ...currentData,
    notifications: [notification, ...currentData.notifications].slice(
      0,
      currentData.pagination.limit
    ),
    pagination: {
      ...currentData.pagination,
      total: currentData.pagination.total + 1,
      totalPages: Math.max(
        currentData.pagination.totalPages,
        Math.ceil((currentData.pagination.total + 1) / currentData.pagination.limit)
      ),
    },
  };
}

function markCachedNotificationRead(
  currentData: NotificationListData | undefined,
  payload: NotificationReadUpdatePayload
) {
  if (!currentData) {
    return currentData;
  }

  return {
    ...currentData,
    notifications: currentData.notifications.map((notification) =>
      notification.id === payload.notificationId
        ? {
            ...notification,
            status: "read" as const,
            readAt: notification.readAt ?? payload.readAt,
          }
        : notification
    ),
  };
}

function markAllCachedNotificationsRead(
  currentData: NotificationListData | undefined,
  payload: NotificationReadAllUpdatePayload
) {
  if (!currentData) {
    return currentData;
  }

  return {
    ...currentData,
    notifications: currentData.notifications.map((notification) => ({
      ...notification,
      status: "read" as const,
      readAt: notification.readAt ?? payload.readAt,
    })),
  };
}

export function useNotificationSocket() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = getChatSocket();

    function handleNewNotification(notification: NotificationItem) {
      queryClient.setQueriesData<NotificationListData>(
        { queryKey: notificationKeys.lists() },
        (currentData) => prependNotification(currentData, notification)
      );

      if (notification.status === "unread") {
        queryClient.setQueryData<number>(
          notificationKeys.unreadCount(),
          (currentCount) => updateUnreadCount(currentCount, (count) => count + 1)
        );
      }
    }

    function handleReadUpdate(payload: NotificationReadUpdatePayload) {
      let wasUnread = false;

      queryClient.setQueriesData<NotificationListData>(
        { queryKey: notificationKeys.lists() },
        (currentData) => {
          if (
            currentData?.notifications.some(
              (notification) =>
                notification.id === payload.notificationId &&
                notification.status === "unread"
            )
          ) {
            wasUnread = true;
          }

          return markCachedNotificationRead(currentData, payload);
        }
      );

      if (wasUnread) {
        queryClient.setQueryData<number>(
          notificationKeys.unreadCount(),
          (currentCount) => updateUnreadCount(currentCount, (count) => count - 1)
        );
      } else {
        void queryClient.invalidateQueries({
          queryKey: notificationKeys.unreadCount(),
        });
      }
    }

    function handleReadAllUpdate(payload: NotificationReadAllUpdatePayload) {
      queryClient.setQueriesData<NotificationListData>(
        { queryKey: notificationKeys.lists() },
        (currentData) => markAllCachedNotificationsRead(currentData, payload)
      );
      queryClient.setQueryData(notificationKeys.unreadCount(), 0);
    }

    socket.on("notification:new", handleNewNotification);
    socket.on("notification:read:update", handleReadUpdate);
    socket.on("notification:read-all:update", handleReadAllUpdate);

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.off("notification:new", handleNewNotification);
      socket.off("notification:read:update", handleReadUpdate);
      socket.off("notification:read-all:update", handleReadAllUpdate);
    };
  }, [queryClient]);
}
