"use client";

import { Bot, Loader2, MessageCircle, Search, Send, Sparkles } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import type { KeyboardEvent } from "react";
import { useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAIChat } from "@/hooks/ai/use-ai-chat";
import { cn } from "@/lib/utils";
import type { AIConversationMessage } from "@/types/ai/ai-types";
import { getLocalePath } from "@/utils/i18n/locale-path";

const exampleKeys = ["algebra", "tutorLevel", "igcse"] as const;

export function AIChatAssistant() {
  const locale = useLocale();
  const t = useTranslations("aiAssistant");
  const [draft, setDraft] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const { errorMessage, isSending, isStarting, messages, sendMessage } =
    useAIChat(locale);

  const isSubmitDisabled = isStarting || isSending || draft.trim().length === 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isSending]);

  async function handleSend() {
    const content = draft.trim();

    if (!content || isSubmitDisabled) {
      return;
    }

    setDraft("");

    try {
      await sendMessage(content);
    } catch {
      setDraft(content);
    }
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    event.preventDefault();
    void handleSend();
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-2rem)] w-full max-w-5xl flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
            <Bot className="size-4" />
            {t("badge")}
          </div>
          <h1 className="text-2xl font-semibold text-foreground">
            {t("title")}
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {t("description")}
          </p>
        </div>

        <Button asChild variant="outline">
          <Link href={getLocalePath(locale, "/find-tutor?mode=browse")}>
            <Search className="size-4" />
            {t("actions.findTutor")}
          </Link>
        </Button>
      </div>

      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg">
        <CardHeader className="border-b px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageCircle className="size-4 text-primary" />
              {t("chatTitle")}
            </CardTitle>
            <Badge variant="secondary">
              {isStarting ? t("status.starting") : t("status.ready")}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="flex min-h-0 flex-1 flex-col p-0">
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
            {messages.length === 0 ? (
              <EmptyState
                disabled={isStarting || isSending}
                onPickExample={setDraft}
                t={t}
              />
            ) : (
              <div className="flex flex-col gap-4">
                {messages.map((message) => (
                  <MessageBubble key={message._id} message={message} t={t} />
                ))}
                {isSending ? <TypingBubble t={t} /> : null}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {errorMessage ? (
            <div className="border-t border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {errorMessage}
            </div>
          ) : null}

          <div className="border-t bg-background p-3">
            <div className="flex items-end gap-2">
              <Textarea
                aria-label={t("composer.label")}
                className="min-h-12 resize-none"
                disabled={isStarting}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleComposerKeyDown}
                placeholder={
                  isStarting
                    ? t("composer.startingPlaceholder")
                    : t("composer.placeholder")
                }
                rows={2}
                value={draft}
              />
              <Button
                aria-label={t("actions.send")}
                disabled={isSubmitDisabled}
                onClick={() => void handleSend()}
                size="icon-lg"
                type="button"
              >
                {isSending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {t("composer.hint")}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyState({
  disabled,
  onPickExample,
  t,
}: {
  disabled: boolean;
  onPickExample: (value: string) => void;
  t: ReturnType<typeof useTranslations<"aiAssistant">>;
}) {
  return (
    <div className="mx-auto flex min-h-full max-w-xl flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Sparkles className="size-6" />
      </div>
      <h2 className="text-lg font-semibold text-foreground">
        {t("empty.title")}
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {t("empty.description")}
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {exampleKeys.map((key) => (
          <Button
            disabled={disabled}
            key={key}
            onClick={() => onPickExample(t(`examples.${key}`))}
            type="button"
            variant="outline"
          >
            {t(`examples.${key}`)}
          </Button>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  t,
}: {
  message: AIConversationMessage;
  t: ReturnType<typeof useTranslations<"aiAssistant">>;
}) {
  const isUser = message.role === "user";
  const provider = message.metadata?.provider;

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[82%] rounded-lg px-4 py-3 text-sm leading-6 sm:max-w-[70%]",
          isUser
            ? "bg-primary text-primary-foreground"
            : "border bg-muted text-foreground"
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        {!isUser && provider ? (
          <p className="mt-2 text-xs text-muted-foreground">
            {t("provider", { provider: String(provider) })}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function TypingBubble({
  t,
}: {
  t: ReturnType<typeof useTranslations<"aiAssistant">>;
}) {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-2 rounded-lg border bg-muted px-4 py-3 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        {t("status.thinking")}
      </div>
    </div>
  );
}
