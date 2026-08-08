import type { ReactNode } from "react";
import PhoneFrame from "@/components/PhoneFrame";

/**
 * Shared shell for the auth screens (Get Started, Sign Up, Log In, Forgot
 * Password). Renders the brand gradient with a white card whose rounded
 * top-right corner lets the gradient peek through, matching the Figma design.
 * On desktop the screen sits inside a phone device frame.
 */
export default function AuthCard({
  children,
  overlay,
}: {
  children: ReactNode;
  overlay?: ReactNode;
}) {
  return (
    <PhoneFrame chrome="clear">
      <main className="relative flex h-full min-h-0 w-full flex-col bg-[linear-gradient(87.99deg,var(--brand)_39.02%,var(--brand-soft)_94.45%)] sm:-mt-11 sm:-mb-5 sm:pt-11 sm:pb-5">
        <section className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto rounded-tr-[120px] bg-surface px-5 pt-12 pb-8 font-nunito">
          {children}
        </section>
        {overlay}
      </main>
    </PhoneFrame>
  );
}
