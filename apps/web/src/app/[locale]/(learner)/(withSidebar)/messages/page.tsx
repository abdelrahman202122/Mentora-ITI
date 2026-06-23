"use client"

import { useState } from "react"
import { useLocale } from "next-intl"

import { ChatList } from "@/components/chat/ChatList"
import { Button } from "@/components/ui/button"
import type { ChatStatus } from "@/types/chat/chat-types"
import { getLocalePath } from "@/utils/i18n/locale-path"

export default function MessagesPage() {
  const locale = useLocale()
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
          Active
        </Button>
        <Button
          onClick={() => setStatus("archived")}
          type="button"
          variant={isArchived ? "default" : "outline"}
        >
          Archived
        </Button>
      </div>

      <ChatList
        description={
          isArchived
            ? "Restore conversations you want to continue."
            : "Continue your tutor conversations."
        }
        getChatHref={(chat) => getLocalePath(locale, `/messages/${chat.id}`)}
        status={status}
        title={isArchived ? "Archived messages" : "Messages"}
      />
    </div>
  )
}
