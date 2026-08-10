"use client";

import { useRef, useState } from "react";
import { UploadIcon, ImageIcon } from "@/components/app/icons";
import RecipeThumbnail from "@/components/app/RecipeThumbnail";
import { loadImageAsDataUrl } from "@/lib/imageUpload";

type ThumbnailUploadFieldProps = {
  id: string;
  value?: string;
  onChange: (dataUrl: string | undefined) => void;
  emptyHint?: string;
  readyHint?: string;
};

/** Dashed upload area used by recipe and post creators. */
export default function ThumbnailUploadField({
  id,
  value,
  onChange,
  emptyHint = "No thumbnail has been updated yet!",
  readyHint = "Thumbnail ready — tap above to replace.",
}: ThumbnailUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  async function onFileChange(file: File | undefined) {
    if (!file) return;
    setError("");
    const result = await loadImageAsDataUrl(file);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onChange(result.dataUrl);
  }

  return (
    <div className="flex flex-col gap-2.5">
      <input
        ref={inputRef}
        id={id}
        name="thumbnail"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(e) => {
          void onFileChange(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex flex-col items-center gap-2.5 rounded border-2 border-dashed border-line bg-app/60 py-5 transition-colors hover:border-brand hover:bg-brand/5"
      >
        {value ? (
          <RecipeThumbnail
            className="h-32 w-32 rounded"
            src={value}
            alt="Thumbnail preview"
          />
        ) : (
          <UploadIcon className="size-24 text-muted" />
        )}
        <div className="text-center">
          <p className="text-base font-bold text-brand">
            Click to Upload Thumbnail
          </p>
          <p className="text-base italic text-muted">
            Supports JPG, PNG, up to 5MB
          </p>
        </div>
      </button>
      <div className="flex items-center gap-2.5 px-5">
        <ImageIcon className="size-6 shrink-0 text-brand" />
        <p className="flex-1 text-base italic text-muted">
          {value ? readyHint : emptyHint}
        </p>
      </div>
      {error ? (
        <p className="px-5 text-sm text-brand" role="alert">
          {error}
        </p>
      ) : null}
      {value ? (
        <button
          type="button"
          className="self-start px-5 text-sm text-muted"
          onClick={() => {
            setError("");
            onChange(undefined);
          }}
        >
          Clear thumbnail
        </button>
      ) : null}
    </div>
  );
}
