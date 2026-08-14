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
import { activityFromPeopleYouFollow } from "@/components/app/user/followingActivity";
import { useCurrentFeedUser } from "@/components/app/user/useCurrentFeedUser";
import {
  useSavedRecipes,
  type CatalogRecipe,
} from "@/components/recipes/SavedRecipesProvider";
import { useCreatedContent } from "@/components/app/CreatedContentProvider";
import { useComments } from "@/components/app/CommentsProvider";
import {
  FOLLOWING_CHANGED_EVENT,
  isProfileSeedEnabled,
  readFollowing,
} from "@/lib/accountData";
import {
  formatActivityAge,
  isNewActivity,
  NEW_ACTIVITY_MS,
} from "@/lib/publishVisibility";
import {
  readViewedActivityIds,
  writeViewedActivityIds,
} from "@/lib/viewedActivity";

const STORAGE_KEY = "icook.likedPosts";

type LikedPost = { id: string; title: string; likedAt: number };

type LikedPostsContextValue = {
  likedIds: string[];
  isLiked: (postId: string) => boolean;
  likeCount: (postId: string, baseLikes: number) => number;
  toggleLike: (post: { id: string; title: string }) => void;
  activityItems: FeedItem[];
  markActivityViewed: (ids: string | string[]) => void;
};

const LikedPostsContext = createContext<LikedPostsContextValue | null>(null);

function readLikedPosts(): LikedPost[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const fallbackAt = Date.now() - NEW_ACTIVITY_MS;
    return parsed.flatMap((item): LikedPost[] => {
      if (
        !item ||
        typeof item !== "object" ||
        typeof item.id !== "string" ||
        typeof item.title !== "string"
      ) {
        return [];
      }
      return [
        {
          id: item.id,
          title: item.title,
          likedAt:
            typeof item.likedAt === "number" && Number.isFinite(item.likedAt)
              ? item.likedAt
              : fallbackAt,
        },
      ];
    });
  } catch {
    return [];
  }
}

function youLikedPost(post: LikedPost, now: number): FeedItem {
  return {
    id: `you-liked-post-${post.id}`,
    kind: "like",
    self: true,
    time: formatActivityAge(post.likedAt, now),
    createdAt: post.likedAt,
    target: post.title,
    targetKind: "post",
    postId: post.id,
    unread: isNewActivity(post.likedAt, now),
  };
}

function youLikedRecipe(
  recipe: CatalogRecipe,
  savedAt: number,
  now: number,
): FeedItem {
  return {
    id: `you-liked-recipe-${recipe.id}`,
    kind: "like",
    self: true,
    time: formatActivityAge(savedAt, now),
    createdAt: savedAt,
    target: recipe.name,
    targetKind: "recipe",
    recipeId: recipe.id,
    unread: isNewActivity(savedAt, now),
  };
}

function withLiveAge(
  item: FeedItem,
  now: number,
  viewedIds: Set<string>,
): FeedItem {
  const viewed = viewedIds.has(item.id);
  if (typeof item.createdAt !== "number") {
    return viewed && item.unread ? { ...item, unread: false } : item;
  }
  return {
    ...item,
    time: formatActivityAge(item.createdAt, now),
    unread: !viewed && isNewActivity(item.createdAt, now),
  };
}

function buildActivity(
  likedPosts: LikedPost[],
  savedRecipes: CatalogRecipe[],
  savedAtById: Record<string, number>,
  createdActivity: FeedItem[],
  commentActivity: FeedItem[],
  followingActivity: FeedItem[],
  includeSeededSocial: boolean,
  viewedIds: Set<string>,
  now: number,
): FeedItem[] {
  const seededFollows = includeSeededSocial
    ? ACTIVITY_FEED.filter((item) => item.kind === "follow")
    : [];
  const seen = new Set<string>();
  const merged: FeedItem[] = [];
  for (const item of [
    ...createdActivity,
    ...commentActivity,
    ...likedPosts.map((post) => youLikedPost(post, now)),
    ...savedRecipes.map((recipe) =>
      youLikedRecipe(recipe, savedAtById[recipe.id] ?? now, now),
    ),
    ...followingActivity,
    ...seededFollows,
  ]) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    merged.push(withLiveAge(item, now, viewedIds));
  }
  return merged.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
}

export function LikedPostsProvider({ children }: { children: ReactNode }) {
  const me = useCurrentFeedUser();
  const { savedRecipes, savedAtById } = useSavedRecipes();
  const {
    activityItems: createdActivity,
    visiblePosts,
    visibleRecipes,
  } = useCreatedContent();
  const { activityItems: commentActivity } = useComments();
  const [likedPosts, setLikedPosts] = useState<LikedPost[]>([]);
  const [seeded, setSeeded] = useState(true);
  const [following, setFollowing] = useState<string[]>([]);
  const [viewedIds, setViewedIds] = useState<Set<string>>(() => new Set());
  const [nowTick, setNowTick] = useState(() => Date.now());

  useEffect(() => {
    setLikedPosts(readLikedPosts());
    setSeeded(isProfileSeedEnabled());
    setFollowing(readFollowing());
    setViewedIds(readViewedActivityIds());
  }, []);

  useEffect(() => {
    const syncFollowing = () => setFollowing(readFollowing());
    window.addEventListener("focus", syncFollowing);
    window.addEventListener(FOLLOWING_CHANGED_EVENT, syncFollowing);
    return () => {
      window.removeEventListener("focus", syncFollowing);
      window.removeEventListener(FOLLOWING_CHANGED_EVENT, syncFollowing);
    };
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setNowTick(Date.now()), 30_000);
    return () => window.clearInterval(id);
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
    (post: { id: string; title: string }) => {
      const already = likedPosts.some((p) => p.id === post.id);
      persist(
        already
          ? likedPosts.filter((p) => p.id !== post.id)
          : [...likedPosts, { ...post, likedAt: Date.now() }],
      );
    },
    [likedPosts, persist],
  );

  const likedIds = useMemo(() => likedPosts.map((p) => p.id), [likedPosts]);

  const followingActivity = useMemo(
    () =>
      activityFromPeopleYouFollow({
        following,
        me,
        createdPosts: visiblePosts,
        createdRecipes: visibleRecipes,
        now: nowTick,
      }),
    [following, me, visiblePosts, visibleRecipes, nowTick],
  );

  const activityItems = useMemo(
    () =>
      buildActivity(
        likedPosts,
        savedRecipes,
        savedAtById,
        createdActivity,
        commentActivity,
        followingActivity,
        seeded,
        viewedIds,
        nowTick,
      ),
    [
      likedPosts,
      savedRecipes,
      savedAtById,
      createdActivity,
      commentActivity,
      followingActivity,
      seeded,
      viewedIds,
      nowTick,
    ],
  );

  const markActivityViewed = useCallback((ids: string | string[]) => {
    const list = Array.isArray(ids) ? ids : [ids];
    if (list.length === 0) return;
    setViewedIds((prev) => {
      let changed = false;
      const next = new Set(prev);
      for (const id of list) {
        if (!id || next.has(id)) continue;
        next.add(id);
        changed = true;
      }
      if (!changed) return prev;
      writeViewedActivityIds(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      likedIds,
      isLiked,
      likeCount,
      toggleLike,
      activityItems,
      markActivityViewed,
    }),
    [likedIds, isLiked, likeCount, toggleLike, activityItems, markActivityViewed],
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
