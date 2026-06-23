'use client';

import Link from 'next/link';
import { MessageSquare } from 'lucide-react';

import type { Chat } from '@/types/chat/chat-types';
import { cn } from '@/lib/utils';

type ChatListItemProps = {
  chat: Chat;
  href: string;
};

const timeFormatter = new Intl.DateTimeFormat('en', {
  hour: '2-digit',
  minute: '2-digit',
});

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function formatLastMessageTime(value?: string) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return timeFormatter.format(date);
}

export function ChatListItem({ chat, href }: ChatListItemProps) {
  const participantInitials = getInitials(chat.participant.name);
  const lastMessagePreview = chat.lastMessage?.preview ?? 'No messages yet.';
  const lastMessageTime = formatLastMessageTime(chat.lastMessage?.sentAt);

  return (
    <Link
      href={href}
      className={cn(
        'flex min-h-20 items-center gap-3 border-b border-gray-100 px-4 py-3 transition-colors last:border-b-0',
        'hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
      )}
    >
      <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-700">
        {participantInitials || <MessageSquare className="size-5" />}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-sm font-semibold text-gray-900">
            {chat.participant.name}
          </p>
          {lastMessageTime ? (
            <time
              dateTime={chat.lastMessage?.sentAt}
              className="shrink-0 text-xs text-gray-400"
            >
              {lastMessageTime}
            </time>
          ) : null}
        </div>

        <p className="mt-1 truncate text-xs text-gray-500">
          {lastMessagePreview}
        </p>
      </div>
    </Link>
  );
}
