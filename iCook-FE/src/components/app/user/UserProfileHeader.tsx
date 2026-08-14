"use client";

import Link from "next/link";
import CreateActionBar from "@/components/app/CreateActionBar";
import { EditIcon } from "@/components/app/icons";
import UserAvatar from "@/components/app/UserAvatar";
import { useAuth } from "@/components/auth/AuthProvider";
import { CURRENT_USER } from "./data";
import { initialsFromName } from "@/lib/username";
import { publicProfilePath } from "@/lib/userProfile";

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
            <p className="flex items-center gap-0.5 text-sm leading-3.5">
              <span className="text-brand-soft">@</span>
              <span className="truncate text-placeholder">{handle}</span>
            </p>
            <Link
              href={publicProfilePath(handle)}
              className="mt-1.5 inline-block text-xs font-bold text-brand"
            >
              View public profile
            </Link>
          </div>
          <Link
            href="/settings/user"
            className="inline-flex shrink-0 self-start items-center gap-1.5 rounded border border-line px-3 py-1.5 text-sm font-bold text-ink-secondary"
          >
            <EditIcon className="size-4" />
            Edit profile
          </Link>
        </div>
      </div>

      <div className="px-3 pb-3">
        <CreateActionBar />
      </div>
    </>
  );
}
