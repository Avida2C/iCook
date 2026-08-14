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
  formatCommentTime,
  seedCommentsFor,
  type CommentTargetKind,
  type ContentComment,
} from "@/components/app/commentsData";
import { useCurrentFeedUser } from "@/components/app/user/useCurrentFeedUser";
import type { FeedItem, FeedUser } from "@/components/app/user/types";
import {
  CATALOG_RECIPES,
  type CatalogRecipe,
} from "@/components/recipes/SavedRecipesProvider";
import { useCreatedContent } from "@/components/app/CreatedContentProvider";
import { CURRENT_USER } from "@/components/app/user/data";
import { CATALOG_POSTS } from "@/components/app/postsData";
import { formatActivityAge, isNewActivity } from "@/lib/publishVisibility";

const STORAGE_KEY = "icook.contentComments";
const LEGACY_RECIPE_KEY = "icook.recipeComments";
const REPORTS_KEY = "icook.commentReports";
const HIDDEN_KEY = "icook.hiddenComments";

type StoredComment = {
  id: string;
  targetKind: CommentTargetKind;
  targetId: string;
  text: string;
  imageUrl?: string;
  time: string;
  createdAt: number;
  /** Title of the recipe/post at post time (for activity). */
  targetTitle: string;
  user: FeedUser;
};

type GetCommentsOptions = {
  /** When true, include comments the content owner has hidden (still marked). */
  includeHidden?: boolean;
};

type CommentsContextValue = {
  getComments: (
    targetKind: CommentTargetKind,
    targetId: string,
    options?: GetCommentsOptions,
  ) => ContentComment[];
  addComment: (input: {
    targetKind: CommentTargetKind;
    targetId: string;
    targetTitle: string;
    text: string;
    imageUrl?: string;
  }) => ContentComment | null;
  deleteComment: (commentId: string) => void;
  /** Flag a comment as inappropriate (hidden from the reporter). */
  reportComment: (commentId: string) => void;
  isCommentReported: (commentId: string) => boolean;
  /** Content owner hides a comment from public view. */
  hideComment: (commentId: string) => void;
  unhideComment: (commentId: string) => void;
  isCommentHidden: (commentId: string) => boolean;
  /** Comments on the signed-in user's content (for Activity). */
  activityItems: FeedItem[];
};

const CommentsContext = createContext<CommentsContextValue | null>(null);

function isFeedUser(value: unknown): value is FeedUser {
  return (
    !!value &&
    typeof value === "object" &&
    typeof (value as FeedUser).handle === "string" &&
    typeof (value as FeedUser).name === "string" &&
    typeof (value as FeedUser).initials === "string"
  );
}

function normalizeStored(item: unknown): StoredComment | null {
  if (!item || typeof item !== "object") return null;
  const raw = item as Record<string, unknown>;

  // Legacy recipe-only shape
  if (
    typeof raw.recipeId === "string" &&
    typeof raw.recipeName === "string" &&
    typeof raw.id === "string" &&
    typeof raw.text === "string" &&
    typeof raw.time === "string" &&
    typeof raw.createdAt === "number" &&
    isFeedUser(raw.user)
  ) {
    return {
      id: raw.id,
      targetKind: "recipe",
      targetId: raw.recipeId,
      targetTitle: raw.recipeName,
      text: raw.text,
      imageUrl: typeof raw.imageUrl === "string" ? raw.imageUrl : undefined,
      time: raw.time,
      createdAt: raw.createdAt,
      user: raw.user,
    };
  }

  if (
    (raw.targetKind === "recipe" || raw.targetKind === "post") &&
    typeof raw.targetId === "string" &&
    typeof raw.targetTitle === "string" &&
    typeof raw.id === "string" &&
    typeof raw.text === "string" &&
    typeof raw.time === "string" &&
    typeof raw.createdAt === "number" &&
    isFeedUser(raw.user)
  ) {
    return {
      id: raw.id,
      targetKind: raw.targetKind,
      targetId: raw.targetId,
      targetTitle: raw.targetTitle,
      text: raw.text,
      imageUrl: typeof raw.imageUrl === "string" ? raw.imageUrl : undefined,
      time: raw.time,
      createdAt: raw.createdAt,
      user: raw.user,
    };
  }

  return null;
}

