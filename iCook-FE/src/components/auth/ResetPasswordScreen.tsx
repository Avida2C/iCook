"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthCard from "@/components/AuthCard";
import LogoSlogan from "@/components/LogoSlogan";
import TextField from "@/components/TextField";
import { PrimaryButton } from "@/components/PrimaryButton";
import {
  AuthChallenge,
  AuthMethodList,
} from "@/components/auth/AuthVerify";
import {
  useAuth,
  isDemoAccount,
  type RecoveryMethod,
  type RecoveryProof,
} from "@/components/auth/AuthProvider";
import { BackIcon } from "@/components/app/icons";

type Step =
  | { kind: "loading" }
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

export default function ResetPasswordScreen() {
  const {
    user,
    loading,
    resolveRecoveryMethods,
    sendRecoveryEmailCode,
    confirmPasskeyRecovery,
    validateRecoveryProof,
    resetPassword,
  } = useAuth();

  const signedIn = !!user;
  const [step, setStep] = useState<Step>({ kind: "loading" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [bootstrapped, setBootstrapped] = useState(false);

  const passwordsMismatch =
    confirmPassword.length > 0 && newPassword !== confirmPassword;

  const title = signedIn ? "Change Password" : "Forgot Password";
  const homeHref = signedIn ? "/recipes" : "/login";
  const homeLabel = signedIn ? "Return to app" : "Return to Log In";

  useEffect(() => {
    if (loading || bootstrapped) return;
    setBootstrapped(true);

    if (!user) {
      setStep({ kind: "email" });
      return;
    }

    if (isDemoAccount(user.email)) {
      setStep({ kind: "demoLocked", email: user.email });
      return;
    }

    const result = resolveRecoveryMethods(user.email);
    if (!result.ok) {
      setStep({ kind: "email" });
      setError(result.error);
      return;
    }

    enterMethods(result.email, result.name, result.methods);
  }, [loading, user, bootstrapped, resolveRecoveryMethods]);

  function enterMethods(
    email: string,
    name: string | undefined,
    methods: RecoveryMethod[],
  ) {
    if (methods.length === 1) {
      const method = methods[0];
      setStep({
        kind: "challenge",
        email,
        name,
        methods,
        method,
      });
      if (method === "email") {
        notifyEmailSent(email);
      } else if (method === "passkey") {
        void runPasskey(email, name, methods);
      }
      return;
    }
    setStep({ kind: "methods", email, name, methods });
  }

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
    enterMethods(result.email, result.name, result.methods);
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

  function handleCode(code: string) {
    if (step.kind !== "challenge") return;
    if (step.method === "authenticator") {
      advanceWithProof(step.email, step.name, step.methods, {
        method: "authenticator",
        code,
      });
      return;
    }
    if (step.method === "backup") {
      advanceWithProof(step.email, step.name, step.methods, {
        method: "backup",
        code,
      });
    }
  }

  function handlePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step.kind !== "password") return;
    if (passwordsMismatch) {
      setError("Passwords do not match.");
      return;
    }
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

  function backLink() {
    return (
      <Link
        href={homeHref}
        className="mt-2 flex items-center gap-1 self-start text-base font-bold text-brand"
      >
        <BackIcon className="size-4" /> {homeLabel}
      </Link>
    );
  }

  if (step.kind === "loading" || loading) {
    return (
      <AuthCard>
        <p className="w-full text-center text-muted">Loading…</p>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <LogoSlogan />
      <h1 className="w-full text-3xl font-bold text-brand">{title}</h1>

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
            Enter your email address to get started. You&rsquo;ll then choose
            your preferred verification method to confirm it&rsquo;s you.
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
            {signedIn ? (
              <>
                You&rsquo;re signed in as the demo account{" "}
                <span className="font-bold text-ink">{step.email}</span>. Its
                password can&rsquo;t be changed — create your own account to set
                a password.
              </>
            ) : (
              <>
                You&rsquo;re trying to reset the demo account{" "}
                <span className="font-bold text-ink">{step.email}</span>. Its
                password can&rsquo;t be changed — create your own account to set
                a password.
              </>
            )}
          </p>
          {!signedIn ? (
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
          ) : null}
          {backLink()}
        </div>
      ) : null}

      {step.kind === "methods" ? (
        <AuthMethodList
          methods={step.methods}
          busy={busy}
          error={error}
          heading={
            <>
              Hello,{" "}
              <span className="font-bold text-ink">
                {step.name ?? step.email}
              </span>
            </>
          }
          onPick={pickMethod}
        />
      ) : null}

      {step.kind === "challenge" ? (
        <AuthChallenge
          method={step.method}
          email={step.email}
          busy={busy}
          error={error}
          emailSent={emailSent}
          emailFallbackHint="To reset your password in this demo, use authenticator, passkey, or a backup code from Security settings."
          methodsCount={step.methods.length}
          onTryAnother={() => {
            setError(null);
            setEmailSent(false);
            setStep({
              kind: "methods",
              email: step.email,
              name: step.name,
              methods: step.methods,
            });
          }}
          onPasskey={() =>
            void runPasskey(step.email, step.name, step.methods)
          }
          onSubmitCode={handleCode}
        />
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
            invalid={passwordsMismatch}
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
            invalid={passwordsMismatch}
          />
          {passwordsMismatch ? (
            <p role="alert" className="text-sm font-bold text-brand">
              Passwords do not match.
            </p>
          ) : null}
          {error ? (
            <p role="alert" className="text-base font-bold text-brand">
              {error}
            </p>
          ) : null}
          <PrimaryButton>
            {busy
              ? "Updating…"
              : signedIn
                ? "Update Password"
                : "Reset Password"}
          </PrimaryButton>
        </form>
      ) : null}

      {step.kind === "done" ? (
        <div className="flex w-full flex-col gap-4">
          <p className="text-base text-muted">
            {signedIn
              ? "Your password has been updated."
              : "You're all set! Your password has been successfully changed, and you can now log in."}
          </p>
          <Link href={homeHref} className="btn-primary-lg mb-4 text-center">
            {signedIn ? "Return to app" : "Return to Log In"}
          </Link>
        </div>
      ) : step.kind !== "demoLocked" ? (
        backLink()
      ) : null}
    </AuthCard>
  );
}
