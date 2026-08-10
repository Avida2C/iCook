"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import {
  CloseIcon,
  EmojiIcon,
  ImageIcon,
  SendIcon,
} from "@/components/app/icons";
import { loadImageAsDataUrl } from "@/lib/imageUpload";

const COMMENT_EMOJIS = [
  "😀",
  "😍",
  "😋",
  "🤤",
  "😂",
  "🔥",
  "❤️",
  "👍",
  "👏",
  "🙌",
  "🤩",
  "😮",
  "😢",
  "🤔",
  "💯",
  "✨",
  "🍝",
  "🍕",
  "🥗",
  "🍰",
  "🍪",
  "🥐",
  "🍳",
  "🥘",
  "🍲",
  "🧁",
  "🧀",
  "🍓",
  "🥑",
  "🌶️",
] as const;

type CommentComposerProps = {
  /** Reset draft when the target changes (e.g. `recipe:1` or `post:3`). */
  targetKey: string;
  onSubmit: (input: { text: string; imageUrl?: string }) => boolean;
  className?: string;
};

export default function CommentComposer({
  targetKey,
  onSubmit,
  className = "",
}: CommentComposerProps) {
  const fileInputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const [draft, setDraft] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);

  useEffect(() => {
    setDraft("");
    setImageUrl(null);
    setImageError("");
    setEmojiOpen(false);
    if (fileRef.current) fileRef.current.value = "";
  }, [targetKey]);

  const canSend = Boolean(draft.trim() || imageUrl) && !uploading;

  function insertEmoji(emoji: string) {
    const el = textRef.current;
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
    if (!file) return;
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

  function submit(e?: FormEvent) {
    e?.preventDefault();
    if (!canSend) return;
    const ok = onSubmit({
      text: draft,
      imageUrl: imageUrl ?? undefined,
    });
    if (!ok) return;
    setDraft("");
    setImageUrl(null);
    setImageError("");
    setEmojiOpen(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <form
      className={`flex flex-col gap-2 rounded bg-app p-2.5${className ? ` ${className}` : ""}`}
      onSubmit={submit}
    >
      <textarea
        ref={textRef}
        id={`comment-${targetKey}`}
        name="comment"
        rows={2}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        className="w-full resize-none bg-transparent text-base font-bold text-ink outline-none placeholder:font-normal placeholder:text-muted"
        placeholder="Write a comment!"
        aria-label="Write a comment"
        autoComplete="off"
      />

      {imageUrl ? (
        <div className="relative w-fit max-w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Comment attachment preview"
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
          className="grid grid-cols-6 gap-1 rounded border border-line bg-surface p-2 sm:grid-cols-10"
          role="listbox"
          aria-label="Emoji picker"
        >
          {COMMENT_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              role="option"
              aria-label={`Insert ${emoji}`}
              className="grid size-8 place-items-center rounded text-lg hover:bg-app"
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
          className={`grid size-9 cursor-pointer place-items-center rounded text-brand hover:bg-surface ${
            uploading ? "opacity-50" : ""
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
            disabled={uploading}
            onChange={(e) => void handleFile(e.target.files?.[0])}
          />
        </label>
        <button
          type="button"
          aria-label={emojiOpen ? "Hide emojis" : "Add emoji"}
          aria-pressed={emojiOpen}
          onClick={() => setEmojiOpen((open) => !open)}
          className={`grid size-9 place-items-center rounded text-brand hover:bg-surface ${
            emojiOpen ? "bg-surface" : ""
          }`}
        >
          <EmojiIcon className="size-5" />
        </button>
        <button
          type="submit"
          aria-label="Send comment"
          disabled={!canSend}
          className="ms-auto grid size-9 place-items-center rounded text-brand disabled:opacity-40"
        >
          <SendIcon className="size-6" />
        </button>
      </div>
    </form>
  );
}
