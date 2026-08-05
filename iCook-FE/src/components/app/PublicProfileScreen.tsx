"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import UserAvatar from "@/components/app/UserAvatar";
import { useAuth } from "@/components/auth/AuthProvider";
import { CURRENT_USER } from "@/components/app/user/data";

const KNOWN_USERS: Record<
  string,
  { name: string; handle: string; initials: string; bio: string }
> = {
  chefamy: {
    name: "Chef Amy",
    handle: "chefamy",
    initials: "CA",
    bio: "Weeknight dinners and spice-rack wisdom.",
  },
  bakerben: {
    name: "Baker Ben",
    handle: "bakerben",
    initials: "BB",
    bio: "Pancakes, cookies, and everything floury.",
  },
  sweetsue: {
    name: "Sweet Sue",
    handle: "sweetsue",
    initials: "SS",
    bio: "Dessert tips that actually work.",
  },
  grillguy: {
    name: "Grill Guy",
    handle: "grillguy",
    initials: "GG",
    bio: "Charcoal over gas. Fight me.",
  },
  fishfan: {
    name: "Fish Fan",
    handle: "fishfan",
    initials: "FF",
    bio: "Seafood and sheet-pan dinners.",
  },
  courtneyhenry: {
    name: CURRENT_USER.name,
    handle: CURRENT_USER.handle,
    initials: CURRENT_USER.initials,
    bio: "Passionate about cooking and sharing simple, delicious recipes.",
  },
};

function resolveUser(handle: string) {
  const key = decodeURIComponent(handle).toLowerCase();
  if (KNOWN_USERS[key]) return KNOWN_USERS[key];
  const initials = key.slice(0, 2).toUpperCase();
  return {
    name: key,
    handle: key,
    initials,
    bio: "iCook community member.",
  };
}

export default function PublicProfileScreen({ handle }: { handle: string }) {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const myHandle = authUser?.username ?? CURRENT_USER.handle;
  const user = resolveUser(handle);
  const isSelf = user.handle === myHandle;

  useEffect(() => {
    if (isSelf) {
      router.replace("/user");
    }
  }, [isSelf, router]);

  if (isSelf) {
    return null;
  }

  return (
    <div className="page">
      <div className="feed-card flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <UserAvatar
            initials={user.initials}
            handle={user.handle}
            size="lg"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xl font-bold text-brand">{user.name}</p>
            <p className="flex items-center gap-0.5 text-sm leading-[14px]">
              <span className="text-brand-soft">@</span>
              <span className="truncate text-placeholder">{user.handle}</span>
            </p>
          </div>
        </div>

        <p className="text-sm italic leading-5 text-ink-secondary">{user.bio}</p>

        <div className="grid grid-cols-2 gap-2">
          <button type="button" className="btn-primary">
            Follow
          </button>
          <Link href="/messages/1" className="btn-secondary">
            Message
          </Link>
        </div>
      </div>
    </div>
  );
}
