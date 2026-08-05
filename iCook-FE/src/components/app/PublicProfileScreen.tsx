"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import UserAvatar from "@/components/app/UserAvatar";
import { COMMUNITY_AUTHORS } from "@/components/app/user/authors";
import { CURRENT_USER } from "@/components/app/user/data";
import { useCurrentFeedUser } from "@/components/app/user/useCurrentFeedUser";

function resolveUser(handle: string) {
  const key = decodeURIComponent(handle).toLowerCase();
  if (COMMUNITY_AUTHORS[key]) return COMMUNITY_AUTHORS[key];
  if (key === CURRENT_USER.handle) return CURRENT_USER;
  const initials = key.slice(0, 2).toUpperCase();
  return {
    name: key,
    handle: key,
    initials,
    about: "iCook community member.",
  };
}

export default function PublicProfileScreen({ handle }: { handle: string }) {
  const router = useRouter();
  const me = useCurrentFeedUser();
  const user = resolveUser(handle);
  const isSelf = user.handle === me.handle;

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
            src={user.avatarUrl}
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

        <p className="text-sm italic leading-5 text-ink-secondary">
          {user.about ?? "iCook community member."}
        </p>

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
