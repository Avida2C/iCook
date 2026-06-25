import Link from "next/link";
import Logo from "@/components/Logo";
import { SearchIcon, BellIcon, GearIcon } from "@/components/app/icons";

/** Top app bar shared across logged-in screens: logo + search/bell/settings. */
export default function AppBar({ onSearchClick }: { onSearchClick: () => void }) {
  return (
    <header className="flex shrink-0 items-center justify-between bg-white px-3 py-2 shadow-sm">
      <Link href="/recipes" aria-label="iCook home">
        <Logo className="text-3xl" />
      </Link>
      <nav className="flex items-center gap-5 text-brand">
        <button type="button" onClick={onSearchClick} aria-label="Search">
          <SearchIcon className="size-7" />
        </button>
        <Link href="/notifications" aria-label="Notifications">
          <BellIcon className="size-7" />
        </Link>
        <Link href="/settings" aria-label="Settings">
          <GearIcon className="size-7" />
        </Link>
      </nav>
    </header>
  );
}
