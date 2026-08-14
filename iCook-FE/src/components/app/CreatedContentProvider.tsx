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
import { isOwnAuthor } from "@/components/app/user/authors";
import type { FeedItem, FeedUser } from "@/components/app/user/types";
import {
  PUBLISH_EMBARGO_MS,
  canViewerSeePublishedItem,
  formatActivityAge,
  isNewActivity,
  mergePublicRecipes,
} from "@/lib/publishVisibility";
import { plainTextFromHtml } from "@/lib/postRichText";
import {
  CATALOG_RECIPES,
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
import {
  readFeaturedRecipePrefs,
  writeFeaturedRecipePrefs,
} from "@/lib/featuredRecipePrefs";

const POSTS_KEY = "icook.createdPosts";
const RECIPES_KEY = "icook.createdRecipes";
const DELETED_RECIPES_KEY = "icook.deletedRecipes";

export type CreatedPost = {
  id: string;
  title: string;
  body: string;
  /** Creator handle — used to keep new posts private for an hour. */
  author: string;
  category?: string;
  thumbnailUrl?: string;
  /** Optional recipe linked from the creator's own recipes. */
  linkedRecipeId?: string;
  createdAt: number;
  /** When true, only the creator can see the post (no public publish). */
  isPrivate?: boolean;
};

export type CreatedRecipe = Recipe & {
  preview: string;
  createdAt: number;
  /** When true, only the creator can see the recipe (no public publish). */
  isPrivate?: boolean;
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
  /** Created posts the current viewer may see (own always; others after 1h). */
  visiblePosts: CreatedPost[];
  /** Created recipes the current viewer may see (own always; others after 1h). */
  visibleRecipes: CreatedRecipe[];
  /** Visible created recipes merged ahead of the static catalog. */
  publicRecipes: Recipe[];
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
  setPostPrivate: (id: string, isPrivate: boolean) => boolean;
  publishRecipe: (input: RecipeInput) => CreatedRecipe;
  updateRecipe: (id: string, input: RecipeInput) => CreatedRecipe;
  deleteRecipe: (id: string) => boolean;
  setRecipePrivate: (id: string, isPrivate: boolean) => boolean;
  /** Seeded/catalog recipe ids the user removed from their collection. */
  deletedRecipeIds: string[];
  getPost: (id: string) => CreatedPost | undefined;
  getRecipe: (id: string) => CreatedRecipe | undefined;
  resolveRecipe: (id: string) => Recipe | undefined;
  getVisiblePost: (id: string) => CreatedPost | undefined;
  resolveVisibleRecipe: (id: string) => Recipe | undefined;
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
    isPrivate: r.isPrivate === true,
  };
}

