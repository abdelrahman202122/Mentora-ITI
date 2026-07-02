"use client"

import { useState } from "react"
import { useLocale, useTranslations } from "next-intl"

import { ChatList } from "@/components/chat/ChatList"
import { Button } from "@/components/ui/button"
import type { ChatStatus } from "@/types/chat/chat-types"
import { getLocalePath } from "@/utils/i18n/locale-path"

export default function MessagesPage() {
  const locale = useLocale()
  const t = useTranslations("Chat.learner")
  const [status, setStatus] = useState<ChatStatus>("active")
  const isArchived = status === "archived"

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center gap-2">
        <Button
          onClick={() => setStatus("active")}
          type="button"
          variant={status === "active" ? "default" : "outline"}
        >
          {t("active")}
        </Button>
        <Button
          onClick={() => setStatus("archived")}
          type="button"
          variant={isArchived ? "default" : "outline"}
        >
          {t("archived")}
        </Button>
      </div>

      <ChatList
        description={
          isArchived
            ? t("archivedDescription")
            : t("description")
        }
        getChatHref={(chat) =>
          getLocalePath(
            locale,
            isArchived
              ? `/messages/${chat.id}?status=archived`
              : `/messages/${chat.id}`,
          )
        }
        status={status}
        title={isArchived ? t("archivedTitle") : t("title")}
      />
    </div>
  )
}
