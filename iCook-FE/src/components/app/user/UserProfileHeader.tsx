"use client";

import Link from "next/link";
import { EditIcon, PostIcon } from "@/components/app/icons";
import UserAvatar from "@/components/app/UserAvatar";
import { useAuth } from "@/components/auth/AuthProvider";
import { CURRENT_USER } from "./data";
import { initialsFromName } from "@/lib/username";

export default function UserProfileHeader() {
  const { user } = useAuth();

  const name = user?.name ?? CURRENT_USER.name;
  const handle = user?.username ?? CURRENT_USER.handle;
  const initials = user
    ? initialsFromName(user.firstName, user.lastName)
    : CURRENT_USER.initials;
  const avatarUrl = user?.avatarUrl;

  return (
    <>
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <UserAvatar
            initials={initials}
            handle={handle}
            src={avatarUrl}
            size="lg"
            me
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xl font-bold text-brand">{name}</p>
            <p className="flex items-center gap-0.5 text-sm leading-[14px]">
              <span className="text-brand-soft">@</span>
              <span className="truncate text-placeholder">{handle}</span>
            </p>
          </div>
          <Link
            href="/settings/user"
            className="shrink-0 rounded border border-line px-3 py-1.5 text-sm font-bold text-ink-secondary"
          >
            Edit profile
          </Link>
        </div>
      </div>

      <div className="px-3 pb-3">
        <div className="grid grid-cols-2 gap-2">
          <Link href="/create/recipe" className="btn-primary">
            <EditIcon className="size-5 shrink-0" />
            <span className="leading-tight">Create a Recipe</span>
          </Link>
          <Link href="/create/post" className="btn-secondary">
            <PostIcon className="size-5 shrink-0" />
            <span className="leading-tight">Write a Post</span>
          </Link>
        </div>
      </div>
    </>
  );
}
