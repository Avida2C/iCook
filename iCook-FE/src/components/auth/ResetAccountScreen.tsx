"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthCard from "@/components/AuthCard";
import LogoSlogan from "@/components/LogoSlogan";
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
  | { kind: "demoLocked" }
  | { kind: "methods"; methods: RecoveryMethod[] }
  | {
      kind: "challenge";
      methods: RecoveryMethod[];
      method: RecoveryMethod;
    }
  | { kind: "confirm"; methods: RecoveryMethod[]; proof: RecoveryProof }
  | { kind: "done" };

export default function ResetAccountScreen() {
  const router = useRouter();
  const {
    user,
    loading,
    getReauthMethods,
    confirmPasskeyReauth,
    sendRecoveryEmailCode,
    validateRecoveryProof,
    resetAccount,
  } = useAuth();

  const [step, setStep] = useState<Step>({ kind: "loading" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (bootstrapped) return;
    setBootstrapped(true);

    if (isDemoAccount(user.email)) {
      setStep({ kind: "demoLocked" });
      return;
    }

    const methods = getReauthMethods();
    if (methods.length === 0) {
      setError(
        "Set up a passkey, authenticator, or backup codes in Security before resetting your account.",
      );
      setStep({ kind: "methods", methods: [] });
      return;
    }
    enterMethods(methods);
  }, [loading, user, bootstrapped, getReauthMethods, router]);

  function enterMethods(methods: RecoveryMethod[]) {
    if (methods.length === 1) {
      const method = methods[0];
      setStep({ kind: "challenge", methods, method });
      if (method === "email") {
        notifyEmailSent();
      } else if (method === "passkey") {
        void runPasskey(methods);
      }
      return;
    }
    setStep({ kind: "methods", methods });
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

  function advanceWithProof(methods: RecoveryMethod[], proof: RecoveryProof) {
    if (!user?.email) return;
    const validated = validateRecoveryProof(user.email, proof);
    if (!validated.ok) {
      setError(validated.error);
      return;
    }
    setError(null);
    setStep({ kind: "confirm", methods, proof });
  }

  async function runPasskey(methods: RecoveryMethod[]) {
    setBusy(true);
    setError(null);
    try {
      const confirmed = await confirmPasskeyReauth();
      if (!confirmed.ok) {
        setError(confirmed.error);
        return;
      }
      advanceWithProof(methods, confirmed.proof);
    } finally {
      setBusy(false);
    }
  }

  function pickMethod(method: RecoveryMethod) {
    if (step.kind !== "methods") return;
    setError(null);
    setEmailSent(false);
    setStep({ kind: "challenge", methods: step.methods, method });
    if (method === "passkey") {
      void runPasskey(step.methods);
    } else if (method === "email") {
      notifyEmailSent();
    }
  }

  function handleCode(code: string) {
    if (step.kind !== "challenge") return;
    if (step.method === "authenticator") {
      advanceWithProof(step.methods, { method: "authenticator", code });
      return;
    }
    if (step.method === "backup") {
      advanceWithProof(step.methods, { method: "backup", code });
    }
  }

  function handleConfirm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step.kind !== "confirm") return;
    setError(null);
    setBusy(true);
    try {
      const result = resetAccount(step.proof);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setStep({ kind: "done" });
    } finally {
      setBusy(false);
    }
  }

  function finish() {
    // Reload so providers re-read empty localStorage.
    window.location.assign("/recipes");
  }

  function backToMethods(methods: RecoveryMethod[]) {
    setError(null);
    setEmailSent(false);
    setStep({ kind: "methods", methods });
  }

  if (loading || step.kind === "loading" || !user) {
    return (
      <AuthCard>
        <p className="w-full text-center text-muted">Loading…</p>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <LogoSlogan />
      <h1 className="w-full text-3xl font-bold text-brand">Reset Account</h1>

      {step.kind === "demoLocked" ? (
        <div className="flex w-full flex-col gap-4">
          <p className="text-base text-muted">
            You&rsquo;re signed in as the demo account{" "}
            <span className="font-bold text-ink">{user.email}</span>. It
            can&rsquo;t be reset — create your own account to clear account
            data.
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
          {step.kind === "methods" ? (
            <AuthMethodList
              methods={step.methods}
              busy={busy}
              error={error}
              heading={
                <>
                  Confirm it&rsquo;s you,{" "}
                  <span className="font-bold text-ink">
                    {user.name || user.email}
                  </span>
                </>
              }
              onPick={pickMethod}
            />
          ) : null}

          {step.kind === "challenge" ? (
            <AuthChallenge
              method={step.method}
              email={user.email}
              busy={busy}
              error={error}
              emailSent={emailSent}
              emailFallbackHint="To reset your account in this demo, use authenticator, passkey, or a backup code from Security settings."
              methodsCount={step.methods.length}
              onTryAnother={() => backToMethods(step.methods)}
              onPasskey={() => void runPasskey(step.methods)}
              onSubmitCode={handleCode}
            />
          ) : null}

          {step.kind === "confirm" ? (
            <form
              className="flex w-full flex-col gap-4"
              onSubmit={handleConfirm}
            >
              <p className="text-base text-muted">
                This clears your activity, recipes, saved items, followers,
                following, pantry, posts, and likes. Your email, username,
                password, and security settings stay the same.
              </p>
              {error ? (
                <p role="alert" className="text-base font-bold text-brand">
                  {error}
                </p>
              ) : null}
              <PrimaryButton>
                {busy ? "Resetting…" : "Reset account"}
              </PrimaryButton>
              {step.methods.length > 1 ? (
                <button
                  type="button"
                  onClick={() => backToMethods(step.methods)}
                  className="self-start text-sm font-bold text-brand"
                >
                  Try another method
                </button>
              ) : null}
            </form>
          ) : null}

          {step.kind === "done" ? (
            <div className="flex w-full flex-col gap-4">
              <p className="text-base text-muted">
                Your account data has been cleared. You can keep using iCook
                with the same login.
              </p>
              <button
                type="button"
                onClick={finish}
                className="btn-primary-lg mb-4 text-center"
              >
                Return to app
              </button>
            </div>
          ) : (
            <Link
              href="/settings/user"
              className="mt-2 flex items-center gap-1 self-start text-base font-bold text-brand"
            >
              <BackIcon className="size-4" /> Back to User Details
            </Link>
          )}
        </>
      )}
    </AuthCard>
  );
}
