"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import AppBar from "@/components/app/AppBar";
import BottomNav from "@/components/app/BottomNav";
import SearchOverlay from "@/components/app/SearchOverlay";
import { useAuth } from "@/components/auth/AuthProvider";

/**
 * Logged-in app frame: protects the route (redirects to /login when there's no
 * session), renders the shared top app bar and bottom navigation, and presents
 * a phone-width column centered on desktop.
 */
export default function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  return (
    <div className="flex h-dvh justify-center bg-neutral-200 font-nunito">
      <div className="relative flex h-dvh w-full max-w-[400px] flex-col overflow-hidden bg-[#f6f7fa] shadow-xl">
        {loading || !user ? (
          <div className="grid flex-1 place-items-center text-muted">
            Loading&hellip;
          </div>
        ) : (
          <>
            <AppBar onSearchClick={() => setSearchOpen(true)} />
            <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
            <BottomNav />
            <SearchOverlay
              open={searchOpen}
              onClose={() => setSearchOpen(false)}
            />
          </>
        )}
      </div>
    </div>
  );
}
