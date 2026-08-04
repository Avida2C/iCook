"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BackIcon } from "@/components/app/icons";
import {
  APP_NAME,
  APP_SUPPORT_EMAIL,
  APP_TAGLINE,
  APP_VERSION,
} from "@/lib/appInfo";

export default function AboutScreen() {
  const router = useRouter();

  return (
    <div className="page">
      <div className="subhead">
        <button type="button" onClick={() => router.back()} aria-label="Back">
          <BackIcon className="size-6 text-ink" />
        </button>
        <span className="section-title">About</span>
      </div>

      <div className="list-stack py-2">
        <section className="feed-card flex flex-col items-center gap-2 py-6 text-center">
          <p className="text-3xl font-extrabold text-brand">{APP_NAME}</p>
          <p className="text-sm text-ink-secondary">{APP_TAGLINE}</p>
          <p className="mt-1 text-xs text-muted">Version {APP_VERSION}</p>
        </section>

        <section className="feed-card flex flex-col gap-2">
          <h2 className="section-title">What is iCook?</h2>
          <p className="text-sm leading-5 text-ink-secondary">
            iCook helps you discover recipes, share what you cook, manage your
            pantry, and stay connected with a community of home cooks.
          </p>
        </section>

        <section className="feed-card flex flex-col gap-1">
          <h2 className="section-title">Legal</h2>
          <Link
            href="/settings/terms"
            className="py-2 text-base text-ink-secondary"
          >
            Terms of Service
          </Link>
          <Link
            href="/settings/privacy"
            className="py-2 text-base text-ink-secondary"
          >
            Privacy Policy
          </Link>
        </section>

        <section className="feed-card flex flex-col gap-1">
          <h2 className="section-title">Support</h2>
          <a
            href={`mailto:${APP_SUPPORT_EMAIL}`}
            className="py-2 text-base text-brand"
          >
            {APP_SUPPORT_EMAIL}
          </a>
        </section>
      </div>
    </div>
  );
}
