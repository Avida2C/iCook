import { CURRENT_USER } from "@/components/app/user/data";
import type { FeedItem } from "@/components/app/user/types";

export type ActivityFilterPrefs = {
  /** Your likes on posts & recipes */
  myLikes: boolean;
  /** Posts you shared */
  myPosts: boolean;
  /** Recipes you published */
  myRecipes: boolean;
  /** New followers */
  othersFollows: boolean;
  /** Someone liked your recipe/post */
  othersLikes: boolean;
  /** Comments on your content */
  othersComments: boolean;
  /** Posts shared by others */
  othersPosts: boolean;
  /** Recipes posted by others */
  othersRecipes: boolean;
};

export const DEFAULT_ACTIVITY_FILTERS: ActivityFilterPrefs = {
  myLikes: true,
  myPosts: true,
  myRecipes: true,
  othersFollows: true,
  othersLikes: true,
  othersComments: true,
  othersPosts: true,
  othersRecipes: true,
};

export const MY_ACTIVITY_KEYS = [
  "myLikes",
  "myPosts",
  "myRecipes",
] as const satisfies readonly (keyof ActivityFilterPrefs)[];

export const OTHERS_ACTIVITY_KEYS = [
  "othersFollows",
  "othersLikes",
  "othersComments",
  "othersPosts",
  "othersRecipes",
] as const satisfies readonly (keyof ActivityFilterPrefs)[];

export const ACTIVITY_FILTER_LABELS: Record<keyof ActivityFilterPrefs, string> =
  {
    myLikes: "Likes I made",
    myPosts: "Posts I posted",
    myRecipes: "Recipes I posted",
    othersFollows: "New followers",
    othersLikes: "Likes on my content",
    othersComments: "Comments on my content",
    othersPosts: "Posts from others",
    othersRecipes: "Recipes from others",
  };

const STORAGE_KEY = "icook.activityFilters";

export function readActivityFilters(): ActivityFilterPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_ACTIVITY_FILTERS };
    const parsed = JSON.parse(raw) as Partial<ActivityFilterPrefs>;
    return { ...DEFAULT_ACTIVITY_FILTERS, ...parsed };
  } catch {
    return { ...DEFAULT_ACTIVITY_FILTERS };
  }
}

export function writeActivityFilters(prefs: ActivityFilterPrefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

function isMine(item: FeedItem): boolean {
  if (item.kind === "like" && item.self) return true;
  if (item.kind === "follow" || item.kind === "comment") return false;
  if (item.kind === "like") return false;
  return item.user.handle === CURRENT_USER.handle;
}

export function matchesActivityFilter(
  item: FeedItem,
  prefs: ActivityFilterPrefs,
): boolean {
  switch (item.kind) {
    case "follow":
      return prefs.othersFollows;
    case "comment":
      return prefs.othersComments;
    case "like":
      if (item.self) return prefs.myLikes;
      return prefs.othersLikes;
    case "post":
      return isMine(item) ? prefs.myPosts : prefs.othersPosts;
    case "recipe":
      return isMine(item) ? prefs.myRecipes : prefs.othersRecipes;
    default:
      return true;
  }
}

export function filterActivityItems(
  items: FeedItem[],
  prefs: ActivityFilterPrefs,
): FeedItem[] {
  return items.filter((item) => matchesActivityFilter(item, prefs));
}

export function groupEnabled(
  prefs: ActivityFilterPrefs,
  keys: readonly (keyof ActivityFilterPrefs)[],
): boolean {
  return keys.every((key) => prefs[key]);
}

export function groupPartial(
  prefs: ActivityFilterPrefs,
  keys: readonly (keyof ActivityFilterPrefs)[],
): boolean {
  const on = keys.filter((key) => prefs[key]).length;
  return on > 0 && on < keys.length;
}
