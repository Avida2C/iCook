"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Tab = {
  href?: string;
  label: string;
  icon: string;
  /** Leaf sizing that preserves each Figma icon's designed aspect ratio inside the 30×30 frame. */
  leafClassName: string;
  /** Opens the More settings drawer instead of navigating. */
  more?: boolean;
};

const tabs: Tab[] = [
  {
    href: "/user",
    label: "Me",
    icon: "/icons/nav/me.svg",
    leafClassName: "h-[22px] w-full",
  },
  {
    href: "/discover",
    label: "Discover",
    icon: "/icons/nav/discover.svg",
    leafClassName: "size-full",
  },
  {
    href: "/recipes",
    label: "Recipes",
    icon: "/icons/nav/recipes.svg",
    leafClassName: "aspect-[16.5/20] h-full",
  },
  {
    href: "/hub",
    label: "Pantry",
    icon: "/icons/nav/pantry.svg",
    leafClassName: "aspect-[16.33/23.33] h-full",
  },
  {
    more: true,
    label: "More",
    icon: "/icons/nav/more.svg",
    leafClassName: "aspect-[13/3] w-full",
  },
];

const itemClass =
  "flex min-w-0 flex-1 flex-col items-center justify-end gap-1 overflow-hidden pb-2 pt-1";

/** Detail / drill-in routes that should not highlight any primary bottom-nav tab. */
const NEUTRAL_PATHS = [
  /^\/recipe(\/|$)/,
  /^\/post(\/|$)/,
  /^\/recipes\/more(\/|$)/,
  /^\/plan(\/|$)/,
];

function isNeutralPath(pathname: string | null) {
  if (!pathname) return false;
  return NEUTRAL_PATHS.some((re) => re.test(pathname));
}

function NavIcon({
  src,
  leafClassName,
}: {
  src: string;
  leafClassName: string;
}) {
  return (
    <span className="relative flex size-7.5 shrink-0 items-center justify-center overflow-hidden px-1 py-0.5">
      <span
        aria-hidden
        className={`relative block max-w-none shrink-0 bg-brand ${leafClassName}`}
        style={{
          maskImage: `url(${src})`,
          maskSize: "contain",
          maskRepeat: "no-repeat",
          maskPosition: "center",
          WebkitMaskImage: `url(${src})`,
          WebkitMaskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
        }}
      />
    </span>
  );
}

export default function BottomNav({
  moreOpen = false,
  onMoreClick,
}: {
  moreOpen?: boolean;
  onMoreClick?: () => void;
}) {
  const pathname = usePathname();
  const neutral = isNeutralPath(pathname);

  return (
    <nav className="flex shrink-0 items-start gap-2 bg-surface px-2 pt-2 pb-4 shadow-nav sm:-mb-5 sm:pb-7">
      {tabs.map((tab) => {
        if (tab.more) {
          return (
            <button
              key="more"
              type="button"
              onClick={onMoreClick}
              aria-expanded={moreOpen}
              aria-controls="more-settings-panel"
              className={itemClass}
            >
              <NavIcon src={tab.icon} leafClassName={tab.leafClassName} />
              <span
                className={`whitespace-nowrap text-center text-sm leading-[16.8px] ${
                  moreOpen
                    ? "font-semibold text-brand"
                    : "font-normal text-ink-secondary"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        }

        const href = tab.href!;
        const active =
          !moreOpen &&
          !neutral &&
          !!pathname &&
          (pathname === href || pathname.startsWith(`${href}/`));
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={itemClass}
          >
            <NavIcon src={tab.icon} leafClassName={tab.leafClassName} />
            <span
              className={`whitespace-nowrap text-center text-sm leading-[16.8px] ${
                active
                  ? "font-semibold text-brand"
                  : "font-normal text-ink-secondary"
              }`}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
