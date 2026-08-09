"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthCard from "@/components/AuthCard";
import LogoSlogan from "@/components/LogoSlogan";
import { useAuth } from "@/components/auth/AuthProvider";
import GettingAppReady, {
  waitForAppReady,
} from "@/components/auth/GettingAppReady";

export default function RestoreAccountScreen() {
  const router = useRouter();
  const { loading, getPendingDeletion, restoreAccount, logout } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const pending = getPendingDeletion();

  useEffect(() => {
    if (loading) return;
    if (!getPendingDeletion()) {
      router.replace("/login");
    }
  }, [loading, getPendingDeletion, router]);

  async function handleRestore() {
    setError(null);
    setBusy(true);
    try {
      const result = restoreAccount();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setPreparing(true);
      await waitForAppReady();
      router.push("/recipes");
    } finally {
      setBusy(false);
    }
  }

  function handleKeepDeleted() {
    logout();
    router.replace("/login");
  }

  if (loading || !pending) {
    return (
      <AuthCard>
        <p className="w-full text-center text-muted">Loading…</p>
      </AuthCard>
    );
  }

  return (
    <AuthCard overlay={preparing ? <GettingAppReady /> : null}>
      <LogoSlogan />
      <h1 className="w-full text-3xl font-bold text-brand">Restore Account</h1>
      <p className="w-full text-base text-muted">
        <span className="font-bold text-ink">{pending.email}</span> is
        scheduled for permanent deletion. You have{" "}
        <span className="font-bold text-ink">
          {pending.daysLeft} day{pending.daysLeft === 1 ? "" : "s"}
        </span>{" "}
        left to restore it.
      </p>
      {error ? (
        <p role="alert" className="w-full text-base font-bold text-brand">
          {error}
        </p>
      ) : null}
      <button
        type="button"
        disabled={busy}
        onClick={() => void handleRestore()}
        className="btn-primary-lg mb-4 disabled:opacity-50"
      >
        {busy ? "Restoring…" : "Restore account"}
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={handleKeepDeleted}
        className="btn-secondary w-full disabled:opacity-50"
      >
        Keep deleted
      </button>
      <p className="w-full text-sm text-muted">
        After 30 days from deletion, this account is permanently removed and
        can&rsquo;t be recovered.{" "}
        <Link href="/login" className="font-bold text-brand">
          Back to login
        </Link>
      </p>
    </AuthCard>
  );
}
