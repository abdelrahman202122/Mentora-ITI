'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { Archive, ArrowLeft, Loader2, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCurrentUser } from '@/hooks/auth/use-auth';
import { useArchiveChat, useChatMessages } from '@/hooks/chat/use-chat';
import { useChatSocket } from '@/hooks/chat/use-chat-socket';
import type { ChatMessage } from '@/types/chat/chat-types';
import { cn } from '@/lib/utils';

type ChatConversationProps = {
  chatId: string;
  backHref: string;
  archiveRedirectHref?: string;
  title?: string;
  subtitle?: string;
};

const messageTimeFormatter = new Intl.DateTimeFormat('en', {
  hour: '2-digit',
  minute: '2-digit',
});

function formatMessageTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return messageTimeFormatter.format(date);
}

function sortMessagesByCreatedAt(messages: ChatMessage[]) {
  return [...messages].sort(
    (first, second) =>
      new Date(first.createdAt).getTime() -
      new Date(second.createdAt).getTime(),
  );
}

export function ChatConversation({
  chatId,
  backHref,
  archiveRedirectHref = backHref,
  title = 'Messages',
  subtitle = 'Conversation history',
}: ChatConversationProps) {
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [messageInput, setMessageInput] = useState('');
  const [sendError, setSendError] = useState<string | null>(null);
  const [archiveError, setArchiveError] = useState<string | null>(null);
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
    } catch (sendMessageError) {
      setSendError(
        sendMessageError instanceof Error
          ? sendMessageError.message
          : 'Could not send message',
      );
    } finally {
      setIsSending(false);
    }
  }

  async function handleArchiveChat() {
    setArchiveError(null);

    try {
      await archiveChatMutation.mutateAsync(chatId);
      router.replace(archiveRedirectHref);
    } catch (error) {
      setArchiveError(
        error instanceof Error ? error.message : 'Could not archive chat',
      );
    }
  }

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col">
      <div className="mb-4 flex items-center gap-3">
        <Button asChild size="icon" variant="ghost">
          <Link href={backHref} aria-label="Back to messages">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>

        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-700">
          M
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="text-sm font-semibold text-gray-900">{title}</h1>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>

        <Button
          aria-label="Archive chat"
          disabled={archiveChatMutation.isPending}
          onClick={() => void handleArchiveChat()}
          size="icon"
          type="button"
          variant="outline"
        >
          {archiveChatMutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Archive className="size-4" />
          )}
        </Button>
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
                Loading
              </>
            ) : (
              'Load older messages'
            )}
          </Button>
        ) : null}

        {isPending ? (
          <div className="flex flex-1 items-center justify-center gap-2 text-sm text-gray-500">
            <Loader2 className="size-4 animate-spin" />
            Loading messages
          </div>
        ) : null}

        {isError ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Could not load messages
              </p>
              <p className="mt-1 text-xs text-gray-500">{error.message}</p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => void refetch()}
            >
              Try again
            </Button>
          </div>
        ) : null}

        {!isPending && !isError && messages.length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-center text-sm text-gray-500">
            No messages yet.
          </div>
        ) : null}

        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwnMessage={message.senderId === currentUser?.id}
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

        <form
          className="flex items-center gap-2 rounded-lg bg-white px-4 py-3 shadow-sm ring-1 ring-gray-100"
          onSubmit={handleSendMessage}
        >
          <Input
            aria-label="Message"
            className="h-10 flex-1"
            disabled={!isConnected || isSending}
            onChange={(event) => setMessageInput(event.target.value)}
            placeholder={
              connectionStatus === 'connecting'
                ? 'Connecting...'
                : 'Type a message...'
            }
            type="text"
            value={messageInput}
          />
          <Button
            disabled={!isConnected || isSending || !messageInput.trim()}
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
  message,
}: {
  isOwnMessage: boolean;
  message: ChatMessage;
}) {
  const messageTime = formatMessageTime(message.createdAt);

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
          {isOwnMessage ? <span>{message.status}</span> : null}
        </div>
      </div>
    </div>
  );
}
