"use client";

import { useId, useRef, useState } from "react";
import { UploadIcon } from "@/components/app/icons";
import UserAvatar from "@/components/app/UserAvatar";
import { loadImageAsDataUrl } from "@/lib/imageUpload";

type AvatarPickerProps = {
  initials: string;
  handle?: string;
  value?: string | null;
  onChange: (dataUrl: string | null) => void;
  onError?: (message: string) => void;
  size?: "md" | "lg";
  hint?: string;
  /** Shown under the size hint (e.g. profile edit). */
  actionHint?: string;
};

export default function AvatarPicker({
  initials,
  handle,
  value,
  onChange,
  onError,
  size = "lg",
  hint = "JPG or PNG, up to 5MB",
  actionHint,
}: AvatarPickerProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    const result = await loadImageAsDataUrl(file);
    setBusy(false);
    if (!result.ok) {
      onError?.(result.error);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    onError?.("");
    onChange(result.dataUrl);
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <label
        htmlFor={inputId}
        className={`relative cursor-pointer${busy ? " opacity-60" : ""}`}
        aria-label="Upload profile picture"
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt=""
            className={`${size === "lg" ? "avatar-lg" : "avatar"} avatar-me object-cover p-0`}
          />
        ) : (
          <UserAvatar initials={initials || "?"} handle={handle} size={size} me />
        )}
        <span className="absolute -right-0.5 -bottom-0.5 grid size-7 place-items-center rounded-full bg-brand text-white shadow-bar">
          <UploadIcon className="size-3.5" />
        </span>
        <input
          ref={inputRef}
          id={inputId}
          name="avatar"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          disabled={busy}
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />
      </label>
      <div className="text-center">
        <p className="text-xs italic text-muted">{hint}</p>
        {actionHint ? (
          <p className="mt-1 text-sm font-bold text-ink-secondary">
            {actionHint}
          </p>
        ) : null}
      </div>
    </div>
  );
}
