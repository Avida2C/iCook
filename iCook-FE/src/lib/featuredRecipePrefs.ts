/** Per-handle featured recipe prefs for public profiles (local demo store). */

export type FeaturedRecipeLayout = "hero" | "banner";

export type FeaturedRecipePrefs = {
  /** Created-recipe id to feature, or null for none. */
  recipeId: string | null;
  layout: FeaturedRecipeLayout;
};

export const DEFAULT_FEATURED_RECIPE_PREFS: FeaturedRecipePrefs = {
  recipeId: null,
  layout: "hero",
};

const STORAGE_KEY = "icook.featuredRecipePrefs";

type PrefsByHandle = Record<string, FeaturedRecipePrefs>;

function normalizeHandle(handle: string): string {
  return handle.trim().replace(/^@+/, "").toLowerCase();
}

function normalizePrefs(raw: unknown): FeaturedRecipePrefs {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_FEATURED_RECIPE_PREFS };
  const o = raw as Record<string, unknown>;
  const layout: FeaturedRecipeLayout = "hero";
  const recipeId =
    typeof o.recipeId === "string" && o.recipeId.trim()
      ? o.recipeId.trim()
      : null;
  return { recipeId, layout };
}

function readAll(): PrefsByHandle {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    // Legacy single-prefs shape (no handle map)
    if ("recipeId" in parsed || "layout" in parsed) {
      return {};
    }
    const out: PrefsByHandle = {};
    for (const [handle, value] of Object.entries(parsed)) {
      out[normalizeHandle(handle)] = normalizePrefs(value);
    }
    return out;
  } catch {
    return {};
  }
}

function writeAll(all: PrefsByHandle) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
}

export function readFeaturedRecipePrefs(handle: string): FeaturedRecipePrefs {
  const all = readAll();
  return all[normalizeHandle(handle)] ?? { ...DEFAULT_FEATURED_RECIPE_PREFS };
}

export function writeFeaturedRecipePrefs(
  handle: string,
  prefs: FeaturedRecipePrefs,
) {
  const key = normalizeHandle(handle);
  const all = readAll();
  all[key] = normalizePrefs(prefs);
  writeAll(all);
}

export function clearFeaturedRecipePrefs() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
