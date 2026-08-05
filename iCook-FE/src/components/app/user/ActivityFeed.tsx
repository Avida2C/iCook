"use client";

import Link from "next/link";
import {
  UserAddIcon,
  HeartFillIcon,
  CommentIcon,
} from "@/components/app/icons";
import RecipeThumbnail from "@/components/app/RecipeThumbnail";
import UserAvatar from "@/components/app/UserAvatar";
import UserNameLink from "@/components/app/UserNameLink";
import { useLikedPosts } from "@/components/app/LikedPostsProvider";
import { ACTIVITY_FEED, CURRENT_USER } from "./data";
import type { FeedItem, FeedUser } from "./types";
import { userProfilePath } from "@/lib/userProfile";

function Avatar({ user, size = "md" }: { user: FeedUser; size?: "sm" | "md" }) {
  return (
    <Link href={userProfilePath(user.handle)} aria-label={user.name}>
      <UserAvatar
        initials={user.initials}
        handle={user.handle}
        size={size}
      />
    </Link>
  );
}

function FeedCard({ item }: { item: FeedItem }) {
  const unreadDot = item.unread ? (
    <span
      className="mt-1.5 size-2 shrink-0 rounded-full bg-brand"
      aria-label="Unread"
    />
  ) : null;

  if (item.kind === "follow") {
    return (
      <article className="feed-card flex gap-3">
        <Avatar user={item.user} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <p className="min-w-0 flex-1 text-sm leading-5 text-ink">
              <UserNameLink name={item.user.name} handle={item.user.handle} />{" "}
              started following you
            </p>
            {unreadDot}
          </div>
          <p className="mt-1 text-xs text-muted">{item.time}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded bg-brand/10 px-2 py-1 text-xs font-bold text-brand">
              <UserAddIcon className="size-3.5" />
              New follower
            </span>
          </div>
        </div>
      </article>
    );
  }

  if (item.kind === "recipe") {
    return (
      <article className="feed-card flex flex-col gap-2">
        <div className="flex gap-3">
          <Avatar user={item.user} />
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-2">
              <p className="min-w-0 flex-1 text-sm leading-5 text-ink">
                <UserNameLink name={item.user.name} handle={item.user.handle} />{" "}
                posted a new recipe
              </p>
              {unreadDot}
            </div>
            <p className="mt-0.5 flex items-center gap-0.5 text-xs leading-[14px]">
              <span className="text-brand-soft">@</span>
              <Link
                href={userProfilePath(item.user.handle)}
                className="truncate text-placeholder"
              >
                {item.user.handle}
              </Link>
              <span className="text-muted"> · {item.time}</span>
            </p>
          </div>
        </div>
        <Link
          href={`/recipe/${item.recipeId}`}
          className="ms-14 block overflow-hidden rounded border border-line"
        >
          <RecipeThumbnail className="h-20 w-full" iconClassName="h-10 w-11" />
          <div className="px-3 py-2">
            <p className="truncate text-sm font-bold text-ink">
              {item.recipeName}
            </p>
            <p className="mt-0.5 line-clamp-2 text-xs leading-4 text-muted">
              {item.preview}
            </p>
          </div>
        </Link>
      </article>
    );
  }

  if (item.kind === "post") {
    return (
      <article className="feed-card flex flex-col gap-2">
        <div className="flex gap-3">
          <Avatar user={item.user} />
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-2">
              <p className="min-w-0 flex-1 text-sm leading-5 text-ink">
                <UserNameLink name={item.user.name} handle={item.user.handle} />{" "}
                shared a post
              </p>
              {unreadDot}
            </div>
            <p className="mt-0.5 flex items-center gap-0.5 text-xs leading-[14px]">
              <span className="text-brand-soft">@</span>
              <Link
                href={userProfilePath(item.user.handle)}
                className="truncate text-placeholder"
              >
                {item.user.handle}
              </Link>
              <span className="text-muted"> · {item.time}</span>
            </p>
          </div>
        </div>
        <Link
          href={`/post/${item.postId}`}
          className="ms-14 block rounded border border-line px-3 py-2"
        >
          <p className="text-sm font-bold text-ink">{item.title}</p>
          <p className="mt-1 line-clamp-3 text-xs leading-4 text-ink-secondary">
            {item.preview}
          </p>
        </Link>
      </article>
    );
  }

  if (item.kind === "like") {
    if (item.self) {
      const href =
        item.targetKind === "recipe" && item.recipeId
          ? `/recipe/${item.recipeId}`
          : item.targetKind === "post" && item.postId
            ? `/post/${item.postId}`
            : null;

      const title = href ? (
        <Link
          href={href}
          className="font-bold italic text-brand"
        >
          {item.target}
        </Link>
      ) : (
        <span className="font-bold italic text-ink-secondary">
          {item.target}
        </span>
      );

      return (
        <article className="feed-card flex gap-3">
          <Link href={userProfilePath(CURRENT_USER.handle)} aria-label={CURRENT_USER.name}>
            <UserAvatar
              initials={CURRENT_USER.initials}
              handle={CURRENT_USER.handle}
              me
            />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-2">
              <p className="min-w-0 flex-1 text-sm leading-5 text-ink">
                You liked {title}
              </p>
              {unreadDot}
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted">
              <HeartFillIcon className="size-3.5 text-brand" />
              <span>{item.time}</span>
            </div>
          </div>
        </article>
      );
    }

    return (
      <article className="feed-card flex gap-3">
        <Avatar user={item.user} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <p className="min-w-0 flex-1 text-sm leading-5 text-ink">
              <UserNameLink name={item.user.name} handle={item.user.handle} />{" "}
              liked your recipe{" "}
              {item.recipeId ? (
                <Link
                  href={`/recipe/${item.recipeId}`}
                  className="font-bold italic text-brand"
                >
                  {item.target}
                </Link>
              ) : (
                <span className="font-bold italic text-ink-secondary">
                  {item.target}
                </span>
              )}
            </p>
            {unreadDot}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted">
            <HeartFillIcon className="size-3.5 text-brand" />
            <span>{item.time}</span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="feed-card flex gap-3">
      <Avatar user={item.user} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <p className="min-w-0 flex-1 text-sm leading-5 text-ink">
            <UserNameLink name={item.user.name} handle={item.user.handle} />{" "}
            commented on{" "}
            {item.recipeId ? (
              <Link
                href={`/recipe/${item.recipeId}`}
                className="font-bold italic text-brand"
              >
                {item.target}
              </Link>
            ) : item.postId ? (
              <Link
                href={`/post/${item.postId}`}
                className="font-bold italic text-brand"
              >
                {item.target}
              </Link>
            ) : (
              <span className="font-bold italic text-ink-secondary">
                {item.target}
              </span>
            )}
          </p>
          {unreadDot}
        </div>
        <p className="mt-1 line-clamp-2 rounded bg-app px-2 py-1.5 text-xs leading-4 text-ink-secondary">
          &ldquo;{item.preview}&rdquo;
        </p>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted">
          <CommentIcon className="size-3.5 text-brand" />
          <span>{item.time}</span>
        </div>
      </div>
    </article>
  );
}

export default function ActivityFeed({ items }: { items?: FeedItem[] }) {
  const { activityItems } = useLikedPosts();
  const feed = items ?? activityItems ?? ACTIVITY_FEED;

  return (
    <>
      {feed.map((item) => (
        <FeedCard key={item.id} item={item} />
      ))}
    </>
  );
}
