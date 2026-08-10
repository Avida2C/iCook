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
  normalizeCategories,
  normalizeIngredientGroups,
  normalizeNutrition,
  normalizeTimeMinutes,
  primaryCategory,
  isRecipeCategory,
  resolveRecipeTags,
  type Recipe,
  type RecipeCategory,
  type RecipeIngredientGroup,
  type RecipeNutrition,
  type RecipeStep,
  type RecipeTag,
} from "@/components/recipes/recipesData";
import {
  coerceIngredientLines,
  type IngredientLine,
} from "@/components/ingredients/ingredientCatalog";

const POSTS_KEY = "icook.createdPosts";
const RECIPES_KEY = "icook.createdRecipes";
const DELETED_RECIPES_KEY = "icook.deletedRecipes";

export type CreatedPost = {
  id: string;
  title: string;
  body: string;
  category?: string;
  thumbnailUrl?: string;
  /** Optional recipe linked from the creator's own recipes. */
  linkedRecipeId?: string;
  createdAt: number;
};

export type CreatedRecipe = Recipe & {
  preview: string;
  createdAt: number;
};

export type RecipeInput = {
  name: string;
  categories: RecipeCategory[];
  description?: string;
  thumbnailUrl?: string;
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  servings?: number;
  nutrition?: RecipeNutrition;
  tags?: RecipeTag[];
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
    thumbnailUrl?: string;
    linkedRecipeId?: string;
  }) => CreatedPost;
  updatePost: (
    id: string,
    input: {
      title: string;
      body: string;
      category?: string;
      thumbnailUrl?: string;
      linkedRecipeId?: string;
    },
  ) => CreatedPost | null;
  deletePost: (id: string) => boolean;
  publishRecipe: (input: RecipeInput) => CreatedRecipe;
  updateRecipe: (id: string, input: RecipeInput) => CreatedRecipe;
  deleteRecipe: (id: string) => boolean;
  /** Seeded/catalog recipe ids the user removed from their collection. */
  deletedRecipeIds: string[];
  getPost: (id: string) => CreatedPost | undefined;
  getRecipe: (id: string) => CreatedRecipe | undefined;
  resolveRecipe: (id: string) => Recipe | undefined;
  activityItems: FeedItem[];
};

const CreatedContentContext =
  createContext<CreatedContentContextValue | null>(null);

function normalizeRecipeFields(input: RecipeInput, author: string): Omit<
  Recipe,
  "id" | "bookmarkCount"
> {
  const rawGroups =
    input.ingredientGroups?.filter(
      (g) =>
        g.title.trim() ||
        g.items.some((i: IngredientLine) => i.name.trim()),
    ) ?? [];
  const normalizedGroups = normalizeIngredientGroups(
    rawGroups.map((g) => ({
      title: g.title.trim() || "Ingredients",
      items: coerceIngredientLines(g.items),
    })),
  ).filter((g) => g.items.length > 0);

  const groups =
    normalizedGroups.length > 0
      ? normalizedGroups
      : [{ title: "Ingredients", items: [] }];

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

  const nutrition = normalizeNutrition(input.nutrition);
  const tags = resolveRecipeTags({
    ingredients,
    ingredientGroups: groups,
  });

  return {
    name: input.name.trim(),
    author,
    categories: normalizeCategories(input.categories),
    tags,
    description: (input.description ?? "").trim(),
    thumbnailUrl:
      input.thumbnailUrl?.trim() ||
      CATEGORY_THUMBNAILS[primaryCategory({ categories: normalizeCategories(input.categories) })],
    prepTime: normalizeTimeMinutes(input.prepTime),
    cookTime: normalizeTimeMinutes(input.cookTime),
    totalTime: normalizeTimeMinutes(input.totalTime),
    servings: Math.max(1, Number(input.servings) || 1),
    nutrition,
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

  const fromArray = Array.isArray(r.categories)
    ? (r.categories as unknown[]).filter(
        (c): c is RecipeCategory => typeof c === "string" && isRecipeCategory(c),
      )
    : [];
  const fromLegacy =
    typeof r.category === "string" && isRecipeCategory(r.category)
      ? [r.category]
      : [];
  const categories = normalizeCategories(
    fromArray.length > 0 ? fromArray : fromLegacy,
  );
  const ingredientGroups = normalizeIngredientGroups(
    Array.isArray(r.ingredientGroups)
      ? (r.ingredientGroups as { title: string; items: unknown[] }[])
      : [{ title: "Ingredients", items: [] }],
  );
  const ingredients = flatIngredientsFromGroups(ingredientGroups);
  const instructions = Array.isArray(r.instructions)
    ? (r.instructions as RecipeStep[])
    : [];
  const nutrition = normalizeNutrition(
    r.nutrition && typeof r.nutrition === "object"
      ? (r.nutrition as RecipeNutrition)
      : undefined,
  );
  const tags = resolveRecipeTags({
    ingredients,
    ingredientGroups,
  });

  return {
    id: r.id,
    name: r.name,
    author: typeof r.author === "string" ? r.author : fallbackAuthor,
    categories,
    tags,
    bookmarkCount: typeof r.bookmarkCount === "number" ? r.bookmarkCount : 0,
    description: typeof r.description === "string" ? r.description : "",
    thumbnailUrl: typeof r.thumbnailUrl === "string" ? r.thumbnailUrl : undefined,
    prepTime: normalizeTimeMinutes(
      typeof r.prepTime === "string" ? r.prepTime : undefined,
    ),
    cookTime: normalizeTimeMinutes(
      typeof r.cookTime === "string" ? r.cookTime : undefined,
    ),
    totalTime: normalizeTimeMinutes(
      typeof r.totalTime === "string" ? r.totalTime : undefined,
    ),
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
          : `A new ${primaryCategory({ categories })} recipe.`,
    createdAt: typeof r.createdAt === "number" ? r.createdAt : Date.now(),
  };
}

function coerceStoredPost(raw: unknown): CreatedPost | null {
  if (!raw || typeof raw !== "object") return null;
  const p = raw as Record<string, unknown>;
  if (typeof p.id !== "string" || typeof p.title !== "string") return null;
  if (typeof p.body !== "string") return null;
  return {
    id: p.id,
    title: p.title,
    body: p.body,
    category: typeof p.category === "string" ? p.category : undefined,
    thumbnailUrl:
      typeof p.thumbnailUrl === "string" ? p.thumbnailUrl : undefined,
    linkedRecipeId:
      typeof p.linkedRecipeId === "string" ? p.linkedRecipeId : undefined,
    createdAt: typeof p.createdAt === "number" ? p.createdAt : Date.now(),
  };
}

function readDeletedRecipeIds(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_RECIPES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string");
  } catch {
    return [];
  }
}

