"use client";

import { Loader2, MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useChats, useRestoreChat } from "@/hooks/chat/use-chat";
import type { Chat, ChatStatus } from "@/types/chat/chat-types";

import { ChatListItem } from "./ChatListItem";

type ChatListProps = {
  title?: string;
  description?: string;
  status?: ChatStatus;
  getChatHref: (chat: Chat) => string;
};

function ChatListSkeleton() {
  return (
    <div className="divide-y divide-gray-100">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex min-h-20 items-center gap-3 px-4 py-3">
          <div className="size-11 rounded-full bg-gray-100" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3 w-32 rounded bg-gray-100" />
            <div className="h-3 w-full max-w-80 rounded bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChatList({
  title = "Messages",
  description = "Continue your tutor conversations.",
  status = "active",
  getChatHref,
}: ChatListProps) {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isPending,
    refetch,
  } = useChats(status);
  const restoreChatMutation = useRestoreChat();

  const chats = data?.pages.flatMap((page) => page.chats) ?? [];

  return (
    <Card className="mx-auto w-full max-w-2xl rounded-lg bg-white">
      <CardHeader className="border-b">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        {restoreChatMutation.error ? (
          <p className="border-b px-4 py-3 text-xs font-medium text-red-600">
            {restoreChatMutation.error.message}
          </p>
        ) : null}

        {isPending ? <ChatListSkeleton /> : null}

        {isError ? (
          <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
            <MessageSquare className="size-8 text-gray-300" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                Could not load chats
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {error.message}
              </p>
            </div>
            <Button type="button" variant="outline" onClick={() => void refetch()}>
              Try again
            </Button>
          </div>
        ) : null}

        {!isPending && !isError && chats.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <MessageSquare className="size-9 text-gray-300" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                No conversations yet
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Your chat history will appear here after a conversation starts.
              </p>
            </div>
          </div>
        ) : null}

        {chats.length > 0 ? (
          <div>
            {chats.map((chat) => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                href={getChatHref(chat)}
                action={
                  status === "archived" ? (
                    <Button
                      disabled={restoreChatMutation.isPending}
                      onClick={() => restoreChatMutation.mutate(chat.id)}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      {restoreChatMutation.isPending &&
                      restoreChatMutation.variables === chat.id ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Restoring
                        </>
                      ) : (
                        "Restore"
                      )}
                    </Button>
                  ) : undefined
                }
              />
            ))}
          </div>
        ) : null}

        {hasNextPage ? (
          <div className="border-t px-4 py-3">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={isFetchingNextPage}
              onClick={() => void fetchNextPage()}
            >
              {isFetchingNextPage ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Loading
                </>
              ) : (
                "Load more"
              )}
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
