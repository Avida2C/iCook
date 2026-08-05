"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthCard from "@/components/AuthCard";
import LogoSlogan from "@/components/LogoSlogan";
import TextField from "@/components/TextField";
import { PrimaryButton } from "@/components/PrimaryButton";
import SocialLogin from "@/components/SocialLogin";
import AvatarPicker from "@/components/AvatarPicker";
import GettingAppReady, {
  waitForAppReady,
} from "@/components/auth/GettingAppReady";
import { useAuth } from "@/components/auth/AuthProvider";
import { initialsFromName, normalizeUsername } from "@/lib/username";

export default function SignUpScreen() {
  const router = useRouter();
  const { signup } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const previewInitials = useMemo(
    () => initialsFromName(firstName, lastName),
    [firstName, lastName],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const data = new FormData(event.currentTarget);
    const result = signup({
      email: String(data.get("email") ?? ""),
      username: String(data.get("username") ?? ""),
      firstName: String(data.get("firstName") ?? ""),
      lastName: String(data.get("lastName") ?? ""),
      password: String(data.get("password") ?? ""),
      confirmPassword: String(data.get("confirmPassword") ?? ""),
      avatarUrl: avatarUrl ?? undefined,
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setPreparing(true);
    await waitForAppReady();
    router.push("/recipes");
  }

  return (
    <>
      {preparing ? <GettingAppReady /> : null}
      <AuthCard>
        <LogoSlogan />
        <h1 className="w-full text-2xl font-bold text-brand">Sign Up</h1>

        <form
          className="flex w-full flex-col gap-[15px]"
          onSubmit={(e) => void handleSubmit(e)}
        >

          <div className="flex w-full gap-2.5">
            <div className="min-w-0 flex-1">
              <TextField
                label="First name"
                name="firstName"
                type="text"
                placeholder="First name"
                autoComplete="given-name"
                required
                value={firstName}
                onChange={setFirstName}
              />
            </div>
            <div className="min-w-0 flex-1">
              <TextField
                label="Last name"
                name="lastName"
                type="text"
                placeholder="Last name"
                autoComplete="family-name"
                required
                value={lastName}
                onChange={setLastName}
              />
            </div>
          </div>

          <div className="flex w-full flex-col gap-1">
            <label
              htmlFor="username"
              className="text-base font-semibold text-muted"
            >
              Username
            </label>
            <div className="field flex items-center gap-0.5 py-0">
              <span className="shrink-0 text-brand-soft" aria-hidden>
                @
              </span>
              <input
                id="username"
                name="username"
                type="text"
                inputMode="text"
                autoComplete="username"
                placeholder="username"
                required
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value.replace(/^@+/, ""))
                }
                pattern="[A-Za-z0-9_]{3,30}"
                title="3–30 characters: letters, numbers, or underscores"
                className="min-w-0 flex-1 border-0 bg-transparent py-2.5 text-base text-ink outline-none placeholder:text-muted"
              />
            </div>
            <p className="text-xs text-muted">
              Your @username can’t be changed later.
            </p>
          </div>

          <TextField
            label="Email Address"
            name="email"
            type="email"
            placeholder="email address"
            autoComplete="email"
            required
          />

          <TextField
            label="Password"
            name="password"
            type="password"
            placeholder="at least 8 characters"
            autoComplete="new-password"
            required
          />

          <TextField
            label="Confirm password"
            name="confirmPassword"
            type="password"
            placeholder="confirm password"
            autoComplete="new-password"
            required
          />

          <p className="auth-copy text-xs text-muted">
            By clicking Sign Up, you agree to our{" "}
            <Link href="/terms" className="font-bold text-brand">
              Terms and Conditions
            </Link>{" "}
            and that you have read our{" "}
            <Link href="/privacy" className="font-bold text-brand">
              Privacy Policy
            </Link>
            .
          </p>
          {error ? (
            <p role="alert" className="text-base font-bold text-brand">
              {error}
            </p>
          ) : null}
          <PrimaryButton>Sign Up</PrimaryButton>
        </form>

        <SocialLogin label="Sign up with" />

        <div className="flex w-full flex-col items-end gap-1 text-right">
          <p className="text-sm text-muted">Already have an account?</p>
          <Link
            href="/login"
            className="text-xl font-bold text-brand hover:underline"
          >
            Log In!
          </Link>
        </div>
      </AuthCard>
    </>
  );
}
