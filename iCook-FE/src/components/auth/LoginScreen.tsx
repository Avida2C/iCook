"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthCard from "@/components/AuthCard";
import LogoSlogan from "@/components/LogoSlogan";
import TextField from "@/components/TextField";
import { PrimaryButton } from "@/components/PrimaryButton";
import SocialLogin from "@/components/SocialLogin";
import GettingAppReady, {
  waitForAppReady,
} from "@/components/auth/GettingAppReady";
import {
  AuthChallenge,
  AuthMethodList,
} from "@/components/auth/AuthVerify";
import {
  useAuth,
  DEMO_CREDENTIALS,
  type LoginMethod,
} from "@/components/auth/AuthProvider";
import { BackIcon } from "@/components/app/icons";

type Step =
  | { kind: "identifier" }
  | { kind: "methods"; email: string; name?: string; methods: LoginMethod[] }
  | {
      kind: "challenge";
      email: string;
      name?: string;
      methods: LoginMethod[];
      method: LoginMethod;
    }
  | {
      kind: "emailCode";
      email: string;
      name?: string;
      methods: LoginMethod[];
      demoCode: string;
    };

export default function LoginScreen() {
  const router = useRouter();
  const {
    resolveLoginMethods,
    loginWithPassword,
    resendLoginEmailCode,
    confirmLoginEmailCode,
    loginWithAuthenticator,
    loginWithBackupCode,
    loginWithPasskey,
    getPendingDeletion,
  } = useAuth();

  const [step, setStep] = useState<Step>({ kind: "identifier" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [preparing, setPreparing] = useState(false);

  useEffect(() => {
    if (getPendingDeletion()) {
      router.replace("/restore-account");
    }
  }, [getPendingDeletion, router]);

  async function succeed(pendingRestore?: boolean) {
    if (pendingRestore || getPendingDeletion()) {
      router.push("/restore-account");
      return;
    }
    setPreparing(true);
    await waitForAppReady();
    router.push("/recipes");
  }

  function handleIdentifier(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const data = new FormData(event.currentTarget);
    const id = String(data.get("identifier") ?? "");
    const result = resolveLoginMethods(id);
    if (!result.ok) {
      setError(result.error);
      return;
    }

    if (result.methods.length === 1) {
      setStep({
        kind: "challenge",
        email: result.email,
        name: result.name,
        methods: result.methods,
        method: result.methods[0],
      });
      return;
    }

    setStep({
      kind: "methods",
      email: result.email,
      name: result.name,
      methods: result.methods,
    });
  }

  async function runPasskey(email: string) {
    setBusy(true);
    setError(null);
    try {
      const result = await loginWithPasskey(email);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      await succeed(result.pendingRestore);
    } finally {
      setBusy(false);
    }
  }

  async function submitPassword(password: string) {
    if (step.kind !== "challenge") return;
    setError(null);
    setBusy(true);
    try {
      const result = loginWithPassword(step.email, password);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setStep({
        kind: "emailCode",
        email: result.email,
        name: step.name,
        methods: step.methods,
        demoCode: result.demoCode,
      });
    } finally {
      setBusy(false);
    }
  }

  async function submitCode(code: string) {
    if (step.kind !== "challenge") return;
    setError(null);
    setBusy(true);
    try {
      let result;
      if (step.method === "authenticator") {
        result = loginWithAuthenticator(step.email, code);
      } else if (step.method === "backup") {
        result = loginWithBackupCode(step.email, code);
      } else {
        return;
      }
      if (!result.ok) {
        setError(result.error);
        return;
      }
      await succeed(result.pendingRestore);
    } finally {
      setBusy(false);
    }
  }

  async function handleEmailCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step.kind !== "emailCode") return;
    setError(null);
    setBusy(true);
    const data = new FormData(event.currentTarget);
    try {
      const result = confirmLoginEmailCode(
        step.email,
        String(data.get("code") ?? ""),
      );
      if (!result.ok) {
        setError(result.error);
        return;
      }
      await succeed(result.pendingRestore);
    } finally {
      setBusy(false);
    }
  }

  function resendCode() {
    if (step.kind !== "emailCode") return;
    setError(null);
    const result = resendLoginEmailCode(step.email);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setStep({ ...step, demoCode: result.demoCode });
  }

  function goBack() {
    setError(null);
    if (step.kind === "emailCode") {
      setStep({
        kind: "challenge",
        email: step.email,
        name: step.name,
        methods: step.methods,
        method: "password",
      });
      return;
    }
    if (step.kind === "challenge" && step.methods.length > 1) {
      setStep({
        kind: "methods",
        email: step.email,
        name: step.name,
        methods: step.methods,
      });
      return;
    }
    setStep({ kind: "identifier" });
  }

  function pickMethod(method: LoginMethod) {
    if (step.kind !== "methods") return;
    setError(null);
    setStep({
      kind: "challenge",
      email: step.email,
      name: step.name,
      methods: step.methods,
      method,
    });
    if (method === "passkey") {
      void runPasskey(step.email);
    }
  }

  function backToMethods() {
    if (step.kind !== "challenge" && step.kind !== "emailCode") return;
    setError(null);
    setStep({
      kind: "methods",
      email: step.email,
      name: step.name,
      methods: step.methods,
    });
  }

  return (
    <AuthCard overlay={preparing ? <GettingAppReady /> : null}>
      <LogoSlogan />
      <h1 className="w-full text-3xl font-bold text-brand">Log In</h1>

      {step.kind === "identifier" ? (
        <form className="flex w-full flex-col gap-4" onSubmit={handleIdentifier}>
          <TextField
            label="Username or Email Address"
            name="identifier"
            placeholder="username or email address"
            autoComplete="username"
            required
          />
          <Link
            href="/forgot-password"
            className="w-full text-right text-base font-bold text-brand"
          >
            Forgot Password?
          </Link>
          {error ? (
            <p role="alert" className="text-base font-bold text-brand">
              {error}
            </p>
          ) : null}
          <PrimaryButton>Continue</PrimaryButton>
        </form>
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
          passwordHint="After your password is verified, we’ll email a code to confirm it’s you."
          submitLabel={
            busy
              ? "Checking…"
              : step.method === "password"
                ? "Continue"
                : "Log In"
          }
          methodsCount={step.methods.length}
          onTryAnother={backToMethods}
          onPasskey={() => void runPasskey(step.email)}
          onSubmitCode={(code) => void submitCode(code)}
          onSubmitPassword={(password) => void submitPassword(password)}
        />
      ) : null}

      {step.kind === "emailCode" ? (
        <form
          className="flex w-full flex-col gap-4"
          onSubmit={(e) => void handleEmailCode(e)}
        >
          <p className="text-base text-muted">
            Email verification ·{" "}
            <span className="font-bold text-ink">{step.email}</span>
          </p>
          <p className="text-sm text-muted">
            Enter the 6-digit code we sent to your email to finish signing in.
          </p>
          <p className="rounded border border-line bg-app px-3 py-2 text-sm text-muted">
            Email delivery isn’t connected in this local build. Your code is{" "}
            <span className="font-bold text-ink">{step.demoCode}</span> (expires
            in 10 minutes).
          </p>
          <TextField
            label="Verification code"
            name="code"
            placeholder="6-digit code"
            autoComplete="one-time-code"
            required
          />
          {error ? (
            <p role="alert" className="text-base font-bold text-brand">
              {error}
            </p>
          ) : null}
          <PrimaryButton>{busy ? "Signing in…" : "Log In"}</PrimaryButton>
          <button
            type="button"
            onClick={resendCode}
            className="text-sm font-bold text-brand self-start"
          >
            Resend code
          </button>
          {step.methods.length > 1 ? (
            <button
              type="button"
              onClick={backToMethods}
              className="text-sm font-bold text-brand self-start"
            >
              Try another method
            </button>
          ) : null}
        </form>
      ) : null}

      {step.kind !== "identifier" ? (
        <button
          type="button"
          onClick={goBack}
          className="flex items-center mt-4 gap-1 self-start text-sm font-bold text-muted"
        >
          <BackIcon className="size-4" /> Return To Login
        </button>
      ) : null}
      {step.kind === "identifier" ? (
        <>
          <p className="mb-6 w-full rounded-sm bg-app px-3 py-2 text-center text-sm text-muted">
            Demo account — {DEMO_CREDENTIALS.email} /{" "}
            {DEMO_CREDENTIALS.password}
          </p>
          <SocialLogin label="Log In with" />
          <div className="flex w-full flex-col items-end text-right">
            <p className="text-sm text-muted">Don&rsquo;t have an account?</p>
            <Link href="/signup" className="text-xl font-bold text-brand">
              Sign Up!
            </Link>
          </div>
        </>
      ) : null}
    </AuthCard>
  );
}
