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
  MailIcon,
  ShieldIcon,
  SmartphoneIcon,
} from "@/components/app/icons";

const METHOD_META: Record<
  ReauthMethod,
  { label: string; hint: string; icon: React.ReactNode }
> = {
  passkey: {
    label: "Passkey",
    hint: "Face ID, fingerprint, or security key",
    icon: <SmartphoneIcon className="size-5" />,
  },
  authenticator: {
    label: "Authenticator app",
    hint: "6-digit code from your authenticator",
    icon: <ShieldIcon className="size-5" />,
  },
  backup: {
    label: "Backup code",
    hint: "One-time authentication code",
    icon: <KeyIcon className="size-5" />,
  },
  email: {
    label: "Authenticate via Email",
    hint: "Send a one-time code to your email",
    icon: <MailIcon className="size-5" />,
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

export default function ChangeEmailScreen() {
  const router = useRouter();
  const {
    user,
    loading,
    getReauthMethods,
    confirmPasskeyReauth,
    sendRecoveryEmailCode,
    updateEmail,
  } = useAuth();

  const [step, setStep] = useState<Step>({ kind: "details" });
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  const demoLocked = isDemoAccount(user?.email);

  function goToPreviousStep() {
    setError(null);
    setEmailSent(false);
    if (step.kind === "challenge" && step.methods.length > 1) {
      setStep({ kind: "methods", methods: step.methods });
      return;
    }
    if (step.kind === "methods" || step.kind === "challenge") {
      setStep({ kind: "details" });
    }
  }

  function notifyEmailSent() {
    if (!user?.email) return;
    setError(null);
    const result = sendRecoveryEmailCode(user.email);
    if (!result.ok) {
      setEmailSent(false);
      setError(result.error);
      return;
    }
    setEmailSent(true);
  }

  function handleDetails(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setEmailSent(false);
    const next = email.trim().toLowerCase();
    const confirm = confirmEmail.trim().toLowerCase();
    if (!next) {
      setError("Enter a new email address.");
      return;
    }
    if (next !== confirm) {
      setError("Email addresses do not match.");
      return;
    }
    if (user && next === user.email.toLowerCase()) {
      setError("That is already your email address.");
      return;
    }
    const methods = getReauthMethods();
    if (methods.length === 0) {
      setError(
        "Set up a passkey, authenticator, or backup codes in Security before changing your email.",
      );
      return;
    }
    if (methods.length === 1) {
      const method = methods[0];
      setStep({ kind: "challenge", methods, method });
      if (method === "email") {
        notifyEmailSent();
      } else if (method === "passkey") {
        void runWithProof({ method: "passkey", credentialId: "" }, true);
      }
      return;
    }
    setStep({ kind: "methods", methods });
  }

  function pickMethod(method: ReauthMethod) {
    if (step.kind !== "methods") return;
    setError(null);
    setEmailSent(false);
    setStep({ kind: "challenge", methods: step.methods, method });
    if (method === "passkey") {
      void runWithProof({ method: "passkey", credentialId: "" }, true);
    } else if (method === "email") {
      notifyEmailSent();
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
      const result = updateEmail({
        email,
        confirmEmail,
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
    if (step.method === "backup") {
      await runWithProof({
        method: "backup",
        code: String(data.get("code") ?? ""),
      });
    }
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
      <h1 className="w-full text-3xl font-bold text-brand">Change Email</h1>

      {demoLocked ? (
        <div className="flex w-full flex-col gap-4">
          <p className="text-base text-muted">
            You’re signed in as the demo account{" "}
            <span className="font-bold text-ink">{user.email}</span>. Its email
            can’t be changed — create your own account to update email.
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
            Current email{" "}
            <span className="font-bold text-ink">{user.email}</span>
          </p>
          <TextField
            label="New email address"
            name="email"
            type="email"
            placeholder="email address"
            autoComplete="email"
            required
            value={email}
            onChange={setEmail}
          />
          <TextField
            label="Confirm email address"
            name="confirmEmail"
            type="email"
            placeholder="confirm email address"
            autoComplete="email"
            required
            value={confirmEmail}
            onChange={setConfirmEmail}
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
            Confirm it’s you before updating to{" "}
            <span className="font-bold text-ink">{email.trim().toLowerCase()}</span>
          </p>
          <p className="text-sm text-muted">
            Select your preferred verification method to proceed:
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
            Edit email
          </button>
        </div>
      ) : null}

      {step.kind === "challenge" ? (
        <div className="flex w-full flex-col gap-4">
          <p className="text-base text-muted">
            {METHOD_META[step.method].label} · confirm email change
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
          ) : step.method === "email" ? (
            <div className="flex w-full flex-col gap-4">
              <p className="text-sm text-muted">
                {emailSent ? (
                  <>
                    If an account exists for{" "}
                    <span className="font-bold text-ink">{user.email}</span>, a
                    verification message would be sent there. Email delivery
                    isn’t connected in this local build, so this method can’t
                    change your email here.
                  </>
                ) : (
                  "Sending verification email…"
                )}
              </p>
              <p className="text-sm text-muted">
                To change your email in this demo, use authenticator, passkey,
                or a backup code from Security settings.
              </p>
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
              <TextField
                label={
                  step.method === "authenticator"
                    ? "Authentication code"
                    : "Backup code"
                }
                name="code"
                placeholder={
                  step.method === "authenticator" ? "6-digit code" : "XXXX-XXXX"
                }
                autoComplete="one-time-code"
                required
              />
              {error ? (
                <p role="alert" className="text-base font-bold text-brand">
                  {error}
                </p>
              ) : null}
              <PrimaryButton>
                {busy ? "Updating…" : "Update Email"}
              </PrimaryButton>
            </form>
          )}

          {step.methods.length > 1 ? (
            <button
              type="button"
              onClick={() => {
                setError(null);
                setEmailSent(false);
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
              Edit email
            </button>
          )}
        </div>
      ) : null}

      {step.kind === "done" ? (
        <div className="flex w-full flex-col gap-4">
          <p className="text-base text-muted">
            Your email is now{" "}
            <span className="font-bold text-ink">{user.email}</span>
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
