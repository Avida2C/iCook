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
import { ACTIVITY_FEED } from "@/components/app/user/data";
import type { FeedItem } from "@/components/app/user/types";
import {
  useSavedRecipes,
  type CatalogRecipe,
} from "@/components/recipes/SavedRecipesProvider";
import { useCreatedContent } from "@/components/app/CreatedContentProvider";
import { useComments } from "@/components/app/CommentsProvider";
import { isProfileSeedEnabled } from "@/lib/accountData";

const STORAGE_KEY = "icook.likedPosts";

type LikedPost = { id: string; title: string };

type LikedPostsContextValue = {
  likedIds: string[];
  isLiked: (postId: string) => boolean;
  likeCount: (postId: string, baseLikes: number) => number;
  toggleLike: (post: LikedPost) => void;
  activityItems: FeedItem[];
};

const LikedPostsContext = createContext<LikedPostsContextValue | null>(null);

function readLikedPosts(): LikedPost[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is LikedPost =>
        item &&
        typeof item === "object" &&
        typeof item.id === "string" &&
        typeof item.title === "string",
    );
  } catch {
    return [];
  }
}

function youLikedPost(post: LikedPost): FeedItem {
  return {
    id: `you-liked-post-${post.id}`,
    kind: "like",
    self: true,
    time: "Just now",
    target: post.title,
    targetKind: "post",
    postId: post.id,
    unread: true,
  };
}

function youLikedRecipe(recipe: CatalogRecipe): FeedItem {
  return {
    id: `you-liked-recipe-${recipe.id}`,
    kind: "like",
    self: true,
    time: "Just now",
    target: recipe.name,
    targetKind: "recipe",
    recipeId: recipe.id,
    unread: true,
  };
}

function buildActivity(
  likedPosts: LikedPost[],
  savedRecipes: CatalogRecipe[],
  createdActivity: FeedItem[],
  commentActivity: FeedItem[],
  includeSeededFeed: boolean,
): FeedItem[] {
  const seeded = includeSeededFeed
    ? ACTIVITY_FEED.filter((item) => !(item.kind === "like" && item.self))
    : [];
  return [
    ...createdActivity,
    ...commentActivity,
    ...likedPosts.map(youLikedPost),
    ...savedRecipes.map(youLikedRecipe),
    ...seeded,
  ];
}

export function LikedPostsProvider({ children }: { children: ReactNode }) {
  const { savedRecipes } = useSavedRecipes();
  const { activityItems: createdActivity } = useCreatedContent();
  const { activityItems: commentActivity } = useComments();
  const [likedPosts, setLikedPosts] = useState<LikedPost[]>([]);
  const [seeded, setSeeded] = useState(true);

  useEffect(() => {
    setLikedPosts(readLikedPosts());
    setSeeded(isProfileSeedEnabled());
  }, []);

  const persist = useCallback((posts: LikedPost[]) => {
    setLikedPosts(posts);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    } catch {
      // ignore
    }
  }, []);

  const isLiked = useCallback(
    (postId: string) => likedPosts.some((p) => p.id === postId),
    [likedPosts],
  );

  const likeCount = useCallback(
    (postId: string, baseLikes: number) =>
      baseLikes + (likedPosts.some((p) => p.id === postId) ? 1 : 0),
    [likedPosts],
  );

  const toggleLike = useCallback(
    (post: LikedPost) => {
      const already = likedPosts.some((p) => p.id === post.id);
      persist(
        already
          ? likedPosts.filter((p) => p.id !== post.id)
          : [...likedPosts, post],
      );
    },
    [likedPosts, persist],
  );

  const likedIds = useMemo(() => likedPosts.map((p) => p.id), [likedPosts]);

  const activityItems = useMemo(
    () =>
      buildActivity(
        likedPosts,
        savedRecipes,
        createdActivity,
        commentActivity,
        seeded,
      ),
    [likedPosts, savedRecipes, createdActivity, commentActivity, seeded],
  );

  const value = useMemo(
    () => ({
      likedIds,
      isLiked,
      likeCount,
      toggleLike,
      activityItems,
    }),
    [likedIds, isLiked, likeCount, toggleLike, activityItems],
  );

  return (
    <LikedPostsContext.Provider value={value}>
      {children}
    </LikedPostsContext.Provider>
  );
}

export function useLikedPosts() {
  const ctx = useContext(LikedPostsContext);
  if (!ctx) {
    throw new Error("useLikedPosts must be used within LikedPostsProvider");
  }
  return ctx;
}
