import Link from "next/link";
import AuthCard from "@/components/AuthCard";
import LogoSlogan from "@/components/LogoSlogan";
import { PrimaryLink } from "@/components/PrimaryButton";
import { EggFried, ChefHat, CookingPot } from "../app/icons";

const features = [
  { icon: EggFried, text: "Discover thousands of recipes." },
  { icon: CookingPot, text: "Learn new techniques with step-by-step guides." },
  { icon: ChefHat, text: "Save and organize your favourite recipes." },
];

export default function GetStartedScreen() {
  return (
    <AuthCard>
      <LogoSlogan />

      {/* Features */}
      <div className="auth-copy flex flex-1 flex-col gap-2 text-sm leading-5 text-muted">
        <p>
          Unlock gourmet recipes, expert tips, and fresh ideas to elevate your
          home kitchen.
        </p>
        <p>
          From weeknight dinners to special celebrations, we&rsquo;re here to
          inspire your culinary creativity.
        </p>
        <p>Let&rsquo;s make every meal unforgettable!</p>

        <ul className="flex flex-col gap-5 pt-5">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <li key={feature.text} className="flex items-start gap-2.5">
                <span aria-hidden className="flex items-center leading-normal">
                  <Icon className="text-xl text-brand" />
                </span>
                <span>{feature.text}</span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Primary CTA */}
      <PrimaryLink href="/signup">Get Started</PrimaryLink>

      {/* Login */}
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
  );
}
