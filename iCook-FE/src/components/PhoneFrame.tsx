"use client";

import { useEffect, useState, type ReactNode } from "react";

type PhoneFrameProps = {
  children: ReactNode;
  /** Fill the viewport height (app shell). Default true. */
  fill?: boolean;
  /**
   * Status/home chrome background.
   * - `surface`: matches logged-in app bars
   * - `clear`: transparent so branded gradients show through
   */
  chrome?: "surface" | "clear";
  className?: string;
};

function formatLocalTime(date: Date) {
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function StatusBar({ chrome }: { chrome: "surface" | "clear" }) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => setTime(formatLocalTime(new Date()));
    tick();

    const now = new Date();
    const msToNextMinute =
      (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

    let intervalId: ReturnType<typeof setInterval> | undefined;
    const timeoutId = setTimeout(() => {
      tick();
      intervalId = setInterval(tick, 60_000);
    }, msToNextMinute);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 top-0 z-40 hidden h-11 items-end px-3 pb-3 text-[12px] font-semibold leading-none tracking-tight sm:flex ${
        chrome === "surface" ? "text-muted" : "text-white/80"
      }`}
    >
      <span className="min-w-13 tabular-nums">{time || "\u00a0"}</span>

      <div className="absolute top-2.5 left-1/2 h-[1.65rem] w-29 -translate-x-1/2 rounded-full bg-black">
        <span className="absolute top-1/2 right-3 size-2 -translate-y-1/2 rounded-full bg-[#1a1a1c] ring-1 ring-[#2a2a2e]" />
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <svg
          width="17"
          height="12"
          viewBox="0 0 17 12"
          fill="currentColor"
          className="opacity-90"
        >
          <rect x="0" y="8" width="3" height="4" rx="0.5" />
          <rect x="4.5" y="5.5" width="3" height="6.5" rx="0.5" />
          <rect x="9" y="3" width="3" height="9" rx="0.5" />
          <rect x="13.5" y="0" width="3" height="12" rx="0.5" />
        </svg>
        <svg
          width="15"
          height="12"
          viewBox="0 0 15 12"
          fill="currentColor"
          className="opacity-90"
        >
          <path d="M7.5 11.25a1.1 1.1 0 1 0 0-2.2 1.1 1.1 0 0 0 0 2.2Z" />
          <path d="M4.1 8.05a4.85 4.85 0 0 1 6.8 0l-.95.95a3.5 3.5 0 0 0-4.9 0l-.95-.95Z" />
          <path d="M1.35 5.3a8.7 8.7 0 0 1 12.3 0l-.95.95a7.35 7.35 0 0 0-10.4 0L1.35 5.3Z" />
          <path d="M7.5.4C3.35.4.05 2.85.05 2.85L1 3.8S3.85 1.7 7.5 1.7s6.5 2.1 6.5 2.1l.95-.95S11.65.4 7.5.4Z" />
        </svg>
        <span className="flex items-center gap-0.5">
          <span className="relative flex h-2.75 w-6 items-center rounded-[3px] border border-current/40 p-px">
            <span className="h-full w-[80%] rounded-[1.5px] bg-current" />
          </span>
          <span className="h-1 w-[1.5px] rounded-r-sm bg-current/40" />
        </span>
      </div>
    </div>
  );
}

function HomeIndicator() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 z-40 hidden h-5 items-start justify-center pt-1.5 sm:flex"
    >
      <span className="h-1.25 w-33 rounded-full bg-ink/30 dark:bg-white/35" />
    </div>
  );
}

/**
 * Presents the app inside a phone device on larger viewports.
 * On real phones the chrome collapses to a full-bleed column.
 */
export default function PhoneFrame({
  children,
  fill = true,
  chrome = "surface",
  className = "",
}: PhoneFrameProps) {
  const heightClass = fill
    ? "h-dvh sm:h-[min(52.75rem,calc(100dvh-2.5rem))]"
    : "min-h-dvh sm:min-h-[min(52.75rem,calc(100dvh-2.5rem))] sm:h-[min(52.75rem,calc(100dvh-2.5rem))]";

  return (
    <div
      className={`flex justify-center bg-app-frame sm:bg-[radial-gradient(120%_80%_at_50%_40%,var(--surface-muted)_0%,var(--app-frame)_65%)] ${
        fill
          ? "h-dvh items-stretch sm:items-center"
          : "min-h-dvh items-stretch sm:items-center"
      } sm:px-4 sm:py-5`}
    >
      <div
        className={`phone-device relative w-full max-w-100 overflow-hidden bg-app sm:max-w-97.5 sm:rounded-[2.75rem] sm:border-[0.625rem] sm:border-[#1a1c1e] sm:bg-[#1a1c1e] dark:sm:border-[#0c0d0f] dark:sm:bg-[#0c0d0f] ${heightClass} ${className}`}
      >
        {/* Side buttons */}
        <span
          aria-hidden
          className="pointer-events-none absolute top-30 left-[-0.8rem] hidden h-7 w-[0.18rem] rounded-l-sm bg-[#2a2d31] sm:block"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute top-41 left-[-0.8rem] hidden h-14 w-[0.18rem] rounded-l-sm bg-[#2a2d31] sm:block"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute top-58 left-[-0.8rem] hidden h-14 w-[0.18rem] rounded-l-sm bg-[#2a2d31] sm:block"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute top-46 right-[-0.8rem] hidden h-20 w-[0.18rem] rounded-r-sm bg-[#2a2d31] sm:block"
        />

        {/* Screen */}
        <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden pb-3 pt-2 sm:rounded-[2.1rem]">
          <StatusBar chrome={chrome} />
          <HomeIndicator />
          {/* Safe-area insets reserve room for status bar + home indicator */}
          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden sm:pt-11 sm:pb-5">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