function readStored(): StoredComment[] {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) ??
      localStorage.getItem(LEGACY_RECIPE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normalizeStored)
      .filter((item): item is StoredComment => item !== null);
  } catch {
    return [];
  }
}

function readIdSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(
      parsed.filter((id): id is string => typeof id === "string"),
    );
  } catch {
    return new Set();
  }
}

function writeIdSet(key: string, ids: Set<string>) {
  try {
    localStorage.setItem(key, JSON.stringify([...ids]));
  } catch {
    // ignore
  }
}

function toContentComment(
  c: StoredComment,
  hidden = false,
): ContentComment {
  return {
    id: c.id,
    targetKind: c.targetKind,
    targetId: c.targetId,
    user: c.user,
    text: c.text,
    imageUrl: c.imageUrl,
    time: c.time,
    createdAt: c.createdAt,
    hidden: hidden || undefined,
  };
}

function recipeAuthorHandle(
  recipeId: string,
  catalog: CatalogRecipe[],
  createdAuthorById: Map<string, string>,
): string | undefined {
  const created = createdAuthorById.get(recipeId);
  if (created) return created;
  return catalog.find((r) => r.id === recipeId)?.author;
}

function postAuthorHandle(
  postId: string,
  createdAuthorById: Map<string, string>,
): string | undefined {
  const created = createdAuthorById.get(postId);
  if (created) return created;
  return CATALOG_POSTS[postId]?.user.handle;
}

