import Link from "next/link";
import type { ReactNode } from "react";

const primaryButtonClass =
  "flex w-full items-center justify-center rounded-[5px] bg-brand px-5 py-3 text-center text-2xl font-bold text-white shadow-md transition-colors hover:bg-[#e85557] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

/** Coral CTA rendered as a link (e.g. "Get Started"). */
export function PrimaryLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={primaryButtonClass}>
      {children}
    </Link>
  );
}

/** Coral CTA rendered as a form submit button. */
export function PrimaryButton({
  children,
  type = "submit",
}: {
  children: ReactNode;
  type?: "submit" | "button";
}) {
  return (
    <button type={type} className={primaryButtonClass}>
      {children}
    </button>
  );
}
