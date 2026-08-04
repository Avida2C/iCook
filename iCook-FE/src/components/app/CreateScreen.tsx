"use client";

import { useState } from "react";
import Link from "next/link";
import { EditIcon, ChevronRightIcon } from "@/components/app/icons";

const guidelines = [
  "Be respectful in your language and avoid inappropriate content.",
  "Use descriptive titles to make your recipes and posts easy to find.",
  "Share tips or variations to make the content more unique and valuable.",
  "If you’re sharing information or inspiration from other sources, give proper credit.",
];

export default function CreateScreen() {
  const [showGuidelines, setShowGuidelines] = useState(false);

  return (
    <div className="min-h-full bg-surface p-[10px]">
      <div className="flex flex-col gap-5 py-5">
        <div className="flex flex-col gap-[5px]">
          <h1 className="text-base font-bold text-brand">Let&rsquo;s Create!</h1>
          <p className="text-base text-ink">
            Select an option to get started. You&rsquo;ll be guided
            step-by-step!
          </p>
        </div>

        <Link
          href="/create/recipe"
          className="flex items-center gap-[15px] bg-brand px-4 py-2 text-white shadow-md transition-colors hover:bg-[#e85557]"
        >
          <EditIcon className="size-5" />
          <span className="text-2xl font-bold">Create a Recipe</span>
        </Link>

        <Link
          href="/create/post"
          className="flex items-center gap-[15px] bg-brand px-4 py-2 text-white shadow-md transition-colors hover:bg-[#e85557]"
        >
          <EditIcon className="size-5" />
          <span className="text-2xl font-bold">Write a Post</span>
        </Link>

        <div className="flex flex-col gap-[15px] py-2.5">
          <button
            type="button"
            onClick={() => setShowGuidelines((v) => !v)}
            aria-expanded={showGuidelines}
            className="flex w-full items-center justify-between gap-2 text-left"
          >
            <span className="text-base font-bold text-ink">
              View General Guidelines
            </span>
            <ChevronRightIcon
              className={`size-6 text-brand transition-transform ${showGuidelines ? "rotate-90" : ""}`}
            />
          </button>

          {showGuidelines ? (
            <ul className="ms-6 flex list-disc flex-col gap-3 text-base italic text-muted">
              {guidelines.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}
