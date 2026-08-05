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

export type RecipeCategorySlug =
  | "breakfast"
  | "lunch"
  | "dinner"
  | "snacks"
  | "sweets"
  | "fruity"
  | "toasty"
  | "savoury"
  | "pasta"
  | "all"
  | "loved";

export type CatalogRecipe = {
  id: string;
  name: string;
  author: string;
  category: Exclude<RecipeCategorySlug, "all" | "loved">;
  /** Community bookmark baseline (other users). Current user save adds +1 at runtime. */
  bookmarkCount: number;
  /** Ingredient names used for pantry matching in search. */
  ingredients: string[];
};

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

/** Shared recipes that appear in Discover/Recipes and can be saved. */
export const CATALOG_RECIPES: CatalogRecipe[] = [
  {
    id: "1",
    name: "Ricotta Ravioli",
    author: "courtneyhenry",
    category: "pasta",
    bookmarkCount: 128,
    ingredients: ["Flour", "Eggs", "Ricotta", "Basil", "Olive Oil", "Salt", "Black Pepper", "Spinach", "Nutmeg"],
  },
  {
    id: "2",
    name: "Egg on Toast",
    author: "chefamy",
    category: "toasty",
    bookmarkCount: 96,
    ingredients: ["Eggs", "Olive Oil", "Salt", "Black Pepper", "Butter"],
  },
  {
    id: "3",
    name: "Blueberry Pancakes",
    author: "bakerben",
    category: "breakfast",
    bookmarkCount: 112,
    ingredients: ["Flour", "Eggs", "Milk", "Butter", "Sugar", "Blueberries", "Lemon"],
  },
  {
    id: "4",
    name: "Pasta Salad",
    author: "courtneyhenry",
    category: "lunch",
    bookmarkCount: 74,
    ingredients: ["Pasta", "Olive Oil", "Lemon", "Garlic Cloves", "Parsley", "Salt", "Black Pepper", "Tomatoes"],
  },
  {
    id: "5",
    name: "Pork Roast",
    author: "grillguy",
    category: "dinner",
    bookmarkCount: 88,
    ingredients: ["Pork", "Garlic Cloves", "Dried Rosemary", "Dried Thyme", "Olive Oil", "Salt", "Black Pepper"],
  },
  {
    id: "6",
    name: "Chocolate Cookies",
    author: "sweetsue",
    category: "sweets",
    bookmarkCount: 141,
    ingredients: ["Flour", "Butter", "Sugar", "Eggs", "Chocolate", "Vanilla Extract", "Salt"],
  },
  {
    id: "7",
    name: "Traditional Ravioli",
    author: "courtneyhenry",
    category: "pasta",
    bookmarkCount: 63,
    ingredients: ["Flour", "Eggs", "Ricotta", "Olive Oil", "Salt", "Basil"],
  },
  {
    id: "8",
    name: "Egg & Tomatoes on Toast",
    author: "chefamy",
    category: "toasty",
    bookmarkCount: 51,
    ingredients: ["Eggs", "Tomatoes", "Olive Oil", "Garlic Cloves", "Salt", "Black Pepper", "Basil"],
  },
  {
    id: "9",
    name: "Popcorn",
    author: "snacksam",
    category: "snacks",
    bookmarkCount: 39,
    ingredients: ["Olive Oil", "Salt", "Butter"],
  },
  {
    id: "10",
    name: "Roast Pork",
    author: "grillguy",
    category: "dinner",
    bookmarkCount: 57,
    ingredients: ["Pork", "Garlic Cloves", "Dried Rosemary", "Olive Oil", "Salt", "Black Pepper", "Lemon"],
  },
  {
    id: "11",
    name: "Salmon with Roast Potatoes",
    author: "fishfan",
    category: "dinner",
    bookmarkCount: 82,
    ingredients: ["Salmon", "Potatoes", "Olive Oil", "Lemon", "Dill", "Salt", "Black Pepper", "Garlic Cloves"],
  },
  {
    id: "12",
    name: "Steak and Potato Jacket",
    author: "grillguy",
    category: "savoury",
    bookmarkCount: 69,
    ingredients: ["Steak", "Potatoes", "Olive Oil", "Salt", "Black Pepper", "Garlic Cloves", "Butter"],
  },
  {
    id: "13",
    name: "Raspberry Cheesecake",
    author: "sweetsue",
    category: "fruity",
    bookmarkCount: 104,
    ingredients: ["Raspberries", "Sugar", "Butter", "Vanilla Extract", "Lemon", "Yogurt"],
  },
];

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
  recipes: CatalogRecipe[],
  category: string | undefined,
): CatalogRecipe[] {
  if (!category || category === "all") return recipes;
  return recipes.filter((recipe) => recipe.category === category);
}

/** Live bookmark total: community baseline + current user if saved. */
export function getLiveBookmarkCount(
  recipe: CatalogRecipe,
  savedIds: string[],
): number {
  return recipe.bookmarkCount + (savedIds.includes(recipe.id) ? 1 : 0);
}

/** Rank recipes most → least bookmarked. */
export function sortByMostBookmarked(
  recipes: CatalogRecipe[],
  savedIds: string[] = [],
): CatalogRecipe[] {
  return [...recipes].sort((a, b) => {
    const diff =
      getLiveBookmarkCount(b, savedIds) - getLiveBookmarkCount(a, savedIds);
    if (diff !== 0) return diff;
    return a.name.localeCompare(b.name);
  });
}

const STORAGE_KEY = "icook.savedRecipes";

type SavedRecipesContextValue = {
  savedIds: string[];
  savedRecipes: CatalogRecipe[];
  isSaved: (id: string) => boolean;
  toggleSave: (recipe: CatalogRecipe) => void;
  unsave: (id: string) => void;
};

const SavedRecipesContext = createContext<SavedRecipesContextValue | null>(
  null,
);

function readSavedIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

export function SavedRecipesProvider({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    setSavedIds(readSavedIds());
  }, []);

  const persist = useCallback((ids: string[]) => {
    setSavedIds(ids);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      // ignore
    }
  }, []);

  const isSaved = useCallback(
    (id: string) => savedIds.includes(id),
    [savedIds],
  );

  const toggleSave = useCallback(
    (recipe: CatalogRecipe) => {
      persist(
        savedIds.includes(recipe.id)
          ? savedIds.filter((id) => id !== recipe.id)
          : [...savedIds, recipe.id],
      );
    },
    [persist, savedIds],
  );

  const unsave = useCallback(
    (id: string) => {
      persist(savedIds.filter((savedId) => savedId !== id));
    },
    [persist, savedIds],
  );

  const savedRecipes = useMemo(
    () =>
      savedIds
        .map((id) => CATALOG_RECIPES.find((r) => r.id === id))
        .filter((r): r is CatalogRecipe => Boolean(r)),
    [savedIds],
  );

  const value = useMemo(
    () => ({ savedIds, savedRecipes, isSaved, toggleSave, unsave }),
    [savedIds, savedRecipes, isSaved, toggleSave, unsave],
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
