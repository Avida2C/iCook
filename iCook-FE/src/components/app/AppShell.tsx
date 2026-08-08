"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import AppBar from "@/components/app/AppBar";
import BottomNav from "@/components/app/BottomNav";
import MorePanel from "@/components/app/MorePanel";
import SearchOverlay from "@/components/app/SearchOverlay";
import PhoneFrame from "@/components/PhoneFrame";
import { useAuth } from "@/components/auth/AuthProvider";

/**
 * Logged-in app frame: protects the route (redirects to /login when there's no
 * session), renders the shared top app bar and bottom navigation, and presents
 * the UI inside a phone device on desktop.
 */
export default function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  return (
    <PhoneFrame>
      <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-app">
        {loading || !user ? (
          <div className="grid flex-1 place-items-center text-muted">
            Loading&hellip;
          </div>
        ) : (
          <>
            <AppBar onSearchClick={() => setSearchOpen(true)} />
            <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
            <BottomNav
              moreOpen={moreOpen}
              onMoreClick={() => setMoreOpen((open) => !open)}
            />
            <SearchOverlay
              open={searchOpen}
              onClose={() => setSearchOpen(false)}
            />
            <MorePanel open={moreOpen} onClose={() => setMoreOpen(false)} />
          </>
        )}
      </div>
    </PhoneFrame>
  );
}
