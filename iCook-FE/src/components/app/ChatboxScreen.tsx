"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  CloseIcon,
  EmojiIcon,
  ImageIcon,
  SendIcon,
} from "@/components/app/icons";
import UserAvatar from "@/components/app/UserAvatar";
import UserNameLink from "@/components/app/UserNameLink";
import { COMMENT_EMOJIS } from "@/components/app/CommentComposer";
import { useMessages } from "@/components/app/MessagesProvider";
import {
  formatChatTime,
  formatDayLabel,
  HISTORY_LOAD_MS,
  HISTORY_PAGE_SIZE,
  isRecentMessage,
  messageDayKey,
  pickAutoReply,
  PREVIEW_HANDLE,
  type ChatMessage,
} from "@/components/app/messagesData";
import { resolveAuthor } from "@/components/app/user/authors";
import { useCurrentFeedUser } from "@/components/app/user/useCurrentFeedUser";
import { loadImageAsDataUrl } from "@/lib/imageUpload";
import { userProfilePath } from "@/lib/userProfile";

function TypingDots({ name }: { name: string }) {
  return (
    <div
      className="feed-card"
      aria-live="polite"
      aria-label={`${name} is typing`}
    >
      <p className="flex items-center gap-1.5 text-sm italic text-muted">
        {name} is typing
        <span className="typing-dots" aria-hidden>
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </span>
      </p>
    </div>
  );
}

