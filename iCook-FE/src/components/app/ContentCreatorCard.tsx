"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import {
  MessageIcon,
  ShareIcon,
  UserAddIcon,
  UserCheckIcon,
} from "@/components/app/icons";
import UserAvatar from "@/components/app/UserAvatar";
import UserNameLink from "@/components/app/UserNameLink";
import type { FeedUser } from "@/components/app/user/types";
import { readFollowing, writeFollowing } from "@/lib/accountData";
import { userProfilePath } from "@/lib/userProfile";

type ContentCreatorCardProps = {
  author: FeedUser;
  me: FeedUser;
  shareLabel: string;
  onShare: () => void;
  children?: ReactNode;
};

/** Creator block + optional comments — shared by recipe and post detail. */
export default function ContentCreatorCard({
  author,
  me,
  shareLabel,
  onShare,
  children,
}: ContentCreatorCardProps) {
  const isSelf = author.handle === me.handle;
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    if (isSelf) {
      setFollowing(false);
      return;
    }
    setFollowing(readFollowing().includes(author.name));
  }, [author.name, isSelf]);

  const onToggleFollow = () => {
    if (isSelf) return;
    setFollowing((prev) => {
      const next = !prev;
      const list = readFollowing();
      writeFollowing(
        next
          ? list.includes(author.name)
            ? list
            : [...list, author.name]
          : list.filter((n) => n !== author.name),
      );
      return next;
    });
  };

  const followLabel = following
    ? `Unfollow ${author.name}`
    : `Follow ${author.name}`;

  return (
    <section className="feed-card">
      <div className="flex gap-3 border-b border-line pb-3">
        <Link
          href={userProfilePath(author.handle, me.handle)}
          aria-label={author.name}
          className="shrink-0"
        >
          <UserAvatar
            initials={author.initials}
            handle={author.handle}
            src={author.avatarUrl}
            size="lg"
            me={isSelf}
          />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <UserNameLink
              name={author.name}
              handle={author.handle}
              className="min-w-0 truncate text-base font-bold text-brand"
            />
            {isSelf ? null : (
              <div className="ml-auto flex shrink-0 items-center gap-2.5 text-brand">
                <button
                  type="button"
                  aria-label={followLabel}
                  aria-pressed={following}
                  onClick={onToggleFollow}
                >
                  {following ? (
                    <UserCheckIcon className="size-6" />
                  ) : (
                    <UserAddIcon className="size-6" />
                  )}
                </button>
                <button type="button" aria-label="Message">
                  <MessageIcon className="size-6" />
                </button>
                <button type="button" aria-label={shareLabel} onClick={onShare}>
                  <ShareIcon className="size-5" />
                </button>
              </div>
            )}
          </div>
          <p className="mt-0.5 flex items-center gap-0.5 text-xs leading-3.5">
            <span className="text-brand-soft">@</span>
            <Link
              href={userProfilePath(author.handle, me.handle)}
              className="truncate text-placeholder"
            >
              {author.handle}
            </Link>
          </p>
          <p className="mt-2 text-sm italic leading-5 text-ink-secondary">
            {author.about ??
              "Passionate about cooking and sharing simple, delicious recipes with easy-to-follow instructions."}
          </p>
        </div>
      </div>
      {children}
    </section>
  );
}
