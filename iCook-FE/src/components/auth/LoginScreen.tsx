"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthCard from "@/components/AuthCard";
import LogoSlogan from "@/components/LogoSlogan";
import TextField from "@/components/TextField";
import { PrimaryButton } from "@/components/PrimaryButton";
import SocialLogin from "@/components/SocialLogin";
import { useAuth, DEMO_CREDENTIALS } from "@/components/auth/AuthProvider";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const result = login(
      String(data.get("identifier") ?? ""),
      String(data.get("password") ?? ""),
    );
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push("/recipes");
  }

  return (
    <AuthCard>
      <LogoSlogan />
      <h1 className="w-full text-2xl font-bold text-brand">Log In</h1>

      <form
        className="flex w-full flex-col gap-[15px]"
        onSubmit={handleSubmit}
      >
        <TextField
          label="Username or Email Address"
          name="identifier"
          placeholder="username or email address"
          autoComplete="username"
          required
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          placeholder="password"
          autoComplete="current-password"
          required
        />
        <Link
          href="/forgot-password"
          className="w-full text-right text-xl font-bold text-muted transition-colors hover:text-brand"
        >
          Forgot Password?
        </Link>
        {error ? (
          <p role="alert" className="text-base font-bold text-brand">
            {error}
          </p>
        ) : null}
        <PrimaryButton>Log In</PrimaryButton>
      </form>

      <p className="w-full rounded-[4px] bg-[#f6f7fa] px-3 py-2 text-center text-sm text-muted">
        Demo account — {DEMO_CREDENTIALS.email} / {DEMO_CREDENTIALS.password}
      </p>

      <SocialLogin label="Log In with" />

      <div className="flex w-full flex-col items-end gap-1 text-right">
        <p className="text-base text-muted">Don&rsquo;t have an account?</p>
        <Link
          href="/signup"
          className="text-xl font-bold text-brand hover:underline"
        >
          Sign Up!
        </Link>
      </div>
    </AuthCard>
  );
}
