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
import type { FeedItem, FeedUser } from "./types";
import { filterActivityItems, searchActivityItems } from "./activityFilters";
import { useActivityFilters } from "./ActivityFiltersProvider";
import { withLiveProfile } from "./authors";
import { useCurrentFeedUser } from "./useCurrentFeedUser";
import { userProfilePath } from "@/lib/userProfile";

function Avatar({
  user,
  size = "md",
  selfHandle,
}: {
  user: FeedUser;
  size?: "sm" | "md";
  selfHandle: string;
}) {
  return (
    <Link
      href={userProfilePath(user.handle, selfHandle)}
      aria-label={user.name}
    >
      <UserAvatar
        initials={user.initials}
        handle={user.handle}
        src={user.avatarUrl}
        size={size}
        me={user.handle === selfHandle}
      />
    </Link>
  );
}

function FeedCard({
  item,
  me,
}: {
  item: FeedItem;
  me: FeedUser;
}) {
  const unreadDot = item.unread ? (
    <span
      className="mt-1.5 size-2 shrink-0 rounded-full bg-brand"
      aria-label="Unread"
    />
  ) : null;

  if (item.kind === "follow") {
    const user = withLiveProfile(item.user, me);
    return (
      <article className="feed-card flex gap-3">
        <Avatar user={user} selfHandle={me.handle} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <p className="min-w-0 flex-1 text-sm leading-5 text-ink">
              <UserNameLink name={user.name} handle={user.handle} />{" "}
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
    const user = withLiveProfile(item.user, me);
    return (
      <article className="feed-card flex flex-col gap-2">
        <div className="flex gap-3">
          <Avatar user={user} selfHandle={me.handle} />
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-2">
              <p className="min-w-0 flex-1 text-sm leading-5 text-ink">
                <UserNameLink name={user.name} handle={user.handle} />{" "}
                posted a new recipe
              </p>
              {unreadDot}
            </div>
            <p className="mt-0.5 flex items-center gap-0.5 text-xs leading-[14px]">
              <span className="text-brand-soft">@</span>
              <Link
                href={userProfilePath(user.handle, me.handle)}
                className="truncate text-placeholder"
              >
                {user.handle}
              </Link>
              <span className="text-muted"> · {item.time}</span>
            </p>
          </div>
        </div>
        <Link
          href={`/recipe/${item.recipeId}`}
          className="ms-14 block overflow-hidden rounded border border-line"
        >
          <RecipeThumbnail className="aspect-square w-full" iconClassName="h-10 w-11" />
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
    const user = withLiveProfile(item.user, me);
    return (
      <article className="feed-card flex flex-col gap-2">
        <div className="flex gap-3">
          <Avatar user={user} selfHandle={me.handle} />
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-2">
              <p className="min-w-0 flex-1 text-sm leading-5 text-ink">
                <UserNameLink name={user.name} handle={user.handle} />{" "}
                shared a post
              </p>
              {unreadDot}
            </div>
            <p className="mt-0.5 flex items-center gap-0.5 text-xs leading-[14px]">
              <span className="text-brand-soft">@</span>
              <Link
                href={userProfilePath(user.handle, me.handle)}
                className="truncate text-placeholder"
              >
                {user.handle}
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
        <Link href={href} className="font-bold italic text-brand">
          {item.target}
        </Link>
      ) : (
        <span className="font-bold italic text-ink-secondary">
          {item.target}
        </span>
      );

      return (
        <article className="feed-card flex gap-3">
          <Link
            href={userProfilePath(me.handle, me.handle)}
            aria-label={me.name}
          >
            <UserAvatar
              initials={me.initials}
              handle={me.handle}
              src={me.avatarUrl}
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

    const user = withLiveProfile(item.user, me);
    return (
      <article className="feed-card flex gap-3">
        <Avatar user={user} size="sm" selfHandle={me.handle} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <p className="min-w-0 flex-1 text-sm leading-5 text-ink">
              <UserNameLink name={user.name} handle={user.handle} /> liked your
              recipe{" "}
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

  const user = withLiveProfile(item.user, me);
  return (
    <article className="feed-card flex gap-3">
      <Avatar user={user} size="sm" selfHandle={me.handle} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <p className="min-w-0 flex-1 text-sm leading-5 text-ink">
            <UserNameLink name={user.name} handle={user.handle} /> commented on{" "}
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

export default function ActivityFeed({
  items,
  searchQuery = "",
}: {
  items?: FeedItem[];
  searchQuery?: string;
}) {
  const me = useCurrentFeedUser();
  const { activityItems } = useLikedPosts();
  const { prefs } = useActivityFilters();
  const feed = searchActivityItems(
    filterActivityItems(
      items ?? activityItems,
      prefs,
      me.handle,
    ),
    searchQuery,
  );

  if (feed.length === 0) {
    return (
      <p className="feed-card px-3 py-8 text-center text-base text-muted">
        {searchQuery.trim()
          ? `No activity matches “${searchQuery.trim()}”.`
          : "Nothing to show with your current filters."}
      </p>
    );
  }

  return (
    <>
      {feed.map((item) => (
        <FeedCard key={item.id} item={item} me={me} />
      ))}
    </>
  );
}
