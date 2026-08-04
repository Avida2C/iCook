"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { BackIcon } from "@/components/app/icons";
import { APP_SUPPORT_EMAIL, APP_VERSION } from "@/lib/appInfo";

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useAuth();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <div className="page">
      <div className="subhead">
        <button type="button" onClick={() => router.back()} aria-label="Back">
          <BackIcon className="size-6 text-ink" />
        </button>
        <span className="section-title">Settings</span>
      </div>

      <div className="list-stack py-2">
        <section className="feed-card flex flex-col gap-1">
          <h2 className="text-xs font-bold text-brand-soft">Account</h2>
          <Link href="/settings/user" className="py-2 text-base text-ink">
            User Details
          </Link>
        </section>

        <section className="feed-card flex flex-col gap-1">
          <h2 className="text-xs font-bold text-brand-soft">
            Privacy &amp; Security
          </h2>
          <Link href="/settings/security" className="py-2 text-base text-ink">
            Security
          </Link>
        </section>

        <section className="feed-card flex flex-col gap-1">
          <h2 className="text-xs font-bold text-brand-soft">Preferences</h2>
          <Link
            href="/settings/notifications"
            className="py-2 text-base text-ink"
          >
            Notifications
          </Link>
        </section>

        <section className="feed-card flex flex-col gap-1">
          <h2 className="text-xs font-bold text-brand-soft">About the App</h2>
          <Link href="/settings/about" className="py-2 text-base text-ink">
            About
          </Link>
          <div className="flex items-center justify-between gap-2 py-2">
            <span className="text-base text-ink">App Version</span>
            <span className="font-bold text-ink">{APP_VERSION}</span>
          </div>
          <Link href="/settings/terms" className="py-2 text-base text-ink">
            Terms of Service
          </Link>
          <Link href="/settings/privacy" className="py-2 text-base text-ink">
            Privacy Policy
          </Link>
          <a
            href={`mailto:${APP_SUPPORT_EMAIL}`}
            className="py-2 text-base text-brand"
          >
            Contact Support
          </a>
        </section>

        <button
          type="button"
          onClick={handleLogout}
          className="btn-primary mx-3 w-auto justify-start px-4 text-base"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
