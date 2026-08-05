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
import type { CatalogRecipe, RecipeCategorySlug } from "@/components/recipes/SavedRecipesProvider";

const POSTS_KEY = "icook.createdPosts";
const RECIPES_KEY = "icook.createdRecipes";

export type CreatedPost = {
  id: string;
  title: string;
  body: string;
  category?: string;
  createdAt: number;
};

export type CreatedRecipe = CatalogRecipe & {
  preview: string;
  createdAt: number;
};

type CreatedContentContextValue = {
  posts: CreatedPost[];
  recipes: CreatedRecipe[];
  publishPost: (input: {
    title: string;
    body: string;
    category?: string;
  }) => CreatedPost;
  publishRecipe: (input: {
    name: string;
    category: Exclude<RecipeCategorySlug, "all" | "loved">;
    preview?: string;
  }) => CreatedRecipe;
  getPost: (id: string) => CreatedPost | undefined;
  getRecipe: (id: string) => CreatedRecipe | undefined;
  activityItems: FeedItem[];
};

const CreatedContentContext =
  createContext<CreatedContentContextValue | null>(null);

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

function readRecipes(): CreatedRecipe[] {
  try {
    const raw = localStorage.getItem(RECIPES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((r) => ({
      ...r,
      ingredients: Array.isArray(r?.ingredients) ? r.ingredients : [],
    }));
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
    setRecipes(readRecipes());
  }, []);

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
    (input: {
      name: string;
      category: Exclude<RecipeCategorySlug, "all" | "loved">;
      preview?: string;
    }) => {
      const recipe: CreatedRecipe = {
        id: `r-${Date.now()}`,
        name: input.name.trim(),
        author: me.handle,
        category: input.category,
        bookmarkCount: 0,
        ingredients: [],
        preview:
          input.preview?.trim() ||
          `A new ${input.category} recipe from ${me.name}.`,
        createdAt: Date.now(),
      };
      persistRecipes([recipe, ...recipes]);
      return recipe;
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
      getPost,
      getRecipe,
      activityItems,
    }),
    [
      posts,
      recipes,
      publishPost,
      publishRecipe,
      getPost,
      getRecipe,
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
