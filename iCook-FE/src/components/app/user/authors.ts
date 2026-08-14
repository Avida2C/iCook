import type { User } from "@/components/auth/AuthProvider";
import { initialsFromName } from "@/lib/username";
import { CURRENT_USER } from "./data";
import type { FeedUser } from "./types";

/** Community authors shared across recipes, activity, Discover, and profiles. */
export const COMMUNITY_AUTHORS: Record<string, FeedUser> = {
  chefamy: {
    name: "Chef Amy",
    handle: "chefamy",
    initials: "CA",
    about: "Weeknight dinners and spice-rack wisdom.",
  },
  bakerben: {
    name: "Baker Ben",
    handle: "bakerben",
    initials: "BB",
    about: "Pancakes, cookies, and everything floury.",
  },
  sweetsue: {
    name: "Sweet Sue",
    handle: "sweetsue",
    initials: "SS",
    about: "Dessert tips that actually work.",
  },
  grillguy: {
    name: "Grill Guy",
    handle: "grillguy",
    initials: "GG",
    about: "Charcoal over gas. Fight me.",
  },
  fishfan: {
    name: "Fish Fan",
    handle: "fishfan",
    initials: "FF",
    about: "Seafood and sheet-pan dinners.",
  },
  snacksam: {
    name: "Snack Sam",
    handle: "snacksam",
    initials: "SS",
    about: "Crunchy snacks and movie-night bites.",
  },
  pastapaula: {
    name: "Pasta Paula",
    handle: "pastapaula",
    initials: "PP",
    about: "Noodles, sauces, and weeknight pasta for a crowd.",
  },
  arlenemccoy: {
    name: "Arlene McCoy",
    handle: "arlenemccoy",
    initials: "AM",
    about: "Weeknight home cook. If it works twice, it's a keeper.",
  },
  jacobjones: {
    name: "Jacob Jones",
    handle: "jacobjones",
    initials: "JJ",
    about: "Always testing someone else's recipe on a Tuesday.",
  },
  theresawebb: {
    name: "Theresa Webb",
    handle: "theresawebb",
    initials: "TW",
    about: "Baking with whatever is already in the pantry.",
  },
  darlenerobertson: {
    name: "Darlene Robertson",
    handle: "darlenerobertson",
    initials: "DR",
    about: "Meal prep Sundays and leftover magic.",
  },
};

const SELF_ALIASES = new Set(["you", "username", "me"]);

/** Map Auth user → feed author shape. */
export function feedUserFromAuth(user: User): FeedUser {
  return {
    name: user.name,
    handle: user.username,
    initials: initialsFromName(user.firstName, user.lastName),
    avatarUrl: user.avatarUrl,
    about: user.about,
  };
}

/** Normalize catalog / legacy author strings to a lowercase handle key. */
export function normalizeAuthorKey(raw: string): string {
  return raw.trim().replace(/^@+/, "").replace(/\s+/g, "").toLowerCase();
}

/**
 * Whether an author string refers to the signed-in user (handle or self aliases).
 * Does not treat the demo seed account as "me" for other logged-in users.
 */
export function isOwnAuthor(author: string, me: FeedUser): boolean {
  const key = normalizeAuthorKey(author);
  if (!key) return false;
  if (SELF_ALIASES.has(key)) return true;
  return key === normalizeAuthorKey(me.handle);
}

/**
 * Resolve a recipe/catalog author string to displayable account details.
 * Pass `me` so own recipes pick up the live Auth profile (name, avatar, bio).
 */
export function resolveAuthor(
  author: string,
  me: FeedUser = CURRENT_USER,
): FeedUser {
  const key = normalizeAuthorKey(author);

  if (!key || SELF_ALIASES.has(key) || key === normalizeAuthorKey(me.handle)) {
    return me;
  }

  // Seed/demo catalog account (e.g. courtneyhenry recipes when browsing as someone else)
  if (key === normalizeAuthorKey(CURRENT_USER.handle)) {
    return CURRENT_USER;
  }

  const known = COMMUNITY_AUTHORS[key];
  if (known) return known;

  return {
    name: author.trim() || key,
    handle: key,
    initials: key.slice(0, 2).toUpperCase() || "?",
  };
}

/** Prefer live Auth profile when a feed user is the signed-in account. */
export function withLiveProfile(user: FeedUser, me: FeedUser): FeedUser {
  if (normalizeAuthorKey(user.handle) === normalizeAuthorKey(me.handle)) {
    return { ...user, ...me };
  }
  return user;
}
