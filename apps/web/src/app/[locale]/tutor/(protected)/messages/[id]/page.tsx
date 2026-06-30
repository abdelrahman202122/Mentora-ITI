"use client";

import { useLocale } from "next-intl";
import { useParams, useSearchParams } from "next/navigation";

import { ChatConversation } from "@/components/chat/ChatConversation";
import type { ChatStatus } from "@/types/chat/chat-types";
import { getLocalePath } from "@/utils/i18n/locale-path";

export default function TutorChatPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const status: ChatStatus =
    searchParams.get("status") === "archived" ? "archived" : "active";
  const messagesHref = getLocalePath(locale, "/tutor/messages");

  return (
    <ChatConversation
      archiveRedirectHref={messagesHref}
      backHref={messagesHref}
      chatId={params.id}
      restoreRedirectHref={messagesHref}
      status={status}
      subtitle="Learner conversation history"
      title="Learner messages"
    />
  );
}