function writeDeletedRecipeIds(ids: string[]) {
  try {
    localStorage.setItem(DELETED_RECIPES_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

function readPosts(): CreatedPost[] {
  try {
    const raw = localStorage.getItem(POSTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(coerceStoredPost)
      .filter((p): p is CreatedPost => Boolean(p));
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
    thumbnailUrl: post.thumbnailUrl,
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
  const [deletedRecipeIds, setDeletedRecipeIds] = useState<string[]>([]);

  useEffect(() => {
    setPosts(readPosts());
    setRecipes(readRecipes(me.handle));
    setDeletedRecipeIds(readDeletedRecipeIds());
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
    (input: {
      title: string;
      body: string;
      category?: string;
      thumbnailUrl?: string;
      linkedRecipeId?: string;
    }) => {
      const linkedRecipeId = input.linkedRecipeId?.trim() || undefined;
      const post: CreatedPost = {
        id: `p-${Date.now()}`,
        title: input.title.trim(),
        body: input.body.trim(),
        category: input.category,
        thumbnailUrl: input.thumbnailUrl?.trim() || undefined,
        linkedRecipeId,
        createdAt: Date.now(),
      };
      persistPosts([post, ...posts]);
      return post;
    },
    [persistPosts, posts],
  );

  const updatePost = useCallback(
    (
      id: string,
      input: {
        title: string;
        body: string;
        category?: string;
        thumbnailUrl?: string;
        linkedRecipeId?: string;
      },
    ) => {
      const existing = posts.find((p) => p.id === id);
      if (!existing) return null;
      const updated: CreatedPost = {
        ...existing,
        title: input.title.trim(),
        body: input.body.trim(),
        category: input.category,
        thumbnailUrl: input.thumbnailUrl?.trim() || undefined,
        linkedRecipeId: input.linkedRecipeId?.trim() || undefined,
      };
      persistPosts(posts.map((p) => (p.id === id ? updated : p)));
      return updated;
    },
    [persistPosts, posts],
  );

  const deletePost = useCallback(
    (id: string) => {
      const exists = posts.some((p) => p.id === id);
      if (!exists) return false;
      persistPosts(posts.filter((p) => p.id !== id));
      return true;
    },
    [persistPosts, posts],
  );

  const publishRecipe = useCallback(
    (input: RecipeInput) => {
      const fields = normalizeRecipeFields(input, me.handle);
      const preview =
        input.preview?.trim() ||
        fields.description ||
        `A new ${primaryCategory(fields)} recipe from ${me.name}.`;
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
        `A new ${primaryCategory(fields)} recipe from ${me.name}.`;

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
      // Restored from deleted set if user re-publishes via edit.
      setDeletedRecipeIds((prev) => {
        if (!prev.includes(id)) return prev;
        const next = prev.filter((x) => x !== id);
        writeDeletedRecipeIds(next);
        return next;
      });
      return cloned;
    },
    [persistRecipes, recipes, me.handle, me.name],
  );

  const deleteRecipe = useCallback(
    (id: string) => {
      const inCreated = recipes.some((r) => r.id === id);
      if (inCreated) {
        persistRecipes(recipes.filter((r) => r.id !== id));
      }
      setDeletedRecipeIds((prev) => {
        if (prev.includes(id)) return prev;
        const next = [...prev, id];
        writeDeletedRecipeIds(next);
        return next;
      });
      return true;
    },
    [persistRecipes, recipes],
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
      updatePost,
      deletePost,
      publishRecipe,
      updateRecipe,
      deleteRecipe,
      deletedRecipeIds,
      getPost,
      getRecipe,
      resolveRecipe,
      activityItems,
    }),
    [
      posts,
      recipes,
      publishPost,
      updatePost,
      deletePost,
      publishRecipe,
      updateRecipe,
      deleteRecipe,
      deletedRecipeIds,
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
