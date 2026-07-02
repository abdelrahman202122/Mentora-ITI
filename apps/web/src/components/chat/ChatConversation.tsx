'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import {
  Archive,
  ArrowLeft,
  Check,
  CheckCheck,
  Loader2,
  RotateCcw,
  Send,
  SmilePlus,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCurrentUser } from '@/hooks/auth/use-auth';
import {
  useArchiveChat,
  useChat,
  useChatMessages,
  useRestoreChat,
} from '@/hooks/chat/use-chat';
import { useChatSocket } from '@/hooks/chat/use-chat-socket';
import type { ChatMessage, ChatStatus } from '@/types/chat/chat-types';
import { cn } from '@/lib/utils';

type ChatConversationProps = {
  chatId: string;
  backHref: string;
  archiveRedirectHref?: string;
  restoreRedirectHref?: string;
  status?: ChatStatus;
  title?: string;
  subtitle?: string;
};

const QUICK_REACTION_EMOJIS = [
  '😀',
  '😂',
  '😊',
  '😍',
  '👍',
  '👏',
  '🙏',
  '💪',
  '🎉',
  '🔥',
  '✅',
  '💡',
  '📚',
  '✍️',
  '⭐',
  '❤️',
];

function formatMessageTime(value: string, locale: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function sortMessagesByCreatedAt(messages: ChatMessage[]) {
  return [...messages].sort(
    (first, second) =>
      new Date(first.createdAt).getTime() -
      new Date(second.createdAt).getTime(),
  );
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function getMessageStatusLabel(
  status: ChatMessage['status'],
  t: ReturnType<typeof useTranslations<'Chat'>>,
) {
  if (status === 'read') {
    return t('status.read');
  }

  if (status === 'delivered') {
    return t('status.delivered');
  }

  return t('status.sent');
}

function MessageStatusIcon({
  status,
  t,
}: {
  status: ChatMessage['status'];
  t: ReturnType<typeof useTranslations<'Chat'>>;
}) {
  const label = getMessageStatusLabel(status, t);

  if (status === 'sent') {
    return (
      <Check
        aria-label={label}
        className="size-3.5"
        role="img"
      />
    );
  }

  return (
    <CheckCheck
      aria-label={label}
      className={cn(
        'size-3.5',
        status === 'read' ? 'text-sky-200' : 'text-indigo-100',
      )}
      role="img"
    />
  );
}

export function ChatConversation({
  chatId,
  backHref,
  archiveRedirectHref = backHref,
  restoreRedirectHref = backHref,
  status = 'active',
  title,
  subtitle,
}: ChatConversationProps) {
  const locale = useLocale();
  const t = useTranslations('Chat');
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const [messageInput, setMessageInput] = useState('');
  const [sendError, setSendError] = useState<string | null>(null);
  const [archiveError, setArchiveError] = useState<string | null>(null);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isPending,
    refetch,
  } = useChatMessages(chatId);
  const archiveChatMutation = useArchiveChat();
  const restoreChatMutation = useRestoreChat();
  const { data: chat } = useChat(chatId);
  const { data: currentUser } = useCurrentUser();
  const {
    connectionStatus,
    error: socketError,
    isConnected,
    markMessageRead,
    sendMessage,
  } = useChatSocket(chatId);

  const messages = useMemo(
    () =>
      sortMessagesByCreatedAt(
        data?.pages.flatMap((page) => page.messages) ?? [],
      ),
    [data],
  );
  const isArchived = status === 'archived';
  const participantName = chat?.participant.name;
  const participantInitials = participantName
    ? getInitials(participantName)
    : 'M';
  const headerTitle = participantName ?? title ?? t('conversation.title');
  const headerSubtitle = chat?.participant.role
    ? chat.participant.role === 'tutor'
      ? t('roles.tutor')
      : t('roles.learner')
    : subtitle ?? t('conversation.subtitle');
  const messagePlaceholder = isArchived
    ? t('composer.archivedPlaceholder')
    : connectionStatus === 'connecting'
      ? t('composer.connectingPlaceholder')
      : t('composer.placeholder');

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  useEffect(() => {
    if (!currentUser?.id || !isConnected) {
      return;
    }

    const unreadIncomingMessages = messages.filter(
      (message) =>
        message.recipientId === currentUser.id &&
        message.senderId !== currentUser.id &&
        message.status !== 'read',
    );

    unreadIncomingMessages.forEach((message) => {
      void markMessageRead(message.id).catch((error: unknown) => {
        console.error('Failed to mark message as read', error);
      });
    });
  }, [currentUser?.id, isConnected, markMessageRead, messages]);

  async function handleSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!messageInput.trim() || isSending) {
      return;
    }

    setIsSending(true);
    setSendError(null);

    try {
      await sendMessage(messageInput);
      setMessageInput('');
      setIsEmojiPickerOpen(false);
    } catch (sendMessageError) {
      setSendError(
        sendMessageError instanceof Error
          ? sendMessageError.message
          : t('errors.send'),
      );
    } finally {
      setIsSending(false);
    }
  }

  function handleEmojiSelect(emoji: string) {
    const input = messageInputRef.current;
    const selectionStart = input?.selectionStart ?? messageInput.length;
    const selectionEnd = input?.selectionEnd ?? messageInput.length;
    const nextMessage =
      messageInput.slice(0, selectionStart) +
      emoji +
      messageInput.slice(selectionEnd);
    const nextCursorPosition = selectionStart + emoji.length;

    setMessageInput(nextMessage);

    requestAnimationFrame(() => {
      messageInputRef.current?.focus();
      messageInputRef.current?.setSelectionRange(
        nextCursorPosition,
        nextCursorPosition,
      );
    });
  }

  async function handleArchiveChat() {
    setArchiveError(null);

    try {
      await archiveChatMutation.mutateAsync(chatId);
      router.replace(archiveRedirectHref);
    } catch (error) {
      setArchiveError(
        error instanceof Error ? error.message : t('errors.archive'),
      );
    }
  }

  async function handleRestoreChat() {
    setArchiveError(null);

    try {
      await restoreChatMutation.mutateAsync(chatId);
      router.replace(restoreRedirectHref);
    } catch (error) {
      setArchiveError(
        error instanceof Error ? error.message : t('errors.restore'),
      );
    }
  }

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col">
      <div className="mb-4 flex items-center gap-3">
        <Button asChild size="icon" variant="ghost">
          <Link href={backHref} aria-label={t('actions.back')}>
            <ArrowLeft className={cn('size-5', locale === 'ar' && 'rotate-180')} />
          </Link>
        </Button>

        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-700">
          {participantInitials}
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-semibold text-gray-900">
            {headerTitle}
          </h1>
          <p className="text-xs text-gray-500">{headerSubtitle}</p>
        </div>

        {isArchived ? (
          <Button
            aria-label={t('actions.restore')}
            disabled={restoreChatMutation.isPending}
            onClick={() => void handleRestoreChat()}
            size="sm"
            type="button"
            variant="outline"
          >
            {restoreChatMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {t('actions.restoring')}
              </>
            ) : (
              <>
                <RotateCcw className="size-4" />
                {t('actions.restore')}
              </>
            )}
          </Button>
        ) : (
          <Button
            aria-label={t('actions.archive')}
            disabled={archiveChatMutation.isPending}
            onClick={() => void handleArchiveChat()}
            size="sm"
            type="button"
            variant="outline"
          >
            {archiveChatMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {t('actions.archiving')}
              </>
            ) : (
              <>
                <Archive className="size-4" />
                {t('actions.archive')}
              </>
            )}
          </Button>
        )}
      </div>

      <div className="mb-4 flex flex-1 flex-col gap-3 overflow-y-auto rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-100">
        {hasNextPage ? (
          <Button
            className="mx-auto"
            disabled={isFetchingNextPage}
            onClick={() => void fetchNextPage()}
            size="sm"
            type="button"
            variant="outline"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {t('actions.loading')}
              </>
            ) : (
              t('actions.loadOlder')
            )}
          </Button>
        ) : null}

        {isPending ? (
          <div className="flex flex-1 items-center justify-center gap-2 text-sm text-gray-500">
            <Loader2 className="size-4 animate-spin" />
            {t('states.loadingMessages')}
          </div>
        ) : null}

        {isError ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <div>
              <p className="text-sm font-medium text-gray-900">
                {t('states.loadMessagesError')}
              </p>
              <p className="mt-1 text-xs text-gray-500">{error.message}</p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => void refetch()}
            >
              {t('actions.tryAgain')}
            </Button>
          </div>
        ) : null}

        {!isPending && !isError && messages.length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-center text-sm text-gray-500">
            {t('states.emptyMessages')}
          </div>
        ) : null}

        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwnMessage={message.senderId === currentUser?.id}
            locale={locale}
            t={t}
          />
        ))}

        <div ref={bottomRef} />
      </div>

      <div className="space-y-2">
        {socketError || sendError || archiveError ? (
          <p className="text-xs font-medium text-red-600">
            {archiveError ?? sendError ?? socketError}
          </p>
        ) : null}

        {isEmojiPickerOpen && !isArchived ? (
          <div className="grid grid-cols-8 gap-1 rounded-lg bg-white p-2 shadow-sm ring-1 ring-gray-100">
            {QUICK_REACTION_EMOJIS.map((emoji) => (
              <Button
                aria-label={t('actions.addEmoji', { emoji })}
                className="h-9 text-lg"
                disabled={!isConnected || isSending}
                key={emoji}
                onClick={() => handleEmojiSelect(emoji)}
                size="icon"
                type="button"
                variant="ghost"
              >
                <span aria-hidden="true">{emoji}</span>
              </Button>
            ))}
          </div>
        ) : null}

        <form
          className="flex items-center gap-2 rounded-lg bg-white px-4 py-3 shadow-sm ring-1 ring-gray-100"
          onSubmit={handleSendMessage}
        >
          <Button
            aria-label={isEmojiPickerOpen ? t('actions.closeEmoji') : t('actions.openEmoji')}
            disabled={isArchived || !isConnected || isSending}
            onClick={() => setIsEmojiPickerOpen((isOpen) => !isOpen)}
            size="icon"
            type="button"
            variant="ghost"
          >
            <SmilePlus className="size-4" />
          </Button>
          <Input
            aria-label={t('composer.label')}
            className="h-10 flex-1"
            disabled={isArchived || !isConnected || isSending}
            onChange={(event) => setMessageInput(event.target.value)}
            placeholder={messagePlaceholder}
            ref={messageInputRef}
            type="text"
            value={messageInput}
          />
          <Button
            disabled={
              isArchived || !isConnected || isSending || !messageInput.trim()
            }
            size="icon"
            type="submit"
          >
            {isSending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

function MessageBubble({
  isOwnMessage,
  locale,
  message,
  t,
}: {
  isOwnMessage: boolean;
  locale: string;
  message: ChatMessage;
  t: ReturnType<typeof useTranslations<'Chat'>>;
}) {
  const messageTime = formatMessageTime(message.createdAt, locale);

  return (
    <div className={cn('flex', isOwnMessage ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[78%] rounded-2xl px-4 py-2 text-sm',
          isOwnMessage
            ? 'rounded-br-md bg-indigo-600 text-white'
            : 'rounded-bl-md bg-gray-100 text-gray-900',
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <div
          className={cn(
            'mt-1 flex items-center gap-2 text-xs',
            isOwnMessage ? 'justify-end text-indigo-100' : 'text-gray-400',
          )}
        >
          {messageTime ? (
            <time dateTime={message.createdAt}>{messageTime}</time>
          ) : null}
          {isOwnMessage ? <MessageStatusIcon status={message.status} t={t} /> : null}
        </div>
      </div>
    </div>
  );
}
