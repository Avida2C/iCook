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
import { CURRENT_USER } from "@/components/app/user/data";
import type { FeedItem } from "@/components/app/user/types";
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
    category: Exclude<RecipeCategorySlug, "all">;
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
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function postActivityItem(post: CreatedPost): FeedItem {
  return {
    id: `my-post-${post.id}`,
    kind: "post",
    user: CURRENT_USER,
    time: "Just now",
    postId: post.id,
    title: post.title,
    preview: post.body.slice(0, 160),
    unread: true,
  };
}

function recipeActivityItem(recipe: CreatedRecipe): FeedItem {
  return {
    id: `my-recipe-${recipe.id}`,
    kind: "recipe",
    user: CURRENT_USER,
    time: "Just now",
    recipeId: recipe.id,
    recipeName: recipe.name,
    preview: recipe.preview,
    unread: true,
  };
}

export function CreatedContentProvider({ children }: { children: ReactNode }) {
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
      category: Exclude<RecipeCategorySlug, "all">;
      preview?: string;
    }) => {
      const recipe: CreatedRecipe = {
        id: `r-${Date.now()}`,
        name: input.name.trim(),
        author: CURRENT_USER.handle,
        category: input.category,
        bookmarkCount: 0,
        preview:
          input.preview?.trim() ||
          `A new ${input.category} recipe from ${CURRENT_USER.name}.`,
        createdAt: Date.now(),
      };
      persistRecipes([recipe, ...recipes]);
      return recipe;
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

  const activityItems = useMemo(
    () => [
      ...posts.map(postActivityItem),
      ...recipes.map(recipeActivityItem),
    ],
    [posts, recipes],
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
