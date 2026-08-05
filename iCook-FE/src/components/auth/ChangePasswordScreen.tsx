"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthCard from "@/components/AuthCard";
import LogoSlogan from "@/components/LogoSlogan";
import TextField from "@/components/TextField";
import { PrimaryButton } from "@/components/PrimaryButton";
import {
  useAuth,
  isDemoAccount,
  type ReauthMethod,
  type ReauthProof,
} from "@/components/auth/AuthProvider";
import {
  BackIcon,
  KeyIcon,
  ShieldIcon,
  SmartphoneIcon,
} from "@/components/app/icons";

const METHOD_META: Record<
  ReauthMethod,
  { label: string; hint: string; icon: React.ReactNode }
> = {
  authenticator: {
    label: "Authenticator app",
    hint: "6-digit code from your authenticator",
    icon: <ShieldIcon className="size-5" />,
  },
  passkey: {
    label: "Passkey",
    hint: "Face ID, fingerprint, or security key",
    icon: <SmartphoneIcon className="size-5" />,
  },
  password: {
    label: "Password",
    hint: "Use your account password",
    icon: <KeyIcon className="size-5" />,
  },
};

type Step =
  | { kind: "details" }
  | { kind: "methods"; methods: ReauthMethod[] }
  | {
      kind: "challenge";
      methods: ReauthMethod[];
      method: ReauthMethod;
    }
  | { kind: "done" };

