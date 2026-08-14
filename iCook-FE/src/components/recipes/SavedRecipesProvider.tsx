"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  CATALOG_RECIPES,
  type CatalogRecipe,
  type Recipe,
  type RecipeCategorySlug,
  recipeHasCategory,
} from "@/components/recipes/recipesData";

export type { CatalogRecipe, Recipe, RecipeCategorySlug };
export { CATALOG_RECIPES } from "@/components/recipes/recipesData";

export const RECIPE_CATEGORIES = [
  { label: "Breakfast", slug: "breakfast", icon: "/icons/recipes/breakfast.png" },
  { label: "Lunch", slug: "lunch", icon: "/icons/recipes/lunch.png" },
  { label: "Dinner", slug: "dinner", icon: "/icons/recipes/dinner.png" },
  { label: "Snacks", slug: "snacks", icon: "/icons/recipes/snacks.png" },
  { label: "Sweets", slug: "sweets", icon: "/icons/recipes/sweets.png" },
  { label: "Fruity", slug: "fruity", icon: "/icons/recipes/fruity.png" },
  { label: "Toasty", slug: "toasty", icon: "/icons/recipes/toasty.png" },
  { label: "Savoury", slug: "savoury", icon: "/icons/recipes/savoury.png" },
  { label: "Pasta", slug: "pasta", icon: "/icons/recipes/pasta.png" },
  { label: "More to Love", slug: "loved", icon: "/icons/recipes/all.png" },
] as const;

export function getCategoryLabel(slug: string | undefined): string {
  if (!slug || slug === "all") return "More Recipes";
  if (slug === "loved") return "More to Love";
  const match = RECIPE_CATEGORIES.find((c) => c.slug === slug);
  return match ? match.label : "More Recipes";
}

export function categoryHref(slug: string): string {
  if (slug === "loved") return "/recipes/more?sort=loved";
  return `/recipes/more?category=${slug}`;
}

export function filterRecipesByCategory(
  recipes: Recipe[],
  category: string | undefined,
): Recipe[] {
  if (!category || category === "all") return recipes;
  return recipes.filter((recipe) => recipeHasCategory(recipe, category));
}

/** Live bookmark total: community baseline + current user if saved. */
export function getLiveBookmarkCount(
  recipe: Pick<Recipe, "id" | "bookmarkCount">,
  savedIds: string[],
): number {
  return recipe.bookmarkCount + (savedIds.includes(recipe.id) ? 1 : 0);
}

/** Rank recipes most → least bookmarked. */
export function sortByMostBookmarked(
  recipes: Recipe[],
  savedIds: string[] = [],
): Recipe[] {
  return [...recipes].sort((a, b) => {
    const diff =
      getLiveBookmarkCount(b, savedIds) - getLiveBookmarkCount(a, savedIds);
    if (diff !== 0) return diff;
    return a.name.localeCompare(b.name);
  });
}

const STORAGE_KEY = "icook.savedRecipes";

type SavedEntry = { id: string; savedAt: number };

type SavedRecipesContextValue = {
  savedIds: string[];
  savedAtById: Record<string, number>;
  savedRecipes: Recipe[];
  isSaved: (id: string) => boolean;
  toggleSave: (recipe: Pick<Recipe, "id">) => void;
  unsave: (id: string) => void;
};

const SavedRecipesContext = createContext<SavedRecipesContextValue | null>(
  null,
);

function readSavedEntries(): SavedEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const fallbackAt = Date.now() - 14 * 60 * 60 * 1000;
    return parsed.flatMap((item): SavedEntry[] => {
      if (typeof item === "string") return [{ id: item, savedAt: fallbackAt }];
      if (
        item &&
        typeof item === "object" &&
        typeof item.id === "string"
      ) {
        return [
          {
            id: item.id,
            savedAt:
              typeof item.savedAt === "number" && Number.isFinite(item.savedAt)
                ? item.savedAt
                : fallbackAt,
          },
        ];
      }
      return [];
    });
  } catch {
    return [];
  }
}

export function SavedRecipesProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<SavedEntry[]>([]);

  useEffect(() => {
    setEntries(readSavedEntries());
  }, []);

  const persist = useCallback((next: SavedEntry[]) => {
    setEntries(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }, []);

  const savedIds = useMemo(() => entries.map((e) => e.id), [entries]);
  const savedAtById = useMemo(
    () => Object.fromEntries(entries.map((e) => [e.id, e.savedAt])),
    [entries],
  );

  const isSaved = useCallback(
    (id: string) => savedIds.includes(id),
    [savedIds],
  );

  const toggleSave = useCallback(
    (recipe: Pick<Recipe, "id">) => {
      persist(
        savedIds.includes(recipe.id)
          ? entries.filter((e) => e.id !== recipe.id)
          : [...entries, { id: recipe.id, savedAt: Date.now() }],
      );
    },
    [persist, savedIds, entries],
  );

  const unsave = useCallback(
    (id: string) => {
      persist(entries.filter((e) => e.id !== id));
    },
    [persist, entries],
  );

  const savedRecipes = useMemo(
    () =>
      savedIds
        .map((id) => CATALOG_RECIPES.find((r) => r.id === id))
        .filter((r): r is Recipe => Boolean(r)),
    [savedIds],
  );

  const value = useMemo(
    () => ({
      savedIds,
      savedAtById,
      savedRecipes,
      isSaved,
      toggleSave,
      unsave,
    }),
    [savedIds, savedAtById, savedRecipes, isSaved, toggleSave, unsave],
  );

  return (
    <SavedRecipesContext.Provider value={value}>
      {children}
    </SavedRecipesContext.Provider>
  );
}

export function useSavedRecipes() {
  const ctx = useContext(SavedRecipesContext);
  if (!ctx) {
    throw new Error("useSavedRecipes must be used within SavedRecipesProvider");
  }
  return ctx;
}