export default function ChatboxScreen() {
  const params = useParams<{ id: string }>();
  const raw = decodeURIComponent(params.id ?? PREVIEW_HANDLE).toLowerCase();
  const handle = raw === "1" ? PREVIEW_HANDLE : raw;
  const them = resolveAuthor(handle);
  const me = useCurrentFeedUser();
  const {
    threadFor,
    sendFromYou,
    markRead,
    previewUi,
    interruptPreview,
    scheduleThemReply,
  } = useMessages();
  const thread = threadFor(handle);
  const fileInputId = useId();
  const [draft, setDraft] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const autoTyping =
    previewUi?.handle === handle && previewUi.autoTyping;
  const themTyping = previewUi?.handle === handle && previewUi.themTyping;
  const composerDraft = autoTyping && previewUi ? previewUi.youDraft : draft;
  const [revealedOlder, setRevealedOlder] = useState(0);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const historyTimer = useRef<number>(0);

  const olderMessages = useMemo(
    () => thread.messages.filter((m) => !isRecentMessage(m.createdAt)),
    [thread.messages],
  );
  const recentMessages = useMemo(
    () => thread.messages.filter((m) => isRecentMessage(m.createdAt)),
    [thread.messages],
  );
  const visibleMessages = useMemo(() => {
    const start = Math.max(0, olderMessages.length - revealedOlder);
    return [...olderMessages.slice(start), ...recentMessages];
  }, [olderMessages, recentMessages, revealedOlder]);
  const hasOlder = revealedOlder < olderMessages.length;

  useEffect(() => {
    markRead(handle);
    setDraft("");
    setImageUrl(null);
    setImageError("");
    setEmojiOpen(false);
    setRevealedOlder(0);
    setLoadingHistory(false);
    window.clearTimeout(historyTimer.current);
    if (fileRef.current) fileRef.current.value = "";
  }, [handle, markRead]);

  useLayoutEffect(() => {
    if (!autoTyping) return;
    const el = inputRef.current;
    if (!el) return;
    el.focus();
    const end = el.value.length;
    el.setSelectionRange(end, end);
    el.scrollLeft = Math.max(0, el.scrollWidth - el.clientWidth);
  }, [composerDraft, autoTyping]);

  function cancelPreview() {
    interruptPreview(handle);
  }

  function insertEmoji(emoji: string) {
    cancelPreview();
    const el = inputRef.current;
    if (!el) {
      setDraft((prev) => prev + emoji);
      return;
    }
    const start = el.selectionStart ?? draft.length;
    const end = el.selectionEnd ?? draft.length;
    const next = draft.slice(0, start) + emoji + draft.slice(end);
    setDraft(next);
    requestAnimationFrame(() => {
      el.focus();
      const caret = start + emoji.length;
      el.setSelectionRange(caret, caret);
    });
  }

  async function handleFile(file: File | undefined) {
    if (!file || autoTyping) return;
    cancelPreview();
    setUploading(true);
    setImageError("");
    const result = await loadImageAsDataUrl(file);
    setUploading(false);
    if (!result.ok) {
      setImageError(result.error);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    setImageUrl(result.dataUrl);
  }

  function clearImage() {
    setImageUrl(null);
    setImageError("");
    if (fileRef.current) fileRef.current.value = "";
  }

  function scheduleReply(userText: string, history: ChatMessage[], hasImage?: boolean) {
    const reply = pickAutoReply(handle, userText, history, { hasImage });
    scheduleThemReply(handle, reply);
  }

  const canSend = Boolean(draft.trim() || imageUrl) && !uploading && !autoTyping;

  function send(e?: FormEvent) {
    e?.preventDefault();
    if (!canSend) return;
    const text = draft.trim();
    const photo = imageUrl ?? undefined;
    cancelPreview();
    setDraft("");
    setImageUrl(null);
    setImageError("");
    setEmojiOpen(false);
    if (fileRef.current) fileRef.current.value = "";
    const sent = sendFromYou(handle, text, { imageUrl: photo });
    if (!sent) return;
    scheduleReply(text, [...thread.messages, sent], Boolean(photo));
  }

  function loadOlderHistory() {
    if (!hasOlder || loadingHistory) return;
    setLoadingHistory(true);
    window.clearTimeout(historyTimer.current);
    historyTimer.current = window.setTimeout(() => {
      setRevealedOlder((n) =>
        Math.min(olderMessages.length, n + HISTORY_PAGE_SIZE),
      );
      setLoadingHistory(false);
    }, HISTORY_LOAD_MS);
  }

  useEffect(() => {
    const root = listRef.current;
    const target = topSentinelRef.current;
    if (!root || !target || !hasOlder || loadingHistory) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        if (root.scrollHeight <= root.clientHeight + 4) return;
        loadOlderHistory();
      },
      { root, threshold: 0 },
    );
    io.observe(target);
    return () => io.disconnect();
  }, [handle, hasOlder, loadingHistory, visibleMessages.length]);

  useEffect(() => {
    return () => {
      window.clearTimeout(historyTimer.current);
    };
  }, []);

  return (
    <div className="page-fill">
      <div className="subhead gap-3">
        <Link
          href={userProfilePath(them.handle, me.handle)}
          aria-label={them.name}
          className="relative shrink-0"
        >
          <UserAvatar
            initials={them.initials}
            handle={them.handle}
            src={them.avatarUrl}
          />
          {thread.online ? (
            <span className="absolute right-0 bottom-0 size-2.5 rounded-full border-2 border-surface bg-success" />
          ) : null}
        </Link>
        <div className="min-w-0 flex-1 leading-tight">
          <UserNameLink
            name={them.name}
            handle={them.handle}
            className="truncate text-sm font-bold text-brand"
          />
          <p className="flex items-center gap-0.5 text-xs leading-[14px]">
            <span className="text-brand-soft">@</span>
            <Link
              href={userProfilePath(them.handle, me.handle)}
              className="truncate text-placeholder"
            >
              {them.handle}
            </Link>
            {themTyping ? (
              <>
                <span className="text-muted"> · </span>
                <span className="inline-flex items-center gap-1 italic text-online">
                  typing
                  <span className="typing-dots" aria-hidden>
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </span>
                </span>
              </>
            ) : null}
          </p>
        </div>
        <Link
          href={userProfilePath(them.handle, me.handle)}
          className="inline-flex shrink-0 items-center justify-center rounded border-2 border-brand bg-surface px-2 py-1.5 text-xs font-bold text-brand"
        >
          View profile
        </Link>
      </div>

      <div
        ref={listRef}
        className="flex min-h-0 flex-1 flex-col-reverse overflow-y-auto overscroll-contain"
      >
        <div className="list-stack py-2">
          {visibleMessages.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted">
              {olderMessages.length > 0
                ? "Nothing from the last 24 hours. Scroll up for earlier chats."
                : `Say hi to ${them.name.split(" ")[0]}. They cook on here too.`}
            </p>
          ) : null}
            {visibleMessages.map((message, index) => {
              const prev = visibleMessages[index - 1];
              const newDay =
                !prev ||
                messageDayKey(prev.createdAt) !== messageDayKey(message.createdAt);
              return (
                <div key={message.id}>
                  {newDay ? (
                    <p className="px-3 py-1.5 text-center text-[11px] font-bold tracking-wide text-muted uppercase">
                      {formatDayLabel(message.createdAt)}
                    </p>
                  ) : null}
                  <div className="feed-card flex items-start gap-3">
                    {message.from === "them" ? (
                      <UserAvatar
                        initials={them.initials}
                        handle={them.handle}
                        src={them.avatarUrl}
                        size="sm"
                      />
                    ) : (
                      <UserAvatar
                        initials={me.initials}
                        handle={me.handle}
                        src={me.avatarUrl}
                        size="sm"
                        me
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="text-sm font-bold text-brand">
                          {message.from === "them" ? them.name : "You"}
                        </p>
                        <p className="shrink-0 text-xs text-muted">
                          {formatChatTime(message.createdAt)}
                        </p>
                      </div>
                      {message.text ? (
                        <p className="mt-1 whitespace-pre-wrap text-sm leading-5 text-ink-secondary">
                          {message.text}
                        </p>
                      ) : null}
                      {message.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={message.imageUrl}
                          alt={message.text ? "" : "Attached photo"}
                          className="mt-2 h-40 w-full rounded border border-line object-cover"
                        />
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
            {themTyping ? <TypingDots name={them.name} /> : null}
        </div>
        <div
          ref={topSentinelRef}
          className="flex min-h-10 shrink-0 items-center justify-center px-3 py-1"
        >
          {loadingHistory ? (
            <p className="text-xs italic text-muted">Loading earlier messages…</p>
          ) : hasOlder ? (
            <button
              type="button"
              className="text-xs text-muted"
              onClick={loadOlderHistory}
            >
              Scroll up for earlier messages
            </button>
          ) : thread.messages.length > 0 ? (
            <p className="text-xs text-muted">Beginning of conversation</p>
          ) : null}
        </div>
      </div>

      <form
        className="flex shrink-0 flex-col gap-2 border-t border-line bg-surface px-3 py-2"
        onSubmit={send}
      >
        {imageUrl ? (
          <div className="relative w-fit max-w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Attachment preview"
              className="max-h-40 max-w-full rounded border border-line object-cover"
            />
            <button
              type="button"
              aria-label="Remove photo"
              onClick={clearImage}
              className="absolute top-1.5 right-1.5 grid size-7 place-items-center rounded-full bg-ink/70 text-white hover:bg-ink"
            >
              <CloseIcon className="size-3.5" />
            </button>
          </div>
        ) : null}

        {imageError ? (
          <p className="text-xs text-brand" role="alert">
            {imageError}
          </p>
        ) : null}

        {emojiOpen ? (
          <div
            className="grid grid-cols-6 gap-1 rounded border border-line bg-app p-2 sm:grid-cols-10"
            role="listbox"
            aria-label="Emoji picker"
          >
            {COMMENT_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                role="option"
                aria-label={`Insert ${emoji}`}
                disabled={autoTyping}
                className="grid size-8 place-items-center rounded text-lg hover:bg-surface disabled:opacity-40"
                onClick={() => insertEmoji(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        ) : null}

        <div className="flex items-center gap-1">
          <label
            htmlFor={fileInputId}
            className={`grid size-9 shrink-0 cursor-pointer place-items-center rounded text-brand hover:bg-app ${
              uploading || autoTyping ? "pointer-events-none opacity-50" : ""
            }`}
            aria-label="Add photo"
          >
            <ImageIcon className="size-5" />
            <input
              ref={fileRef}
              id={fileInputId}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              disabled={uploading || autoTyping}
              onChange={(e) => void handleFile(e.target.files?.[0])}
            />
          </label>
          <button
            type="button"
            aria-label={emojiOpen ? "Hide emojis" : "Add emoji"}
            aria-pressed={emojiOpen}
            disabled={autoTyping}
            onClick={() => {
              cancelPreview();
              setEmojiOpen((open) => !open);
            }}
            className={`grid size-9 shrink-0 place-items-center rounded text-brand hover:bg-app disabled:opacity-40 ${
              emojiOpen ? "bg-app" : ""
            }`}
          >
            <EmojiIcon className="size-5" />
          </button>
          <input
            ref={inputRef}
            id="chat-message"
            name="message"
            type="text"
            value={composerDraft}
            onChange={(e) => {
              cancelPreview();
              setDraft(e.target.value);
            }}
            readOnly={autoTyping}
            className="field min-h-9 flex-1 !py-2 text-sm"
            placeholder={autoTyping ? "" : "Write a message…"}
            aria-label="Message"
            aria-busy={autoTyping}
            autoComplete="off"
          />
          <button
            type="submit"
            aria-label="Send"
            disabled={!canSend}
            className="grid size-9 shrink-0 place-items-center text-brand disabled:opacity-40"
          >
            <SendIcon className="size-6" />
          </button>
        </div>
      </form>
    </div>
  );
}