export function CommentsProvider({ children }: { children: ReactNode }) {
  const me = useCurrentFeedUser();
  const { recipes: createdRecipes, posts: createdPosts } = useCreatedContent();
  const [posted, setPosted] = useState<StoredComment[]>([]);
  const [reportedIds, setReportedIds] = useState<Set<string>>(new Set());
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loaded = readStored();
    setPosted(loaded);
    setReportedIds(readIdSet(REPORTS_KEY));
    setHiddenIds(readIdSet(HIDDEN_KEY));
    // Migrate legacy key into the shared store once.
    try {
      if (
        loaded.length > 0 &&
        !localStorage.getItem(STORAGE_KEY) &&
        localStorage.getItem(LEGACY_RECIPE_KEY)
      ) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(loaded));
      }
    } catch {
      // ignore
    }
  }, []);

  const persist = useCallback((next: StoredComment[]) => {
    setPosted(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }, []);

  const persistReported = useCallback((next: Set<string>) => {
    setReportedIds(next);
    writeIdSet(REPORTS_KEY, next);
  }, []);

  const persistHidden = useCallback((next: Set<string>) => {
    setHiddenIds(next);
    writeIdSet(HIDDEN_KEY, next);
  }, []);

  const getComments = useCallback(
    (
      targetKind: CommentTargetKind,
      targetId: string,
      options?: GetCommentsOptions,
    ) => {
      const includeHidden = options?.includeHidden === true;
      const seeded = seedCommentsFor(targetKind, targetId);
      const mine = posted
        .filter((c) => c.targetKind === targetKind && c.targetId === targetId)
        .map((c) => toContentComment(c, hiddenIds.has(c.id)));
      const seededWithFlags = seeded.map((c) => ({
        ...c,
        hidden: hiddenIds.has(c.id) || undefined,
      }));
      return [...mine, ...seededWithFlags]
        .filter((c) => !reportedIds.has(c.id))
        .filter((c) => includeHidden || !hiddenIds.has(c.id))
        .sort((a, b) => b.createdAt - a.createdAt);
    },
    [posted, reportedIds, hiddenIds],
  );

  const addComment = useCallback(
    (input: {
      targetKind: CommentTargetKind;
      targetId: string;
      targetTitle: string;
      text: string;
      imageUrl?: string;
    }) => {
      const text = input.text.trim();
      const imageUrl = input.imageUrl?.trim() || undefined;
      if (!text && !imageUrl) return null;

      const now = new Date();
      const comment: StoredComment = {
        id: `uc-${Date.now()}`,
        targetKind: input.targetKind,
        targetId: input.targetId,
        targetTitle: input.targetTitle,
        text,
        imageUrl,
        time: formatCommentTime(now),
        createdAt: now.getTime(),
        user: {
          name: me.name,
          handle: me.handle,
          initials: me.initials,
          avatarUrl: me.avatarUrl,
        },
      };
      persist([comment, ...posted]);
      return toContentComment(comment);
    },
    [me, persist, posted],
  );

  const deleteComment = useCallback(
    (commentId: string) => {
      persist(posted.filter((c) => c.id !== commentId));
      if (reportedIds.has(commentId)) {
        const next = new Set(reportedIds);
        next.delete(commentId);
        persistReported(next);
      }
      if (hiddenIds.has(commentId)) {
        const next = new Set(hiddenIds);
        next.delete(commentId);
        persistHidden(next);
      }
    },
    [persist, posted, reportedIds, hiddenIds, persistReported, persistHidden],
  );

  const reportComment = useCallback(
    (commentId: string) => {
      if (reportedIds.has(commentId)) return;
      const next = new Set(reportedIds);
      next.add(commentId);
      persistReported(next);
    },
    [reportedIds, persistReported],
  );

  const isCommentReported = useCallback(
    (commentId: string) => reportedIds.has(commentId),
    [reportedIds],
  );

  const hideComment = useCallback(
    (commentId: string) => {
      if (hiddenIds.has(commentId)) return;
      const next = new Set(hiddenIds);
      next.add(commentId);
      persistHidden(next);
    },
    [hiddenIds, persistHidden],
  );

  const unhideComment = useCallback(
    (commentId: string) => {
      if (!hiddenIds.has(commentId)) return;
      const next = new Set(hiddenIds);
      next.delete(commentId);
      persistHidden(next);
    },
    [hiddenIds, persistHidden],
  );

  const isCommentHidden = useCallback(
    (commentId: string) => hiddenIds.has(commentId),
    [hiddenIds],
  );

  const createdRecipeAuthorById = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of createdRecipes) map.set(r.id, r.author);
    return map;
  }, [createdRecipes]);

  const createdPostAuthorById = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of createdPosts) map.set(p.id, p.author);
    return map;
  }, [createdPosts]);

  const activityItems = useMemo(() => {
    const myHandles = new Set([me.handle, CURRENT_USER.handle]);
    const items: FeedItem[] = [];

    for (const c of posted) {
      if (myHandles.has(c.user.handle)) continue;
      if (hiddenIds.has(c.id) || reportedIds.has(c.id)) continue;

      if (c.targetKind === "recipe") {
        const author = recipeAuthorHandle(
          c.targetId,
          CATALOG_RECIPES,
          createdRecipeAuthorById,
        );
        if (!author || !myHandles.has(author)) continue;
        items.push({
          id: `comment-activity-${c.id}`,
          kind: "comment",
          user: c.user,
          time: formatActivityAge(c.createdAt),
          createdAt: c.createdAt,
          target: c.targetTitle,
          recipeId: c.targetId,
          preview: c.text.slice(0, 160) || "Shared a photo",
          unread: isNewActivity(c.createdAt),
        });
        continue;
      }

      const author = postAuthorHandle(c.targetId, createdPostAuthorById);
      if (!author || !myHandles.has(author)) continue;
      items.push({
        id: `comment-activity-${c.id}`,
        kind: "comment",
        user: c.user,
        time: formatActivityAge(c.createdAt),
        createdAt: c.createdAt,
        target: c.targetTitle,
        postId: c.targetId,
        preview: c.text.slice(0, 160) || "Shared a photo",
        unread: isNewActivity(c.createdAt),
      });
    }

    return items;
  }, [
    posted,
    me.handle,
    createdRecipeAuthorById,
    createdPostAuthorById,
    hiddenIds,
    reportedIds,
  ]);

  const value = useMemo(
    () => ({
      getComments,
      addComment,
      deleteComment,
      reportComment,
      isCommentReported,
      hideComment,
      unhideComment,
      isCommentHidden,
      activityItems,
    }),
    [
      getComments,
      addComment,
      deleteComment,
      reportComment,
      isCommentReported,
      hideComment,
      unhideComment,
      isCommentHidden,
      activityItems,
    ],
  );

  return (
    <CommentsContext.Provider value={value}>{children}</CommentsContext.Provider>
  );
}

export function useComments() {
  const ctx = useContext(CommentsContext);
  if (!ctx) {
    throw new Error("useComments must be used within CommentsProvider");
  }
  return ctx;
}
