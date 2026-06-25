"use client";

import Link from "next/link";
import AuthCard from "@/components/AuthCard";
import LogoSlogan from "@/components/LogoSlogan";
import TextField from "@/components/TextField";
import { PrimaryButton } from "@/components/PrimaryButton";

export default function ForgotPasswordScreen() {
  return (
    <AuthCard>
      <LogoSlogan />
      <h1 className="w-full text-2xl font-bold text-brand">Forgot Password</h1>

      <p className="w-full text-base text-muted">
        Enter your email address and we will send you a link to get back into
        your account.
      </p>

      <form
        className="flex w-full flex-col gap-[25px]"
        onSubmit={(event) => event.preventDefault()}
      >
        <TextField
          label="Email Address"
          name="email"
          type="email"
          placeholder="email address"
          autoComplete="email"
          required
        />
        <PrimaryButton>Send</PrimaryButton>
      </form>

      <Link
        href="/login"
        className="w-full text-right text-base font-bold text-muted transition-colors hover:text-brand"
      >
        Back to Log In
      </Link>
    </AuthCard>
  );
}
