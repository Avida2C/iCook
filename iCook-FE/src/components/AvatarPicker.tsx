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
  /** Profile edit layout matching User Details (dashed ring + Figma badge). */
  variant?: "default" | "profile";
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
  variant = "default",
  hint = "JPG or PNG, up to 5MB",
  actionHint,
}: AvatarPickerProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const isProfile = variant === "profile";

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
        className={`relative cursor-pointer${busy ? " opacity-60" : ""}${
          isProfile
            ? " flex size-[143px] items-center justify-center rounded-full border-2 border-dashed border-[#a6aab8] dark:border-line"
            : ""
        }`}
        aria-label="Upload profile picture"
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt=""
            className={
              isProfile
                ? "size-[130px] rounded-full object-cover"
                : `${size === "lg" ? "avatar-lg" : "avatar"} avatar-me object-cover p-0`
            }
          />
        ) : isProfile ? (
          <UserAvatar
            initials={initials || "?"}
            handle={handle}
            size="lg"
            me
            className="!size-[130px] !border-0 !text-3xl"
          />
        ) : (
          <UserAvatar
            initials={initials || "?"}
            handle={handle}
            size={size}
            me
          />
        )}
        {isProfile ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/icons/profile/upload-badge.svg"
            alt=""
            width={41}
            height={40}
            className="pointer-events-none absolute right-[-2px] bottom-0 h-10 w-[41px]"
          />
        ) : (
          <span className="absolute -right-0.5 -bottom-0.5 grid size-7 place-items-center rounded-full bg-brand text-white shadow-bar">
            <UploadIcon className="size-3.5" />
          </span>
        )}
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
      <div className="flex w-full flex-col items-center text-center">
        {isProfile ? (
          <>
            {actionHint ? (
              <p className="text-sm font-bold leading-[19.6px] text-brand">
                {actionHint}
              </p>
            ) : null}
            <p className="text-xs leading-3.5 text-ink-secondary">{hint}</p>
          </>
        ) : (
          <>
            <p className="text-xs italic text-muted">{hint}</p>
            {actionHint ? (
              <p className="mt-1 text-sm font-bold text-ink-secondary">
                {actionHint}
              </p>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
