"use client"

import { useLocale } from "next-intl"

import { ChatList } from "@/components/chat/ChatList"
import { getLocalePath } from "@/utils/i18n/locale-path"

export default function MessagesPage() {
  const locale = useLocale()

  return (
    <div className="mx-auto max-w-2xl">
      <ChatList
        getChatHref={(chat) => getLocalePath(locale, `/messages/${chat.id}`)}
      />
    </div>
  )
}
