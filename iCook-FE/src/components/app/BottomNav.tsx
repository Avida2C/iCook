"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  RecipesIcon,
  DiscoverIcon,
  CreateIcon,
  HubIcon,
  UserIcon,
} from "@/components/app/icons";

const tabs = [
  { href: "/recipes", label: "RECIPES", Icon: RecipesIcon },
  { href: "/discover", label: "DISCOVER", Icon: DiscoverIcon },
  { href: "/create", label: "CREATE", Icon: CreateIcon },
  { href: "/hub", label: "HUB", Icon: HubIcon },
  { href: "/user", label: "USER", Icon: UserIcon },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="flex shrink-0 items-stretch bg-white shadow-[0_-1px_4px_rgba(12,12,13,0.08)]">
      {tabs.map(({ href, label, Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex flex-1 flex-col items-center justify-center gap-1 py-2 transition-colors ${
              active ? "text-brand" : "text-[#1a1a1a]"
            }`}
          >
            <Icon className="size-6" />
            <span className="text-[12px] font-semibold">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
