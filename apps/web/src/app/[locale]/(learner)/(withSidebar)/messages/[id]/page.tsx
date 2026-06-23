'use client';

import { useParams } from 'next/navigation';
import { useLocale } from 'next-intl';

import { ChatConversation } from '@/components/chat/ChatConversation';
import { getLocalePath } from '@/utils/i18n/locale-path';

export default function ChatPage() {
  const params = useParams<{ id: string }>();
  const locale = useLocale();

  return (
    <ChatConversation
      chatId={params.id}
      backHref={getLocalePath(locale, '/messages')}
    />
  );
}
