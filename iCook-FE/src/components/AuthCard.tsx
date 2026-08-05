import type { ReactNode } from "react";

/**
 * Shared shell for the auth screens (Get Started, Sign Up, Log In, Forgot
 * Password). Renders the brand gradient with a white card whose rounded
 * top-right corner lets the gradient peek through, matching the Figma design.
 */
export default function AuthCard({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-dvh w-full items-stretch justify-center bg-[linear-gradient(87.99deg,var(--brand)_39.02%,var(--brand-soft)_94.45%)] sm:items-center sm:p-6">
      <section className="flex w-full max-w-[400px] flex-col gap-1 overflow-y-auto rounded-tr-[120px] bg-surface px-5 pt-12 pb-8 font-nunito shadow-xl sm:min-h-[760px] sm:rounded-2xl sm:rounded-tr-[120px]">
        {children}
      </section>
    </main>
  );
}
