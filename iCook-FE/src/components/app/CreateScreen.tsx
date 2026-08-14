"use client";

import { useState } from "react";
import CreateActionBar from "@/components/app/CreateActionBar";
import { ChevronRightIcon } from "@/components/app/icons";

const guidelines = [
  "Be respectful in your language and avoid inappropriate content.",
  "Use descriptive titles to make your recipes and posts easy to find.",
  "Share tips or variations to make the content more unique and valuable.",
  "If you’re sharing information or inspiration from other sources, give proper credit.",
];

export default function CreateScreen() {
  const [showGuidelines, setShowGuidelines] = useState(false);

  return (
    <div className="page">
      <div className="list-stack py-2">
        <section className="feed-card flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <h1 className="section-title">Let&rsquo;s Create!</h1>
            <p className="text-base text-ink-secondary">
              Select an option to get started. You&rsquo;ll be guided
              step-by-step!
            </p>
          </div>

          <CreateActionBar />

          <div className="flex flex-col gap-3 border-t border-line pt-4">
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
        </section>
      </div>
    </div>
  );
}
