'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';

import { ChatConversation } from '@/components/chat/ChatConversation';
import type { ChatStatus } from '@/types/chat/chat-types';
import { getLocalePath } from '@/utils/i18n/locale-path';

export default function ChatPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const status: ChatStatus =
    searchParams.get('status') === 'archived' ? 'archived' : 'active';

  return (
    <ChatConversation
      chatId={params.id}
      backHref={getLocalePath(locale, '/messages')}
      archiveRedirectHref={getLocalePath(locale, '/messages')}
      restoreRedirectHref={getLocalePath(locale, '/messages')}
      status={status}
    />
  );
}
