"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import {
  UserAddIcon,
  HeartFillIcon,
  CommentIcon,
} from "@/components/app/icons";
import InfiniteFeedSentinel from "@/components/app/InfiniteFeedSentinel";
import { PostFeedCard, RecipeFeedCard } from "@/components/app/CommunityFeedCard";
import UserAvatar from "@/components/app/UserAvatar";
import UserNameLink from "@/components/app/UserNameLink";
import { useLikedPosts } from "@/components/app/LikedPostsProvider";
import type { FeedItem, FeedUser } from "./types";
import { filterActivityItems, searchActivityItems } from "./activityFilters";
import { useActivityFilters } from "./ActivityFiltersProvider";
import { withLiveProfile } from "./authors";
import { useCurrentFeedUser } from "./useCurrentFeedUser";
import { userProfilePath } from "@/lib/userProfile";
import { useInfiniteFeed } from "@/lib/useInfiniteFeed";

const PAGE_SIZE = 4;

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
  const unread = Boolean(item.unread);
  const unreadDot = unread ? (
    <span
      className="mt-1.5 size-2 shrink-0 rounded-full bg-brand"
      aria-label="New activity"
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
          {unread ? (
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded bg-brand/10 px-2 py-1 text-xs font-bold text-brand">
                <UserAddIcon className="size-3.5" />
                New follower
              </span>
            </div>
          ) : null}
        </div>
      </article>
    );
  }

  if (item.kind === "recipe") {
    return (
      <RecipeFeedCard
        user={item.user}
        time={item.time}
        recipeId={item.recipeId}
        recipeName={item.recipeName}
        preview={item.preview}
        unread={unread}
      />
    );
  }

  if (item.kind === "post") {
    return (
      <PostFeedCard
        user={item.user}
        time={item.time}
        postId={item.postId}
        title={item.title}
        preview={item.preview}
        thumbnailUrl={item.thumbnailUrl}
        unread={unread}
      />
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
  const { activityItems, markActivityViewed } = useLikedPosts();
  const { prefs } = useActivityFilters();
  const wrapRef = useRef<HTMLDivElement>(null);
  const feed = searchActivityItems(
    filterActivityItems(
      items ?? activityItems,
      prefs,
      me.handle,
    ),
    searchQuery,
  );

  const resetKey = `${searchQuery}\0${feed.map((item) => item.id).join(",")}\0${Object.entries(prefs)
    .map(([key, value]) => `${key}:${value ? 1 : 0}`)
    .join(",")}`;
  const { entries, loadingMore, hasMore, sentinelRef } = useInfiniteFeed({
    items: feed,
    pageSize: PAGE_SIZE,
    resetKey,
    cycle: true,
  });

  useEffect(() => {
    const wrap = wrapRef.current;
    const root = wrap?.closest(".feed-stack");
    if (!wrap || !root) return;

    let scrolled = false;

    const visibleIds = () => {
      const rootRect = root.getBoundingClientRect();
      const ids: string[] = [];
      wrap.querySelectorAll<HTMLElement>("[data-activity-id]").forEach((el) => {
        const id = el.dataset.activityId;
        if (!id) return;
        const rect = el.getBoundingClientRect();
        if (rect.bottom > rootRect.top && rect.top < rootRect.bottom) {
          ids.push(id);
        }
      });
      return ids;
    };

    const observer = new IntersectionObserver(
      (observerEntries) => {
        if (!scrolled) return;
        const ids = observerEntries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => (entry.target as HTMLElement).dataset.activityId)
          .filter((id): id is string => Boolean(id));
        if (ids.length > 0) markActivityViewed(ids);
      },
      { root, threshold: 0.35 },
    );

    wrap.querySelectorAll("[data-activity-id]").forEach((el) => observer.observe(el));

    const onScroll = () => {
      if (!scrolled && root.scrollTop < 8) return;
      scrolled = true;
      const ids = visibleIds();
      if (ids.length > 0) markActivityViewed(ids);
    };

    root.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      root.removeEventListener("scroll", onScroll);
    };
  }, [entries, markActivityViewed]);

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
    <div ref={wrapRef} className="contents">
      {entries.map(({ key, item }) => (
        <div key={key} data-activity-id={item.id}>
          <FeedCard item={item} me={me} />
        </div>
      ))}
      <InfiniteFeedSentinel
        sentinelRef={sentinelRef}
        loadingMore={loadingMore}
        hasMore={hasMore}
      />
    </div>
  );
}
