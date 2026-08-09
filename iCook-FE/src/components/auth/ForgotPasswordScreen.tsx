"use client";

import { useState } from "react";
import Link from "next/link";
import AuthCard from "@/components/AuthCard";
import LogoSlogan from "@/components/LogoSlogan";
import TextField from "@/components/TextField";
import { PrimaryButton } from "@/components/PrimaryButton";
import {
  useAuth,
  type RecoveryMethod,
  type RecoveryProof,
} from "@/components/auth/AuthProvider";
import {
  BackIcon,
  KeyIcon,
  MailIcon,
  ShieldIcon,
  SmartphoneIcon,
} from "@/components/app/icons";

const METHOD_META: Record<
  RecoveryMethod,
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
  | { kind: "email" }
  | { kind: "demoLocked"; email: string }
  | { kind: "methods"; email: string; name?: string; methods: RecoveryMethod[] }
  | {
      kind: "challenge";
      email: string;
      name?: string;
      methods: RecoveryMethod[];
      method: RecoveryMethod;
    }
  | {
      kind: "password";
      email: string;
      name?: string;
      methods: RecoveryMethod[];
      proof: RecoveryProof;
    }
  | { kind: "done" };

export default function ForgotPasswordScreen() {
  const {
    resolveRecoveryMethods,
    sendRecoveryEmailCode,
    confirmPasskeyRecovery,
    validateRecoveryProof,
    resetPassword,
  } = useAuth();

  const [step, setStep] = useState<Step>({ kind: "email" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  function handleEmail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const data = new FormData(event.currentTarget);
    const identifier = String(data.get("email") ?? "");
    const result = resolveRecoveryMethods(identifier);
    if (!result.ok) {
      if (result.demoLocked && result.email) {
        setStep({ kind: "demoLocked", email: result.email });
        return;
      }
      setError(result.error);
      return;
    }

    if (result.methods.length === 1) {
      const method = result.methods[0];
      setStep({
        kind: "challenge",
        email: result.email,
        name: result.name,
        methods: result.methods,
        method,
      });
      if (method === "email") {
        notifyEmailSent(result.email);
      } else if (method === "passkey") {
        void runPasskey(result.email, result.name, result.methods);
      }
      return;
    }

    setStep({
      kind: "methods",
      email: result.email,
      name: result.name,
      methods: result.methods,
    });
  }

  function notifyEmailSent(email: string) {
    setError(null);
    const result = sendRecoveryEmailCode(email);
    if (!result.ok) {
      setEmailSent(false);
      setError(result.error);
      return;
    }
    setEmailSent(true);
  }

  function advanceWithProof(
    email: string,
    name: string | undefined,
    methods: RecoveryMethod[],
    proof: RecoveryProof,
  ) {
    const validated = validateRecoveryProof(email, proof);
    if (!validated.ok) {
      setError(validated.error);
      return;
    }
    setError(null);
    setNewPassword("");
    setConfirmPassword("");
    setStep({ kind: "password", email, name, methods, proof });
  }

  async function runPasskey(
    email: string,
    name: string | undefined,
    methods: RecoveryMethod[],
  ) {
    setBusy(true);
    setError(null);
    try {
      const confirmed = await confirmPasskeyRecovery(email);
      if (!confirmed.ok) {
        setError(confirmed.error);
        return;
      }
      advanceWithProof(email, name, methods, confirmed.proof);
    } finally {
      setBusy(false);
    }
  }

  function pickMethod(method: RecoveryMethod) {
    if (step.kind !== "methods") return;
    setError(null);
    setEmailSent(false);
    setStep({
      kind: "challenge",
      email: step.email,
      name: step.name,
      methods: step.methods,
      method,
    });
    if (method === "passkey") {
      void runPasskey(step.email, step.name, step.methods);
    } else if (method === "email") {
      notifyEmailSent(step.email);
    }
  }

  async function handleChallenge(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step.kind !== "challenge") return;
    const data = new FormData(event.currentTarget);

    if (step.method === "passkey") {
      await runPasskey(step.email, step.name, step.methods);
      return;
    }

    if (step.method === "authenticator") {
      advanceWithProof(step.email, step.name, step.methods, {
        method: "authenticator",
        code: String(data.get("code") ?? ""),
      });
      return;
    }

    if (step.method === "backup") {
      advanceWithProof(step.email, step.name, step.methods, {
        method: "backup",
        code: String(data.get("code") ?? ""),
      });
    }
  }

  function handlePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step.kind !== "password") return;
    setError(null);
    setBusy(true);
    try {
      const result = resetPassword({
        email: step.email,
        newPassword,
        confirmPassword,
        proof: step.proof,
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

  return (
    <AuthCard>
      <LogoSlogan />
      <h1 className="w-full text-3xl font-bold text-brand">Forgot Password</h1>

      {step.kind === "email" ? (
        <form className="flex w-full flex-col gap-4" onSubmit={handleEmail}>
          <TextField
            label="Username or Email Address"
            name="email"
            placeholder="username or email address"
            autoComplete="username"
            required
          />
                    <p className="text-sm text-muted">
            Enter your email address to get started. You'll then choose your preferred verification method to confirm it's you.
          </p>

          {error ? (
            <p role="alert" className="text-base font-bold text-brand">
              {error}
            </p>
          ) : null}
          <PrimaryButton>Continue</PrimaryButton>
        </form>
      ) : null}

      {step.kind === "demoLocked" ? (
        <div className="flex w-full flex-col gap-4">
          <p className="text-base text-muted">
            You’re trying to reset the demo account{" "}
            <span className="font-bold text-ink">{step.email}</span>. Its password
            can’t be changed — create your own account to set a password.
          </p>
          <button
            type="button"
            onClick={() => {
              setError(null);
              setStep({ kind: "email" });
            }}
            className="text-sm font-bold text-brand self-start"
          >
            Try another email
          </button>
        </div>
      ) : null}

      {step.kind === "methods" ? (
        <div className="flex w-full flex-col gap-3">
          <p className="text-base text-muted">Reset your password as <span className="font-bold text-ink">
              {step.name ?? step.email}
            </span> </p>
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
        </div>
      ) : null}

      {step.kind === "challenge" ? (
        <div className="flex w-full flex-col gap-4">
          <p className="text-base text-muted">
            {METHOD_META[step.method].label} ·{" "}
            <span className="font-bold text-ink">{step.email}</span>
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
                  void runPasskey(step.email, step.name, step.methods)
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
                    <span className="font-bold text-ink">{step.email}</span>, a
                    reset message would be sent there. Email delivery isn’t
                    connected in this local build, so this method can’t change
                    your password here.
                  </>
                ) : (
                  "Sending reset email…"
                )}
              </p>
              <p className="text-sm text-muted">
                To reset your password in this demo, use authenticator, passkey,
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
              <PrimaryButton>Continue</PrimaryButton>
            </form>
          )}
        </div>
      ) : null}

      {step.kind === "password" ? (
        <form
          className="flex w-full flex-col gap-4"
          onSubmit={handlePassword}
        >
          <p className="text-base text-muted">
            Choose a new password for{" "}
            <span className="font-bold text-ink">{step.email}</span>
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
          <PrimaryButton>
            {busy ? "Updating…" : "Reset Password"}
          </PrimaryButton>
        </form>
      ) : null}

      {step.kind === "done" ? (
        <div className="flex w-full flex-col gap-4">
          <p className="text-base text-muted">
            You're all set! Your password has been successfully changed, and you can now log in.
          </p>
          <Link href="/login" className="btn-primary-lg mb-4 text-center">
            Return to Log In
          </Link>
        </div>
      ) : (
        <Link
          href="/login"
          className="mt-2 flex items-center gap-1 self-start text-base font-bold text-brand"
        >
          <BackIcon className="size-4" /> Return to Log In
        </Link>
      )}
    </AuthCard>
  );
}