function coerceStoredPost(raw: unknown, fallbackAuthor: string): CreatedPost | null {
  if (!raw || typeof raw !== "object") return null;
  const p = raw as Record<string, unknown>;
  if (typeof p.id !== "string" || typeof p.title !== "string") return null;
  if (typeof p.body !== "string") return null;
  return {
    id: p.id,
    title: p.title,
    body: p.body,
    author: typeof p.author === "string" ? p.author : fallbackAuthor,
    category: typeof p.category === "string" ? p.category : undefined,
    thumbnailUrl:
      typeof p.thumbnailUrl === "string" ? p.thumbnailUrl : undefined,
    linkedRecipeId:
      typeof p.linkedRecipeId === "string" ? p.linkedRecipeId : undefined,
    createdAt: typeof p.createdAt === "number" ? p.createdAt : Date.now(),
    isPrivate: p.isPrivate === true,
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

function readPosts(fallbackAuthor: string): CreatedPost[] {
  try {
    const raw = localStorage.getItem(POSTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => coerceStoredPost(item, fallbackAuthor))
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

function postActivityItem(
  post: CreatedPost,
  user: FeedUser,
  now: number,
): FeedItem {
  return {
    id: `my-post-${post.id}`,
    kind: "post",
    user,
    time: formatActivityAge(post.createdAt, now),
    createdAt: post.createdAt,
    postId: post.id,
    title: post.title,
    preview: plainTextFromHtml(post.body).slice(0, 160),
    thumbnailUrl: post.thumbnailUrl,
    unread: isNewActivity(post.createdAt, now),
  };
}

function recipeActivityItem(
  recipe: CreatedRecipe,
  user: FeedUser,
  now: number,
): FeedItem {
  return {
    id: `my-recipe-${recipe.id}`,
    kind: "recipe",
    user,
    time: formatActivityAge(recipe.createdAt, now),
    createdAt: recipe.createdAt,
    recipeId: recipe.id,
    recipeName: recipe.name,
    preview: recipe.preview,
    unread: isNewActivity(recipe.createdAt, now),
  };
}

export function CreatedContentProvider({ children }: { children: ReactNode }) {
  const me = useCurrentFeedUser();
  const [posts, setPosts] = useState<CreatedPost[]>([]);
  const [recipes, setRecipes] = useState<CreatedRecipe[]>([]);
  const [deletedRecipeIds, setDeletedRecipeIds] = useState<string[]>([]);
  const [nowTick, setNowTick] = useState(() => Date.now());

  useEffect(() => {
    setPosts(readPosts(me.handle));
    setRecipes(readRecipes(me.handle));
    setDeletedRecipeIds(readDeletedRecipeIds());
  }, [me.handle]);

  useEffect(() => {
    const nextExpiry = [...posts, ...recipes]
      .map((item) => item.createdAt + PUBLISH_EMBARGO_MS)
      .filter((at) => at > nowTick)
      .sort((a, b) => a - b)[0];
    if (nextExpiry == null) return;
    const delay = Math.max(nextExpiry - Date.now(), 50);
    const id = window.setTimeout(() => setNowTick(Date.now()), delay);
    return () => window.clearTimeout(id);
  }, [posts, recipes, nowTick]);

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
        author: me.handle,
        category: input.category,
        thumbnailUrl: input.thumbnailUrl?.trim() || undefined,
        linkedRecipeId,
        createdAt: Date.now(),
        isPrivate: false,
      };
      persistPosts([post, ...posts]);
      return post;
    },
    [persistPosts, posts, me.handle],
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

  const setPostPrivate = useCallback(
    (id: string, isPrivate: boolean) => {
      const existing = posts.find((p) => p.id === id);
      if (!existing) return false;
      persistPosts(posts.map((p) => (p.id === id ? { ...p, isPrivate } : p)));
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
        isPrivate: false,
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
          isPrivate: existing.isPrivate,
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
        isPrivate: false,
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

  const setRecipePrivate = useCallback(
    (id: string, isPrivate: boolean) => {
      const existing = recipes.find((r) => r.id === id);
      if (!existing) return false;
      persistRecipes(
        recipes.map((r) => (r.id === id ? { ...r, isPrivate } : r)),
      );
      if (isPrivate) {
        const prefs = readFeaturedRecipePrefs(me.handle);
        if (prefs.recipeId === id) {
          writeFeaturedRecipePrefs(me.handle, { ...prefs, recipeId: null });
        }
      }
      return true;
    },
    [persistRecipes, recipes, me.handle],
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

  const visiblePosts = useMemo(
    () =>
      posts.filter((post) =>
        canViewerSeePublishedItem(
          post.createdAt,
          post.author,
          me,
          nowTick,
          post.isPrivate,
        ),
      ),
    [posts, me, nowTick],
  );

  const visibleRecipes = useMemo(
    () =>
      recipes.filter((recipe) =>
        canViewerSeePublishedItem(
          recipe.createdAt,
          recipe.author,
          me,
          nowTick,
          recipe.isPrivate,
        ),
      ),
    [recipes, me, nowTick],
  );

  const publicRecipes = useMemo(
    () =>
      mergePublicRecipes(
        visibleRecipes.filter((recipe) => !recipe.isPrivate),
        CATALOG_RECIPES,
      ),
    [visibleRecipes],
  );

  const getVisiblePost = useCallback(
    (id: string) => visiblePosts.find((p) => p.id === id),
    [visiblePosts],
  );

  const resolveVisibleRecipe = useCallback(
    (id: string) => {
      const created = getRecipe(id);
      if (created) {
        if (
          canViewerSeePublishedItem(
            created.createdAt,
            created.author,
            me,
            nowTick,
            created.isPrivate,
          )
        ) {
          return created;
        }
        return getCatalogRecipe(id);
      }
      return getCatalogRecipe(id);
    },
    [getRecipe, me, nowTick],
  );

  const activityItems = useMemo(
    () =>
      [
        ...posts
          .filter((post) => isOwnAuthor(post.author, me))
          .map((post) => ({
            at: post.createdAt,
            item: postActivityItem(post, me, nowTick),
          })),
        ...recipes
          .filter((recipe) => isOwnAuthor(recipe.author, me))
          .map((recipe) => ({
            at: recipe.createdAt,
            item: recipeActivityItem(recipe, me, nowTick),
          })),
      ]
        .sort((a, b) => b.at - a.at)
        .map(({ item }) => item),
    [posts, recipes, me, nowTick],
  );

  const value = useMemo(
    () => ({
      posts,
      recipes,
      visiblePosts,
      visibleRecipes,
      publicRecipes,
      publishPost,
      updatePost,
      deletePost,
      setPostPrivate,
      publishRecipe,
      updateRecipe,
      deleteRecipe,
      setRecipePrivate,
      deletedRecipeIds,
      getPost,
      getRecipe,
      resolveRecipe,
      getVisiblePost,
      resolveVisibleRecipe,
      activityItems,
    }),
    [
      posts,
      recipes,
      visiblePosts,
      visibleRecipes,
      publicRecipes,
      publishPost,
      updatePost,
      deletePost,
      setPostPrivate,
      publishRecipe,
      updateRecipe,
      deleteRecipe,
      setRecipePrivate,
      deletedRecipeIds,
      getPost,
      getRecipe,
      resolveRecipe,
      getVisiblePost,
      resolveVisibleRecipe,
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