export default function ChangePasswordScreen() {
  const router = useRouter();
  const {
    user,
    loading,
    getReauthMethods,
    confirmPasskeyReauth,
    changePassword,
  } = useAuth();

  const [step, setStep] = useState<Step>({ kind: "details" });
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  const demoLocked = isDemoAccount(user?.email);

  function goToPreviousStep() {
    setError(null);
    if (step.kind === "challenge" && step.methods.length > 1) {
      setStep({ kind: "methods", methods: step.methods });
      return;
    }
    if (step.kind === "methods" || step.kind === "challenge") {
      setStep({ kind: "details" });
    }
  }

  function handleDetails(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    const methods = getReauthMethods();
    if (methods.length === 0) {
      setError(
        "Set up an authenticator or passkey in Security before changing your password.",
      );
      return;
    }
    if (methods.length === 1) {
      setStep({ kind: "challenge", methods, method: methods[0] });
      return;
    }
    setStep({ kind: "methods", methods });
  }

  function pickMethod(method: ReauthMethod) {
    if (step.kind !== "methods") return;
    setError(null);
    setStep({ kind: "challenge", methods: step.methods, method });
    if (method === "passkey") {
      void runWithProof({ method: "passkey", credentialId: "" }, true);
    }
  }

  async function runWithProof(proof: ReauthProof, fromPasskeyPick = false) {
    setBusy(true);
    setError(null);
    try {
      let finalProof = proof;
      if (proof.method === "passkey" || fromPasskeyPick) {
        const confirmed = await confirmPasskeyReauth();
        if (!confirmed.ok) {
          setError(confirmed.error);
          return;
        }
        finalProof = confirmed.proof;
      }
      const result = changePassword({
        newPassword,
        confirmPassword,
        reauth: finalProof,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setStep({ kind: "done" });
    } finally {
      setBusy(false);
    }
  }

  async function handleChallenge(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step.kind !== "challenge") return;
    const data = new FormData(event.currentTarget);

    if (step.method === "passkey") {
      await runWithProof({ method: "passkey", credentialId: "" }, true);
      return;
    }
    if (step.method === "authenticator") {
      await runWithProof({
        method: "authenticator",
        code: String(data.get("code") ?? ""),
      });
      return;
    }
    await runWithProof({
      method: "password",
      password: String(data.get("password") ?? ""),
    });
  }

  if (loading || !user) {
    return (
      <AuthCard>
        <p className="w-full text-center text-muted">Loading…</p>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <LogoSlogan />
      <h1 className="w-full text-3xl font-bold text-brand">Change Password</h1>

      {demoLocked ? (
        <div className="flex w-full flex-col gap-4">
          <p className="text-base text-muted">
            You’re signed in as the demo account{" "}
            <span className="font-bold text-ink">{user.email}</span>. Its password
            can’t be changed — create your own account to set a password.
          </p>
          <Link
            href="/recipes"
            className="mt-2 flex items-center gap-1 self-start text-base font-bold text-brand"
          >
            <BackIcon className="size-4" /> Return to app
          </Link>
        </div>
      ) : (
        <>
      {step.kind === "details" ? (
        <form className="flex w-full flex-col gap-4" onSubmit={handleDetails}>
          <p className="text-base text-muted">
            Choose a new password for{" "}
            <span className="font-bold text-ink">{user.email}</span>
          </p>
          <TextField
            label="New password"
            name="newPassword"
            type="password"
            placeholder="at least 8 characters"
            autoComplete="new-password"
            required
            value={newPassword}
            onChange={setNewPassword}
          />
          <TextField
            label="Confirm new password"
            name="confirmPassword"
            type="password"
            placeholder="confirm password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={setConfirmPassword}
          />
          {error ? (
            <p role="alert" className="text-base font-bold text-brand">
              {error}
            </p>
          ) : null}
          <PrimaryButton>Continue</PrimaryButton>
        </form>
      ) : null}

      {step.kind === "methods" ? (
        <div className="flex w-full flex-col gap-3">
          <p className="text-base text-muted">
            Confirm it’s you before updating your password.
          </p>
          <p className="text-sm text-muted">
            Choose how you want to confirm. Methods come from your Security
            settings.
          </p>
          <ul className="flex flex-col gap-2">
            {step.methods.map((method) => {
              const meta = METHOD_META[method];
              return (
                <li key={method}>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => pickMethod(method)}
                    className="flex w-full items-center gap-3 rounded border border-line bg-surface px-3 py-3 text-left transition-colors hover:border-brand"
                  >
                    <span className="text-brand">{meta.icon}</span>
                    <span className="flex flex-col">
                      <span className="text-base font-bold text-ink">
                        {meta.label}
                      </span>
                      <span className="text-sm text-muted">{meta.hint}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          {error ? (
            <p role="alert" className="text-base font-bold text-brand">
              {error}
            </p>
          ) : null}
          <button
            type="button"
            onClick={goToPreviousStep}
            className="text-sm font-bold text-brand"
          >
            Edit password
          </button>
        </div>
      ) : null}

      {step.kind === "challenge" ? (
        <div className="flex w-full flex-col gap-4">
          <p className="text-base text-muted">
            {METHOD_META[step.method].label} · confirm password change
          </p>

          {step.method === "passkey" ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted">
                Use your device biometrics or security key to continue.
              </p>
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  void runWithProof({ method: "passkey", credentialId: "" }, true)
                }
                className="btn-primary-lg mb-4"
              >
                {busy ? "Waiting for passkey…" : "Continue with passkey"}
              </button>
              {error ? (
                <p role="alert" className="text-base font-bold text-brand">
                  {error}
                </p>
              ) : null}
            </div>
          ) : (
            <form
              className="flex w-full flex-col gap-4"
              onSubmit={(e) => void handleChallenge(e)}
            >
              {step.method === "password" ? (
                <TextField
                  label="Current password"
                  name="password"
                  type="password"
                  placeholder="password"
                  autoComplete="current-password"
                  required
                />
              ) : (
                <TextField
                  label="Authentication code"
                  name="code"
                  placeholder="6-digit code"
                  autoComplete="one-time-code"
                  required
                />
              )}
              {error ? (
                <p role="alert" className="text-base font-bold text-brand">
                  {error}
                </p>
              ) : null}
              <PrimaryButton>
                {busy ? "Updating…" : "Update Password"}
              </PrimaryButton>
            </form>
          )}

          {step.methods.length > 1 ? (
            <button
              type="button"
              onClick={() => {
                setError(null);
                setStep({ kind: "methods", methods: step.methods });
              }}
              className="text-sm font-bold text-brand"
            >
              Try another method
            </button>
          ) : (
            <button
              type="button"
              onClick={goToPreviousStep}
              className="text-sm font-bold text-brand"
            >
              Edit password
            </button>
          )}
        </div>
      ) : null}

      {step.kind === "done" ? (
        <div className="flex w-full flex-col gap-4">
          <p className="text-base text-muted">
            Your password has been updated.
          </p>
          <Link href="/recipes" className="btn-primary-lg mb-4 text-center">
            Return to app
          </Link>
        </div>
      ) : (
        <Link
          href="/recipes"
          className="mt-2 flex items-center gap-1 self-start text-base font-bold text-brand"
        >
          <BackIcon className="size-4" /> Return to app
        </Link>
      )}
        </>
      )}
    </AuthCard>
  );
}
