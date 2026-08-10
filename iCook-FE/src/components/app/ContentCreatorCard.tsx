"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  HeartIcon,
  HeartFillIcon,
  MessageIcon,
  ShareIcon,
} from "@/components/app/icons";
import UserAvatar from "@/components/app/UserAvatar";
import UserNameLink from "@/components/app/UserNameLink";
import type { FeedUser } from "@/components/app/user/types";
import { userProfilePath } from "@/lib/userProfile";

type ContentCreatorCardProps = {
  author: FeedUser;
  me: FeedUser;
  heartPressed: boolean;
  heartLabel: string;
  onHeart: () => void;
  shareLabel: string;
  onShare: () => void;
  children?: ReactNode;
};

/** Creator block + optional comments — shared by recipe and post detail. */
export default function ContentCreatorCard({
  author,
  me,
  heartPressed,
  heartLabel,
  onHeart,
  shareLabel,
  onShare,
  children,
}: ContentCreatorCardProps) {
  return (
    <section className="feed-card">
      <div className="flex gap-3 border-b border-line pb-3">
        <div className="flex flex-col items-center gap-3">
          <Link
            href={userProfilePath(author.handle, me.handle)}
            aria-label={author.name}
          >
            <UserAvatar
              initials={author.initials}
              handle={author.handle}
              src={author.avatarUrl}
              size="lg"
              me={author.handle === me.handle}
            />
          </Link>
          <div className="flex flex-col items-center gap-2 text-brand">
            <button
              type="button"
              aria-label={heartLabel}
              aria-pressed={heartPressed}
              onClick={onHeart}
            >
              {heartPressed ? (
                <HeartFillIcon className="size-6" />
              ) : (
                <HeartIcon className="size-6" />
              )}
            </button>
            <button type="button" aria-label="Message">
              <MessageIcon className="size-6" />
            </button>
            <button type="button" aria-label={shareLabel} onClick={onShare}>
              <ShareIcon className="size-5" />
            </button>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <UserNameLink
            name={author.name}
            handle={author.handle}
            className="text-base font-bold text-brand"
          />
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
