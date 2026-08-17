"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useTheme } from "@/components/theme/ThemeProvider";
import { MoonIcon, SunIcon } from "@/components/app/icons";
import { APP_SUPPORT_EMAIL, APP_VERSION } from "@/lib/appInfo";

type Row =
  | { kind: "link"; label: string; href: string }
  | { kind: "meta"; label: string; value: string }
  | { kind: "theme"; label: string }
  | { kind: "accent"; label: string };

type Section = { title: string; rows: Row[] };

const sections: Section[] = [
  {
    title: "Account",
    rows: [
      { kind: "link", label: "User Details", href: "/settings/user" },
      { kind: "link", label: "Change Email", href: "/change-email" },
      { kind: "link", label: "Change Password", href: "/change-password" },
    ],
  },
  {
    title: "Privacy & Security",
    rows: [
      { kind: "link", label: "Security", href: "/settings/security" },
    ],
  },
  {
    title: "Kitchen",
    rows: [{ kind: "link", label: "Week plan", href: "/plan" }],
  },
  {
    title: "Preferences",
    rows: [
      { kind: "theme", label: "Theme" },
      { kind: "accent", label: "Accent color" },
      {
        kind: "link",
        label: "Notifications",
        href: "/settings/notifications",
      },
    ],
  },
  {
    title: "About the App",
    rows: [
      { kind: "link", label: "About", href: "/settings/about" },
      { kind: "meta", label: "App Version", value: APP_VERSION },
      { kind: "link", label: "Terms of Service", href: "/settings/terms" },
      { kind: "link", label: "Privacy Policy", href: "/settings/privacy" },
      {
        kind: "link",
        label: "Contact Support",
        href: `mailto:${APP_SUPPORT_EMAIL}`,
      },
    ],
  },
];

export default function MorePanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, toggleTheme, accent, accents, setAccent } = useTheme();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function handleLogout() {
    logout();
    onClose();
    router.replace("/login");
  }

  return (
    <div
      className={`absolute inset-0 z-40 ${open ? "" : "pointer-events-none"}`}
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close settings"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
        className={`absolute inset-0 bg-overlay transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      <aside
        id="more-settings-panel"
        className={`absolute inset-y-0 left-0 flex w-[min(100%,300px)] flex-col bg-app shadow-panel transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <header className="flex shrink-0 items-center justify-between bg-brand px-3 py-2.5">
          <h2 className="text-base font-bold text-white">Settings</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            tabIndex={open ? 0 : -1}
            className="relative size-5 shrink-0"
          >
            <img
              src="/icons/more/close.svg"
              alt=""
              aria-hidden
              className="absolute inset-0 size-full max-w-none"
            />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto py-2">
          <div className="list-stack">
            {sections.map((section) => (
              <section key={section.title} className="feed-card flex flex-col gap-1">
                <h3 className="text-xs font-bold text-brand-soft">
                  {section.title}
                </h3>
                <div className="flex flex-col">
                  {section.rows.map((row) => {
                    if (row.kind === "link") {
                      return (
                        <Link
                          key={row.label}
                          href={row.href}
                          onClick={onClose}
                          tabIndex={open ? 0 : -1}
                          className="block w-full py-2 text-left text-base text-ink-secondary"
                        >
                          {row.label}
                        </Link>
                      );
                    }

                    if (row.kind === "meta") {
                      return (
                        <div
                          key={row.label}
                          className="flex w-full items-center justify-between gap-2 py-2"
                        >
                          <span className="text-base text-ink-secondary">
                            {row.label}
                          </span>
                          <span className="shrink-0 text-base font-bold text-ink">
                            {row.value}
                          </span>
                        </div>
                      );
                    }

                    if (row.kind === "accent") {
                      return (
                        <div key={row.label} className="flex flex-col gap-2 py-2">
                          <span className="text-base text-ink-secondary">
                            {row.label}
                          </span>
                          <div
                            className="flex flex-wrap gap-2"
                            role="radiogroup"
                            aria-label="Accent color"
                          >
                            {accents.map((palette) => {
                              const selected = accent === palette.id;
                              return (
                                <button
                                  key={palette.id}
                                  type="button"
                                  role="radio"
                                  aria-checked={selected}
                                  aria-label={palette.label}
                                  tabIndex={open ? 0 : -1}
                                  onClick={() => setAccent(palette.id)}
                                  title={palette.label}
                                  className={`relative size-8 rounded-full transition-transform ${
                                    selected
                                      ? "ring-2 ring-brand ring-offset-2 ring-offset-surface scale-105"
                                      : "ring-1 ring-line"
                                  }`}
                                  style={{ backgroundColor: palette.brand }}
                                >
                                  <span
                                    className="absolute inset-x-1 bottom-1 h-1.5 rounded-full opacity-90"
                                    style={{ backgroundColor: palette.brandSoft }}
                                    aria-hidden
                                  />
                                  <span className="sr-only">{palette.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }

                    const isDark = theme === "dark";
                    return (
                      <button
                        key={row.label}
                        type="button"
                        tabIndex={open ? 0 : -1}
                        onClick={toggleTheme}
                        aria-pressed={isDark}
                        className="flex w-full items-center gap-2 py-2 text-left"
                      >
                        <span className="min-w-0 flex-1 text-base text-ink-secondary">
                          {row.label}
                        </span>
                        {isDark ? (
                          <SunIcon
                            className="size-4.5 shrink-0 text-brand"
                            aria-hidden
                          />
                        ) : (
                          <MoonIcon
                            className="size-4.5 shrink-0 text-brand"
                            aria-hidden
                          />
                        )}
                        <span className="sr-only">
                          {isDark
                            ? "Switch to light mode"
                            : "Switch to dark mode"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          tabIndex={open ? 0 : -1}
          className="flex shrink-0 items-center justify-center gap-2 bg-brand py-3.5 text-white hover:bg-brand-hover"
        >
          <img
            src="/icons/more/logout.svg"
            alt=""
            aria-hidden
            className="size-5 shrink-0"
          />
          <span className="text-base font-bold">Log Out</span>
        </button>
      </aside>
    </div>
  );
}
