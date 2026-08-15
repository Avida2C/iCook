/**
 * Local content keys wiped on account reset (device-global, not per-email).
 * Profile seed (demo activity / starter recipes / social lists) is turned off on reset.
 */

import { normalizeAuthorKey } from "@/components/app/user/authors";
import {
  INITIAL_FOLLOWERS,
  INITIAL_FOLLOWING,
} from "@/components/app/user/data";

export const ACCOUNT_CONTENT_KEYS = [
  "icook.pantry",
  "icook.savedRecipes",
  "icook.likedPosts",
  "icook.createdPosts",
  "icook.createdRecipes",
  "icook.deletedRecipes",
  "icook.activityFilters",
  "icook.featuredRecipePrefs",
  "icook.viewedActivity",
] as const;

const FOLLOWERS_KEY = "icook.followers";
const FOLLOWING_KEY = "icook.following";
/** When `"0"`, seeded activity / starter recipes / default social lists are off. */
const SEEDED_PROFILE_KEY = "icook.seededProfile";
export const FOLLOWING_CHANGED_EVENT = "icook-following-changed";

function readStoredNames(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((n): n is string => typeof n === "string");
  } catch {
    return [];
  }
}

function persistNames(key: string, names: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(names));
  } catch {
    // ignore
  }
}

/** Fill empty follower/following storage with demo names. Safe to call from effects only. */
export function ensureDemoSocialLists() {
  if (readStoredNames(FOLLOWERS_KEY).length === 0) {
    persistNames(FOLLOWERS_KEY, INITIAL_FOLLOWERS);
  }
  if (readStoredNames(FOLLOWING_KEY).length === 0) {
    persistNames(FOLLOWING_KEY, INITIAL_FOLLOWING);
  }
}

export function readFollowers(): string[] {
  const names = readStoredNames(FOLLOWERS_KEY);
  return names.length > 0 ? names : [...INITIAL_FOLLOWERS];
}

export function readFollowing(): string[] {
  const names = readStoredNames(FOLLOWING_KEY);
  return names.length > 0 ? names : [...INITIAL_FOLLOWING];
}

/** Demo feed, starter recipes, and default followers/following until reset. */
export function isProfileSeedEnabled(): boolean {
  try {
    return localStorage.getItem(SEEDED_PROFILE_KEY) !== "0";
  } catch {
    return true;
  }
}

export function writeFollowers(names: string[]) {
  persistNames(FOLLOWERS_KEY, names);
}

export function writeFollowing(names: string[]) {
  persistNames(FOLLOWING_KEY, names);
  queueMicrotask(() => {
    window.dispatchEvent(new Event(FOLLOWING_CHANGED_EVENT));
  });
}

type FollowPerson = { name: string; handle: string };

/** True if list already follows this person by display name or handle. */
export function isFollowingPerson(
  list: string[],
  person: FollowPerson,
): boolean {
  const handleKey = normalizeAuthorKey(person.handle);
  const nameKey = normalizeAuthorKey(person.name);
  return list.some((entry) => {
    if (entry === person.name || entry === person.handle) return true;
    const entryKey = normalizeAuthorKey(entry);
    return entryKey === handleKey || entryKey === nameKey;
  });
}

/** Add or remove a person, clearing any name/handle aliases first. */
export function setFollowingPerson(
  list: string[],
  person: FollowPerson,
  following: boolean,
): string[] {
  const handleKey = normalizeAuthorKey(person.handle);
  const nameKey = normalizeAuthorKey(person.name);
  const cleaned = list.filter((entry) => {
    if (entry === person.name || entry === person.handle) return false;
    const entryKey = normalizeAuthorKey(entry);
    return entryKey !== handleKey && entryKey !== nameKey;
  });
  return following ? [...cleaned, person.name] : cleaned;
}

/**
 * Clear pantry, saved/liked/created content, activity filters, followers,
 * following, and seeded profile demo data. Keeps auth + theme.
 */
export function wipeAccountContent() {
  for (const key of ACCOUNT_CONTENT_KEYS) {
    localStorage.removeItem(key);
  }
  localStorage.setItem(SEEDED_PROFILE_KEY, "0");
  writeFollowers([]);
  writeFollowing([]);
}
