"use client";

import { useState } from "react";
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
  useAuth,
  DEMO_CREDENTIALS,
  type LoginMethod,
} from "@/components/auth/AuthProvider";
import {
  KeyIcon,
  ShieldIcon,
  SmartphoneIcon,
  BackIcon,
} from "@/components/app/icons";

type Step =
  | { kind: "identifier" }
  | { kind: "methods"; email: string; name?: string; methods: LoginMethod[] }
  | {
      kind: "challenge";
      email: string;
      name?: string;
      methods: LoginMethod[];
      method: LoginMethod;
    };

const METHOD_META: Record<
  LoginMethod,
  { label: string; hint: string; icon: React.ReactNode }
> = {
  password: {
    label: "Password",
    hint: "Use your account password",
    icon: <KeyIcon className="size-5" />,
  },
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
};

export default function LoginScreen() {
  const router = useRouter();
  const {
    resolveLoginMethods,
    loginWithPassword,
    loginWithAuthenticator,
    loginWithBackupCode,
    loginWithPasskey,
  } = useAuth();

  const [step, setStep] = useState<Step>({ kind: "identifier" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [preparing, setPreparing] = useState(false);

  async function succeed() {
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
      await succeed();
    } finally {
      setBusy(false);
    }
  }

  async function handleChallenge(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step.kind !== "challenge") return;
    setError(null);
    setBusy(true);
    const data = new FormData(event.currentTarget);

    try {
      let result;
      if (step.method === "password") {
        result = loginWithPassword(
          step.email,
          String(data.get("password") ?? ""),
        );
      } else if (step.method === "authenticator") {
        result = loginWithAuthenticator(
          step.email,
          String(data.get("code") ?? ""),
        );
      } else if (step.method === "backup") {
        result = loginWithBackupCode(
          step.email,
          String(data.get("code") ?? ""),
        );
      } else {
        result = await loginWithPasskey(step.email);
      }

      if (!result.ok) {
        setError(result.error);
        return;
      }
      await succeed();
    } finally {
      setBusy(false);
    }
  }

  function goBack() {
    setError(null);
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

  return (
    <>
      {preparing ? <GettingAppReady /> : null}
      <AuthCard>
      <LogoSlogan />
      <h1 className="w-full text-3xl font-bold text-brand">Log In</h1>

      {step.kind !== "identifier" ? (
        <button
          type="button"
          onClick={goBack}
          className="flex items-center gap-1 self-start text-sm font-bold text-muted"
        >
          <BackIcon className="size-4" /> Back
        </button>
      ) : null}

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
        <div className="flex w-full flex-col gap-3">
          <p className="text-base text-muted">
            Sign in as{" "}
            <span className="font-bold text-ink">
              {step.name ?? step.email}
            </span>
          </p>
          <p className="text-sm text-muted">
            Choose how you want to sign in. Methods come from your Security
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
                onClick={() => void runPasskey(step.email)}
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
              onSubmit={handleChallenge}
            >
              {step.method === "password" ? (
                <TextField
                  label="Password"
                  name="password"
                  type="password"
                  placeholder="password"
                  autoComplete="current-password"
                  required
                />
              ) : (
                <TextField
                  label={
                    step.method === "authenticator"
                      ? "Authentication code"
                      : "Backup code"
                  }
                  name="code"
                  placeholder={
                    step.method === "authenticator"
                      ? "6-digit code"
                      : "XXXX-XXXX"
                  }
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
                {busy ? "Signing in…" : "Log In"}
              </PrimaryButton>
            </form>
          )}

          {step.methods.length > 1 ? (
            <button
              type="button"
              onClick={() => {
                setError(null);
                setStep({
                  kind: "methods",
                  email: step.email,
                  name: step.name,
                  methods: step.methods,
                });
              }}
              className="text-sm font-bold text-brand"
            >
              Try another method
            </button>
          ) : null}
        </div>
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
    </>
  );
}
