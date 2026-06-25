import Link from "next/link";
import AuthCard from "@/components/AuthCard";
import LogoSlogan from "@/components/LogoSlogan";
import { PrimaryLink } from "@/components/PrimaryButton";

const features = [
  { icon: "🍲", text: "Discover thousands of recipes." },
  { icon: "🧑‍🍳", text: "Learn new techniques with step-by-step guides." },
  { icon: "📝", text: "Save and organize your favourite recipes." },
];

export default function GetStartedScreen() {
  return (
    <AuthCard>
      <LogoSlogan />

      {/* Features */}
      <div className="flex flex-1 flex-col justify-between gap-5 text-base leading-normal text-muted">
        <p>
          Unlock gourmet recipes, expert tips, and fresh ideas to elevate your
          home kitchen.
        </p>
        <p>
          From weeknight dinners to special celebrations, we&rsquo;re here to
          inspire your culinary creativity.
        </p>
        <p>Let&rsquo;s make every meal unforgettable!</p>

        <ul className="flex flex-col gap-4">
          {features.map((feature) => (
            <li key={feature.text} className="flex items-start gap-2.5">
              <span aria-hidden className="leading-normal">
                {feature.icon}
              </span>
              <span>{feature.text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Primary CTA */}
      <PrimaryLink href="/signup">Get Started</PrimaryLink>

      {/* Login */}
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
