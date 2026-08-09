"use client";

import type { ReactNode } from "react";
import TextField from "@/components/TextField";
import { PrimaryButton } from "@/components/PrimaryButton";
import {
  KeyIcon,
  MailIcon,
  ShieldIcon,
  SmartphoneIcon,
} from "@/components/app/icons";

/** All methods that appear in method lists / challenges across auth screens. */
export type AuthVerifyMethod =
  | "password"
  | "passkey"
  | "authenticator"
  | "backup"
  | "email";

export const AUTH_METHOD_META: Record<
  AuthVerifyMethod,
  { label: string; hint: string; icon: ReactNode }
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
  email: {
    label: "Authenticate via Email",
    hint: "Send a one-time code to your email",
    icon: <MailIcon className="size-5" />,
  },
};

type AuthMethodListProps<T extends AuthVerifyMethod> = {
  methods: T[];
  busy?: boolean;
  error?: string | null;
  heading: ReactNode;
  hint?: string;
  onPick: (method: T) => void;
};

export function AuthMethodList<T extends AuthVerifyMethod>({
  methods,
  busy = false,
  error,
  heading,
  hint = "Choose your preferred method of verification.",
  onPick,
}: AuthMethodListProps<T>) {
  return (
    <div className="flex w-full flex-col gap-3">
      <p className="text-base text-muted">{heading}</p>
      {hint ? <p className="text-sm text-muted">{hint}</p> : null}
      <ul className="flex flex-col gap-2">
        {methods.map((method) => {
          const meta = AUTH_METHOD_META[method];
          return (
            <li key={method}>
              <button
                type="button"
                disabled={busy}
                onClick={() => onPick(method)}
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
  );
}

type AuthChallengeProps = {
  method: AuthVerifyMethod;
  email: string;
  busy?: boolean;
  error?: string | null;
  /** Shown under the method title (defaults to the email). */
  subtitle?: ReactNode;
  emailSent?: boolean;
  /** Extra copy when the email method can’t complete locally. */
  emailFallbackHint?: string;
  passwordHint?: string;
  submitLabel?: string;
  methodsCount?: number;
  onTryAnother?: () => void;
  onPasskey: () => void;
  /** authenticator / backup code submit */
  onSubmitCode?: (code: string) => void;
  /** password login submit */
  onSubmitPassword?: (password: string) => void;
};

export function AuthChallenge({
  method,
  email,
  busy = false,
  error,
  subtitle,
  emailSent = false,
  emailFallbackHint = "To continue in this demo, use authenticator, passkey, or a backup code from Security settings.",
  passwordHint,
  submitLabel,
  methodsCount = 1,
  onTryAnother,
  onPasskey,
  onSubmitCode,
  onSubmitPassword,
}: AuthChallengeProps) {
  const meta = AUTH_METHOD_META[method];
  const resolvedSubmit =
    submitLabel ??
    (busy
      ? "Checking…"
      : method === "password"
        ? "Continue"
        : "Continue");

  function handleForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (method === "password") {
      onSubmitPassword?.(String(data.get("password") ?? ""));
      return;
    }
    if (method === "authenticator" || method === "backup") {
      onSubmitCode?.(String(data.get("code") ?? ""));
    }
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <p className="text-base text-muted">
        {meta.label} ·{" "}
        {subtitle ?? <span className="font-bold text-ink">{email}</span>}
      </p>

      {method === "passkey" ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted">
            Use your device biometrics or security key to continue.
          </p>
          <button
            type="button"
            disabled={busy}
            onClick={onPasskey}
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
      ) : method === "email" ? (
        <div className="flex w-full flex-col gap-4">
          <p className="text-sm text-muted">
            {emailSent ? (
              <>
                If an account exists for{" "}
                <span className="font-bold text-ink">{email}</span>, a
                verification message would be sent there. Email delivery
                isn&rsquo;t connected in this local build, so this method
                can&rsquo;t finish here.
              </>
            ) : (
              "Sending verification email…"
            )}
          </p>
          <p className="text-sm text-muted">{emailFallbackHint}</p>
          {error ? (
            <p role="alert" className="text-base font-bold text-brand">
              {error}
            </p>
          ) : null}
        </div>
      ) : (
        <form className="flex w-full flex-col gap-4" onSubmit={handleForm}>
          {method === "password" ? (
            <>
              <TextField
                label="Password"
                name="password"
                type="password"
                placeholder="password"
                autoComplete="current-password"
                required
              />
              {passwordHint ? (
                <p className="text-sm text-muted">{passwordHint}</p>
              ) : null}
            </>
          ) : (
            <TextField
              label={
                method === "authenticator" ? "Authentication code" : "Backup code"
              }
              name="code"
              placeholder={
                method === "authenticator" ? "6-digit code" : "XXXX-XXXX"
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
          <PrimaryButton>{resolvedSubmit}</PrimaryButton>
        </form>
      )}

      {methodsCount > 1 && onTryAnother ? (
        <button
          type="button"
          onClick={onTryAnother}
          className="text-sm font-bold text-brand self-start"
        >
          Try another method
        </button>
      ) : null}
    </div>
  );
}
