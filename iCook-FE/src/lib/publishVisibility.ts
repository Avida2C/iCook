import { isOwnAuthor } from "@/components/app/user/authors";
import type { FeedUser } from "@/components/app/user/types";
import type { Recipe } from "@/components/recipes/recipesData";

/** New posts and recipes stay private to the creator for this long after publish. */
export const PUBLISH_EMBARGO_MS = 60 * 60 * 1000;

export function isPublishEmbargoed(publishedAt: number, now = Date.now()) {
  return Number.isFinite(publishedAt) && now - publishedAt < PUBLISH_EMBARGO_MS;
}

/** Creator can always see their item; others wait out the embargo and never see private recipes. */
export function canViewerSeePublishedItem(
  publishedAt: number,
  author: string | undefined,
  viewer: FeedUser,
  now = Date.now(),
  isPrivate = false,
) {
  const isOwner = Boolean(author) && isOwnAuthor(author!, viewer);
  if (isOwner) return true;
  if (isPrivate) return false;
  return !isPublishEmbargoed(publishedAt, now);
}

export function publishRemainingMs(publishedAt: number, now = Date.now()) {
  return Math.max(0, publishedAt + PUBLISH_EMBARGO_MS - now);
}

/** `null` once the public embargo has ended. */
export function formatPublishCountdown(publishedAt: number, now = Date.now()) {
  const remaining = publishRemainingMs(publishedAt, now);
  if (remaining <= 0) return null;
  const totalSec = Math.ceil(remaining / 1000);
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function formatPublishAge(publishedAt: number, now = Date.now()) {
  const age = Math.max(0, now - publishedAt);
  const minutes = Math.floor(age / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/** Activity stays "new" (unread dot) for this long after it happened. */
export const NEW_ACTIVITY_MS = 14 * 60 * 60 * 1000;

export function isNewActivity(createdAt: number | undefined, now = Date.now()) {
  return (
    typeof createdAt === "number" &&
    Number.isFinite(createdAt) &&
    now - createdAt < NEW_ACTIVITY_MS
  );
}

/** Relative activity labels: Just now, 1min ago, 1hr ago, Yesterday, 3d ago, then a date. */
export function formatActivityAge(createdAt: number, now = Date.now()) {
  const age = Math.max(0, now - createdAt);
  const minutes = Math.floor(age / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}hr ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(createdAt).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function activityTimeLabel(
  item: { createdAt?: number; time: string },
  now = Date.now(),
) {
  return typeof item.createdAt === "number" && Number.isFinite(item.createdAt)
    ? formatActivityAge(item.createdAt, now)
    : item.time;
}

/** Created recipes the viewer may see, then catalog entries that are not replaced. */
export function mergePublicRecipes<T extends Recipe>(
  visibleCreated: T[],
  catalog: T[],
): T[] {
  const createdIds = new Set(visibleCreated.map((r) => r.id));
  return [...visibleCreated, ...catalog.filter((r) => !createdIds.has(r.id))];
}
