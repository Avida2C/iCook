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
import { useCurrentFeedUser } from "@/components/app/user/useCurrentFeedUser";
import type { FeedItem, FeedUser } from "@/components/app/user/types";
import {
  flatIngredientsFromGroups,
  getCatalogRecipe,
  CATEGORY_THUMBNAILS,
  type Recipe,
  type RecipeCategory,
  type RecipeIngredientGroup,
  type RecipeNutrition,
  type RecipeStep,
} from "@/components/recipes/recipesData";

const POSTS_KEY = "icook.createdPosts";
const RECIPES_KEY = "icook.createdRecipes";

export type CreatedPost = {
  id: string;
  title: string;
  body: string;
  category?: string;
  createdAt: number;
};

export type CreatedRecipe = Recipe & {
  preview: string;
  createdAt: number;
};

export type RecipeInput = {
  name: string;
  category: RecipeCategory;
  description?: string;
  thumbnailUrl?: string;
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  servings?: number;
  nutrition?: RecipeNutrition;
  ingredientGroups?: RecipeIngredientGroup[];
  ingredients?: string[];
  instructions?: RecipeStep[];
  preview?: string;
};

type CreatedContentContextValue = {
  posts: CreatedPost[];
  recipes: CreatedRecipe[];
  publishPost: (input: {
    title: string;
    body: string;
    category?: string;
  }) => CreatedPost;
  publishRecipe: (input: RecipeInput) => CreatedRecipe;
  updateRecipe: (id: string, input: RecipeInput) => CreatedRecipe;
  getPost: (id: string) => CreatedPost | undefined;
  getRecipe: (id: string) => CreatedRecipe | undefined;
  resolveRecipe: (id: string) => Recipe | undefined;
  activityItems: FeedItem[];
};

const CreatedContentContext =
  createContext<CreatedContentContextValue | null>(null);

function defaultNutrition(): RecipeNutrition {
  return { fat: "0g", carbs: "0g", protein: "0g", sodium: "0" };
}

function normalizeRecipeFields(input: RecipeInput, author: string): Omit<
  Recipe,
  "id" | "bookmarkCount"
> {
  const ingredientGroups =
    input.ingredientGroups?.filter((g) => g.title.trim() || g.items.some((i) => i.trim())) ??
    [];
  const normalizedGroups = ingredientGroups.map((g) => ({
    title: g.title.trim() || "Ingredients",
    items: g.items.map((i) => i.trim()).filter(Boolean),
  })).filter((g) => g.items.length > 0);

  const groups =
    normalizedGroups.length > 0
      ? normalizedGroups
      : [{ title: "Ingredients", items: [] as string[] }];

  const ingredients =
    input.ingredients?.filter(Boolean) ??
    flatIngredientsFromGroups(groups);

  const instructions = (input.instructions ?? [])
    .map((step, index) => ({
      n: step.n.trim() || `${index + 1}.0`,
      text: step.text.trim(),
      ...(step.imageUrl ? { imageUrl: step.imageUrl } : {}),
    }))
    .filter((step) => step.text);

  return {
    name: input.name.trim(),
    author,
    category: input.category,
    description: (input.description ?? "").trim(),
    thumbnailUrl:
      input.thumbnailUrl?.trim() ||
      CATEGORY_THUMBNAILS[input.category],
    prepTime: (input.prepTime ?? "").trim() || "—",
    cookTime: (input.cookTime ?? "").trim() || "—",
    totalTime: (input.totalTime ?? "").trim() || "—",
    servings: Math.max(1, Number(input.servings) || 1),
    nutrition: input.nutrition ?? defaultNutrition(),
    ingredientGroups: groups,
    ingredients,
    instructions:
      instructions.length > 0
        ? instructions
        : [{ n: "1.0", text: "No instructions yet." }],
  };
}

function coerceStoredRecipe(raw: unknown, fallbackAuthor: string): CreatedRecipe | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== "string" || typeof r.name !== "string") return null;

  const category = (typeof r.category === "string" ? r.category : "dinner") as RecipeCategory;
  const ingredientGroups = Array.isArray(r.ingredientGroups)
    ? (r.ingredientGroups as RecipeIngredientGroup[])
    : [{ title: "Ingredients", items: [] }];
  const ingredients = Array.isArray(r.ingredients)
    ? (r.ingredients as string[])
    : flatIngredientsFromGroups(ingredientGroups);
  const instructions = Array.isArray(r.instructions)
    ? (r.instructions as RecipeStep[])
    : [];
  const nutrition =
    r.nutrition && typeof r.nutrition === "object"
      ? (r.nutrition as RecipeNutrition)
      : defaultNutrition();

  return {
    id: r.id,
    name: r.name,
    author: typeof r.author === "string" ? r.author : fallbackAuthor,
    category,
    bookmarkCount: typeof r.bookmarkCount === "number" ? r.bookmarkCount : 0,
    description: typeof r.description === "string" ? r.description : "",
    thumbnailUrl: typeof r.thumbnailUrl === "string" ? r.thumbnailUrl : undefined,
    prepTime: typeof r.prepTime === "string" ? r.prepTime : "—",
    cookTime: typeof r.cookTime === "string" ? r.cookTime : "—",
    totalTime: typeof r.totalTime === "string" ? r.totalTime : "—",
    servings: typeof r.servings === "number" ? r.servings : 1,
    nutrition,
    ingredientGroups,
    ingredients,
    instructions,
    preview:
      typeof r.preview === "string"
        ? r.preview
        : typeof r.description === "string" && r.description
          ? r.description
          : `A new ${category} recipe.`,
    createdAt: typeof r.createdAt === "number" ? r.createdAt : Date.now(),
  };
}

