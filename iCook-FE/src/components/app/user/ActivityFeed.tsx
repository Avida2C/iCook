import Link from "next/link";
import {
  UserAddIcon,
  HeartIcon,
  CommentIcon,
} from "@/components/app/icons";
import RecipeThumbnail from "@/components/app/RecipeThumbnail";
import { ACTIVITY_FEED } from "./data";
import type { FeedItem, FeedUser } from "./types";

function Avatar({ user, size = "md" }: { user: FeedUser; size?: "sm" | "md" }) {
  return (
    <span className={size === "sm" ? "avatar-sm" : "avatar"}>
      {user.initials}
    </span>
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
              <span className="font-bold text-brand">{item.user.name}</span>{" "}
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
                <span className="font-bold text-brand">{item.user.name}</span>{" "}
                posted a new recipe
              </p>
              {unreadDot}
            </div>
            <p className="mt-0.5 flex items-center gap-0.5 text-xs leading-[14px]">
              <span className="text-brand-soft">@</span>
              <span className="truncate text-placeholder">
                {item.user.handle}
              </span>
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
                <span className="font-bold text-brand">{item.user.name}</span>{" "}
                shared a post
              </p>
              {unreadDot}
            </div>
            <p className="mt-0.5 flex items-center gap-0.5 text-xs leading-[14px]">
              <span className="text-brand-soft">@</span>
              <span className="truncate text-placeholder">
                {item.user.handle}
              </span>
              <span className="text-muted"> · {item.time}</span>
            </p>
          </div>
        </div>
        <div className="ms-14 rounded border border-line px-3 py-2">
          <p className="text-sm font-bold text-ink">{item.title}</p>
          <p className="mt-1 line-clamp-3 text-xs leading-4 text-ink-secondary">
            {item.preview}
          </p>
        </div>
      </article>
    );
  }

  if (item.kind === "like") {
    return (
      <article className="feed-card flex gap-3">
        <Avatar user={item.user} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <p className="min-w-0 flex-1 text-sm leading-5 text-ink">
              <span className="font-bold text-brand">{item.user.name}</span> liked
              your recipe{" "}
              <span className="font-bold italic text-ink-secondary">
                {item.target}
              </span>
            </p>
            {unreadDot}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted">
            <HeartIcon className="size-3.5 text-brand" />
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
            <span className="font-bold text-brand">{item.user.name}</span>{" "}
            commented on{" "}
            <span className="font-bold italic text-ink-secondary">
              {item.target}
            </span>
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
  items = ACTIVITY_FEED,
}: {
  items?: FeedItem[];
}) {
  return (
    <>
      {items.map((item) => (
        <FeedCard key={item.id} item={item} />
      ))}
    </>
  );
}
