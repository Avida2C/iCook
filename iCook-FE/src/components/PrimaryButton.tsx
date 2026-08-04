import Link from "next/link";
import type { ReactNode } from "react";

/** Coral CTA rendered as a link (e.g. "Get Started"). */
export function PrimaryLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className="btn-primary-lg">
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
    <button type={type} className="btn-primary-lg">
      {children}
    </button>
  );
}