function readPosts(): CreatedPost[] {
  try {
    const raw = localStorage.getItem(POSTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readRecipes(fallbackAuthor: string): CreatedRecipe[] {
  try {
    const raw = localStorage.getItem(RECIPES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => coerceStoredRecipe(item, fallbackAuthor))
      .filter((r): r is CreatedRecipe => Boolean(r));
  } catch {
    return [];
  }
}

function postActivityItem(post: CreatedPost, user: FeedUser): FeedItem {
  return {
    id: `my-post-${post.id}`,
    kind: "post",
    user,
    time: "Just now",
    postId: post.id,
    title: post.title,
    preview: post.body.slice(0, 160),
    unread: true,
  };
}

function recipeActivityItem(recipe: CreatedRecipe, user: FeedUser): FeedItem {
  return {
    id: `my-recipe-${recipe.id}`,
    kind: "recipe",
    user,
    time: "Just now",
    recipeId: recipe.id,
    recipeName: recipe.name,
    preview: recipe.preview,
    unread: true,
  };
}

export function CreatedContentProvider({ children }: { children: ReactNode }) {
  const me = useCurrentFeedUser();
  const [posts, setPosts] = useState<CreatedPost[]>([]);
  const [recipes, setRecipes] = useState<CreatedRecipe[]>([]);

  useEffect(() => {
    setPosts(readPosts());
    setRecipes(readRecipes(me.handle));
  }, [me.handle]);

  const persistPosts = useCallback((next: CreatedPost[]) => {
    setPosts(next);
    try {
      localStorage.setItem(POSTS_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }, []);

  const persistRecipes = useCallback((next: CreatedRecipe[]) => {
    setRecipes(next);
    try {
      localStorage.setItem(RECIPES_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }, []);

  const publishPost = useCallback(
    (input: { title: string; body: string; category?: string }) => {
      const post: CreatedPost = {
        id: `p-${Date.now()}`,
        title: input.title.trim(),
        body: input.body.trim(),
        category: input.category,
        createdAt: Date.now(),
      };
      persistPosts([post, ...posts]);
      return post;
    },
    [persistPosts, posts],
  );

  const publishRecipe = useCallback(
    (input: RecipeInput) => {
      const fields = normalizeRecipeFields(input, me.handle);
      const preview =
        input.preview?.trim() ||
        fields.description ||
        `A new ${fields.category} recipe from ${me.name}.`;
      const recipe: CreatedRecipe = {
        ...fields,
        id: `r-${Date.now()}`,
        bookmarkCount: 0,
        preview,
        createdAt: Date.now(),
      };
      persistRecipes([recipe, ...recipes]);
      return recipe;
    },
    [persistRecipes, recipes, me.handle, me.name],
  );

  const updateRecipe = useCallback(
    (id: string, input: RecipeInput) => {
      const fields = normalizeRecipeFields(input, me.handle);
      const preview =
        input.preview?.trim() ||
        fields.description ||
        `A new ${fields.category} recipe from ${me.name}.`;

      const existing = recipes.find((r) => r.id === id);
      if (existing) {
        const updated: CreatedRecipe = {
          ...existing,
          ...fields,
          id: existing.id,
          bookmarkCount: existing.bookmarkCount,
          preview,
          createdAt: existing.createdAt,
        };
        persistRecipes(recipes.map((r) => (r.id === id ? updated : r)));
        return updated;
      }

      // Editing a catalog / seeded recipe: clone into created store so edits persist.
      const catalog = getCatalogRecipe(id);
      const cloned: CreatedRecipe = {
        ...fields,
        id,
        bookmarkCount: catalog?.bookmarkCount ?? 0,
        preview,
        createdAt: Date.now(),
      };
      persistRecipes([cloned, ...recipes]);
      return cloned;
    },
    [persistRecipes, recipes, me.handle, me.name],
  );

  const getPost = useCallback(
    (id: string) => posts.find((p) => p.id === id),
    [posts],
  );

  const getRecipe = useCallback(
    (id: string) => recipes.find((r) => r.id === id),
    [recipes],
  );

  const resolveRecipe = useCallback(
    (id: string) => getRecipe(id) ?? getCatalogRecipe(id),
    [getRecipe],
  );

  const activityItems = useMemo(
    () => [
      ...posts.map((post) => postActivityItem(post, me)),
      ...recipes.map((recipe) => recipeActivityItem(recipe, me)),
    ],
    [posts, recipes, me],
  );

  const value = useMemo(
    () => ({
      posts,
      recipes,
      publishPost,
      publishRecipe,
      updateRecipe,
      getPost,
      getRecipe,
      resolveRecipe,
      activityItems,
    }),
    [
      posts,
      recipes,
      publishPost,
      publishRecipe,
      updateRecipe,
      getPost,
      getRecipe,
      resolveRecipe,
      activityItems,
    ],
  );

  return (
    <CreatedContentContext.Provider value={value}>
      {children}
    </CreatedContentContext.Provider>
  );
}

export function useCreatedContent() {
  const ctx = useContext(CreatedContentContext);
  if (!ctx) {
    throw new Error(
      "useCreatedContent must be used within CreatedContentProvider",
    );
  }
  return ctx;
}
