"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthCard from "@/components/AuthCard";
import LogoSlogan from "@/components/LogoSlogan";
import TextField from "@/components/TextField";
import { PrimaryButton } from "@/components/PrimaryButton";
import SocialLogin from "@/components/SocialLogin";
import { useAuth } from "@/components/auth/AuthProvider";

export default function SignUpScreen() {
  const router = useRouter();
  const { signup } = useAuth();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const result = signup(String(data.get("email") ?? ""));
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push("/recipes");
  }

  return (
    <AuthCard>
      <LogoSlogan />
      <h1 className="w-full text-2xl font-bold text-brand">Sign Up</h1>

      <form
        className="flex w-full flex-col gap-[15px]"
        onSubmit={handleSubmit}
      >
        <TextField
          label="Email Address"
          name="email"
          type="email"
          placeholder="email address"
          autoComplete="email"
          required
        />
        <p className="text-base text-[#292929]">
          By clicking Sign Up, you agree to our Terms and Conditions and that you
          have read our Privacy Policy.
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
        <p className="text-base text-muted">Already have an account?</p>
        <Link
          href="/login"
          className="text-xl font-bold text-brand hover:underline"
        >
          Log In!
        </Link>
      </div>
    </AuthCard>
  );
}
