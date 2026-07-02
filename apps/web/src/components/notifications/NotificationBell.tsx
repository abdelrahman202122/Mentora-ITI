"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, Circle, Loader2, MessageCircle, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationCount,
} from "@/hooks/notifications/use-notifications";
import { chatKeys } from "@/hooks/chat/use-chat";
import { useNotificationSocket } from "@/hooks/notifications/use-notification-socket";
import { cn } from "@/lib/utils";
import type {
  NotificationDestinationRole,
  NotificationItem,
  NotificationType,
} from "@/types/notifications/notification-types";
import { getLocalePath } from "@/utils/i18n/locale-path";
import { useQueryClient } from "@tanstack/react-query";

interface NotificationBellProps {
  collapsed?: boolean;
  role?: NotificationDestinationRole;
}

function getNotificationChatId(notification: NotificationItem) {
  const chatId = notification.data.chatId;
  return typeof chatId === "string" ? chatId : null;
}

function getNotificationHref(
  notification: NotificationItem,
  locale: string,
  role?: NotificationDestinationRole
) {
  const chatId = getNotificationChatId(notification);

  if (notification.type !== "message" || !chatId) {
    return null;
  }

  const chatPath =
    role === "tutor" ? `/tutor/messages/${chatId}` : `/messages/${chatId}`;

  return getLocalePath(locale, chatPath);
}

function getUnreadLabel(count: number) {
  return count > 99 ? "99+" : count.toString();
}

export function NotificationBell({
  collapsed = false,
  role,
}: NotificationBellProps) {
  const locale = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations("notifications");
  const [open, setOpen] = useState(false);

  useNotificationSocket();

  const notificationsQuery = useNotifications();
  const unreadQuery = useUnreadNotificationCount();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const notifications = notificationsQuery.data?.notifications ?? [];
  const unreadCount = unreadQuery.data ?? 0;
  const hasUnread = unreadCount > 0;

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        month: "short",
      }),
    [locale]
  );

  function handleNotificationClick(notification: NotificationItem) {
    const href = getNotificationHref(notification, locale, role);
    const chatId = getNotificationChatId(notification);

    if (notification.status === "unread") {
      void markRead.mutateAsync(notification.id).catch((error) => {
        console.error("Failed to mark notification as read:", error);
      });
    }

    if (href) {
      if (chatId) {
        void queryClient.invalidateQueries({
          queryKey: chatKeys.messageList(chatId),
        });
        void queryClient.invalidateQueries({
          queryKey: chatKeys.detail(chatId),
        });
        void queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
      }
      setOpen(false);
      router.push(href);
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllRead.mutateAsync();
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    }
  }

  return (
    <div className="relative">
      <Button
        aria-expanded={open}
        aria-label={open ? t("actions.close") : t("actions.open")}
        className={cn(
          "relative w-full gap-3 px-2 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600",
          collapsed ? "justify-center" : "justify-start"
        )}
        onClick={() => setOpen((current) => !current)}
        type="button"
        variant="ghost"
      >
        <Bell size={18} className="shrink-0" />
        {!collapsed && <span>{t("title")}</span>}
        {hasUnread && (
          <Badge className="absolute -right-1 -top-1 h-5 min-w-5 px-1">
            {getUnreadLabel(unreadCount)}
          </Badge>
        )}
      </Button>

      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)}>
          <Card
            className={cn(
              "fixed bottom-20 z-50 w-[min(calc(100vw-2rem),24rem)] overflow-hidden border bg-white shadow-lg",
              locale === "ar" ? "right-20" : "left-20"
            )}
            onClick={(event) => event.stopPropagation()}
          >
            <CardHeader className="border-b">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>{t("title")}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {hasUnread
                      ? t("unreadCount", { count: unreadCount })
                      : t("allCaughtUp")}
                  </p>
                </div>
                <Button
                  aria-label={t("actions.close")}
                  onClick={() => setOpen(false)}
                  size="icon-sm"
                  type="button"
                  variant="ghost"
                >
                  <X size={16} />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
                <span className="text-sm font-medium text-gray-700">
                  {t("latest")}
                </span>
                <Button
                  disabled={!hasUnread || markAllRead.isPending}
                  onClick={handleMarkAllRead}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  {markAllRead.isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <CheckCheck size={14} />
                  )}
                  {t("actions.markAllRead")}
                </Button>
              </div>

              {notificationsQuery.isPending ? (
                <div className="space-y-3 p-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="animate-pulse space-y-2">
                      <div className="h-4 w-2/3 rounded bg-gray-200" />
                      <div className="h-3 w-full rounded bg-gray-100" />
                    </div>
                  ))}
                </div>
              ) : notificationsQuery.isError ? (
                <div className="p-4 text-sm text-red-600">
                  {t("states.error")}
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <Bell className="mx-auto mb-3 h-8 w-8 text-gray-300" />
                  <p className="font-medium text-gray-800">
                    {t("states.emptyTitle")}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("states.emptyDescription")}
                  </p>
                </div>
              ) : (
                <div className="max-h-[24rem] overflow-y-auto">
                  {notifications.map((notification) => {
                    const href = getNotificationHref(notification, locale, role);
                    const isUnread = notification.status === "unread";

                    return (
                      <button
                        key={notification.id}
                        className={cn(
                          "flex w-full gap-3 border-b px-4 py-3 text-start transition-colors last:border-b-0 hover:bg-gray-50",
                          isUnread && "bg-indigo-50/60"
                        )}
                        onClick={() => void handleNotificationClick(notification)}
                        type="button"
                      >
                        <span
                          className={cn(
                            "mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500",
                            isUnread && "bg-indigo-100 text-indigo-700"
                          )}
                        >
                          {notification.type === "message" ? (
                            <MessageCircle size={16} />
                          ) : (
                            <Circle size={12} />
                          )}
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="flex items-start justify-between gap-2">
                            <span className="truncate text-sm font-medium text-gray-900">
                              {notification.title || t("fallback.title")}
                            </span>
                            {isUnread && (
                              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-600" />
                            )}
                          </span>
                          <span className="mt-1 line-clamp-2 text-sm text-gray-600">
                            {notification.body || t("fallback.body")}
                          </span>
                          <span className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span>
                              {t(`types.${notification.type}` as `types.${NotificationType}`)}
                            </span>
                            {notification.actor?.name && (
                              <span>{notification.actor.name}</span>
                            )}
                            <span>
                              {dateFormatter.format(
                                new Date(notification.createdAt)
                              )}
                            </span>
                            {href && (
                              <span className="font-medium text-indigo-600">
                                {t("actions.openChat")}
                              </span>
                            )}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
