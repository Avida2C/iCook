"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  HeartIcon,
  HeartFillIcon,
  CommentIcon,
  ShareIcon,
} from "@/components/app/icons";
import FeaturedRecipeHeroCta from "@/components/app/FeaturedRecipeHeroCta";
import { recipeFeaturedDescription } from "@/components/app/FeaturedRecipeDisplay";
import InfiniteFeedSentinel from "@/components/app/InfiniteFeedSentinel";
import RecipeThumbnail from "@/components/app/RecipeThumbnail";
import UserAvatar from "@/components/app/UserAvatar";
import UserNameLink from "@/components/app/UserNameLink";
import { useLikedPosts } from "@/components/app/LikedPostsProvider";
import {
  CATALOG_RECIPES,
  useSavedRecipes,
  type CatalogRecipe,
} from "@/components/recipes/SavedRecipesProvider";
import { primaryCategory } from "@/components/recipes/recipesData";
import { withLiveProfile } from "@/components/app/user/authors";
import { useCurrentFeedUser } from "@/components/app/user/useCurrentFeedUser";
import type { FeedUser } from "@/components/app/user/types";
import { absoluteAppUrl, shareContent } from "@/lib/share";
import { useInfiniteFeed } from "@/lib/useInfiniteFeed";
import { userProfilePath } from "@/lib/userProfile";
import { CATALOG_POSTS } from "@/components/app/postsData";

const FEATURED_EVERY = 4;
/** Roughly one viewport of feed cards per load. */
const PAGE_SIZE = 3;

function pickFeaturedSlots(count: number, pool: CatalogRecipe[]) {
  if (count <= 0 || pool.length === 0) return [] as CatalogRecipe[];
  const picks: CatalogRecipe[] = [];
  for (let i = 0; i < count; i++) {
    const available = pool.filter((r) => !picks.some((p) => p.id === r.id));
    const from = available.length > 0 ? available : pool;
    picks.push(from[Math.floor(Math.random() * from.length)]!);
  }
  return picks;
}

type CommunityItem =
  | {
      id: string;
      kind: "recipe";
      user: FeedUser;
      time: string;
      recipeId: string;
      recipeName: string;
      preview: string;
      likes: number;
      comments: number;
    }
  | {
      id: string;
      kind: "post";
      user: FeedUser;
      time: string;
      postId: string;
      title: string;
      preview: string;
      likes: number;
      comments: number;
      thumbnailUrl?: string;
    };

const amy: FeedUser = {
  name: "Chef Amy",
  handle: "chefamy",
  initials: "CA",
};
const ben: FeedUser = {
  name: "Baker Ben",
  handle: "bakerben",
  initials: "BB",
};
const sue: FeedUser = {
  name: "Sweet Sue",
  handle: "sweetsue",
  initials: "SS",
};
const grill: FeedUser = {
  name: "Grill Guy",
  handle: "grillguy",
  initials: "GG",
};
const courtney: FeedUser = {
  name: "Courtney Henry",
  handle: "courtneyhenry",
  initials: "CH",
};
const fish: FeedUser = {
  name: "Fish Fan",
  handle: "fishfan",
  initials: "FF",
};

const RECIPE_FEED: Extract<CommunityItem, { kind: "recipe" }>[] = [
  {
    id: "c1",
    kind: "recipe",
    user: courtney,
    time: "1h ago",
    recipeId: "1",
    recipeName: "Ricotta Ravioli",
    preview:
      "Soft pasta pockets filled with ricotta and basil — classic Italian comfort, made simple.",
    likes: 42,
    comments: 8,
  },
  {
    id: "c3",
    kind: "recipe",
    user: ben,
    time: "4h ago",
    recipeId: "3",
    recipeName: "Blueberry Pancakes",
    preview:
      "Fluffy weekend pancakes with fresh blueberries and a touch of lemon zest.",
    likes: 67,
    comments: 12,
  },
  {
    id: "c5",
    kind: "recipe",
    user: grill,
    time: "Yesterday",
    recipeId: "5",
    recipeName: "Pork Roast",
    preview:
      "Slow-roasted with rosemary and garlic until the crust is golden and crisp.",
    likes: 51,
    comments: 9,
  },
  {
    id: "c7",
    kind: "recipe",
    user: fish,
    time: "2d ago",
    recipeId: "11",
    recipeName: "Salmon with Roast Potatoes",
    preview:
      "Crispy potatoes, flaky salmon, and a lemon-dill finish that comes together on one tray.",
    likes: 38,
    comments: 6,
  },
  {
    id: "c8",
    kind: "recipe",
    user: sue,
    time: "3d ago",
    recipeId: "13",
    recipeName: "Raspberry Cheesecake",
    preview:
      "No-bake cheesecake with a buttery biscuit base and a bright raspberry swirl.",
    likes: 89,
    comments: 21,
  },
  {
    id: "c10",
    kind: "recipe",
    user: amy,
    time: "5d ago",
    recipeId: "2",
    recipeName: "Egg on Toast",
    preview:
      "Perfect soft yolks on crusty toast — the breakfast that never gets old.",
    likes: 23,
    comments: 4,
  },
];

const POST_COMMENTS: Record<string, number> = {
  "1": 5,
  "2": 3,
  "3": 14,
  "4": 11,
  "5": 7,
  "6": 9,
  "7": 4,
  "8": 6,
  "9": 8,
  "10": 5,
  "11": 10,
  "12": 12,
  "13": 15,
  "14": 9,
  "15": 4,
  "16": 11,
  "17": 6,
  "18": 13,
  "19": 8,
  "20": 16,
};

const POST_FEED: Extract<CommunityItem, { kind: "post" }>[] = Object.entries(
  CATALOG_POSTS,
)
  .sort(([a], [b]) => Number(a) - Number(b))
  .map(([postId, post]) => ({
    id: `post-${postId}`,
    kind: "post" as const,
    user: post.user,
    time: post.time,
    postId,
    title: post.title,
    preview: post.body,
    likes: post.likes,
    comments: POST_COMMENTS[postId] ?? 3,
    thumbnailUrl: post.thumbnailUrl,
  }));

/** Interleave catalog posts with recipe shares for a mixed community feed. */
function buildCommunityFeed(): CommunityItem[] {
  const feed: CommunityItem[] = [];
  let recipeIndex = 0;
  POST_FEED.forEach((post, index) => {
    feed.push(post);
    // Drop a recipe share after every few posts for variety.
    if ((index + 1) % 4 === 0 && recipeIndex < RECIPE_FEED.length) {
      feed.push(RECIPE_FEED[recipeIndex]!);
      recipeIndex += 1;
    }
  });
  while (recipeIndex < RECIPE_FEED.length) {
    feed.push(RECIPE_FEED[recipeIndex]!);
    recipeIndex += 1;
  }
  return feed;
}

const COMMUNITY_FEED = buildCommunityFeed();

function Avatar({ user }: { user: FeedUser }) {
  const me = useCurrentFeedUser();
  const author = withLiveProfile(user, me);
  return (
    <Link
      href={userProfilePath(author.handle, me.handle)}
      aria-label={author.name}
    >
      <UserAvatar
        initials={author.initials}
        handle={author.handle}
        src={author.avatarUrl}
        me={author.handle === me.handle}
      />
    </Link>
  );
}

function Handle({ handle, time }: { handle: string; time: string }) {
  const me = useCurrentFeedUser();
  const author = withLiveProfile(
    { name: handle, handle, initials: handle.slice(0, 2).toUpperCase() },
    me,
  );
  return (
    <p className="mt-0.5 flex items-center gap-0.5 text-xs leading-3.5">
      <span className="text-brand-soft">@</span>
      <Link
        href={userProfilePath(author.handle, me.handle)}
        className="truncate text-placeholder"
      >
        {author.handle}
      </Link>
      <span className="text-muted"> · {time}</span>
    </p>
  );
}

function AuthorLabel({ user }: { user: FeedUser }) {
  const me = useCurrentFeedUser();
  const author = withLiveProfile(user, me);
  return (
    <UserNameLink name={author.name} handle={author.handle} />
  );
}

function RecipeFeedCard({ item }: { item: Extract<CommunityItem, { kind: "recipe" }> }) {
  const recipe =
    CATALOG_RECIPES.find((r) => r.id === item.recipeId) ?? CATALOG_RECIPES[0];
  const { isSaved, toggleSave } = useSavedRecipes();
  const saved = isSaved(recipe.id);
  const likes = item.likes + (saved ? 1 : 0);

  const onShare = () => {
    void shareContent({
      title: item.recipeName,
      text: item.preview,
      url: absoluteAppUrl(`/recipe/${item.recipeId}`),
    });
  };

  return (
    <article className="feed-card flex flex-col gap-2">
      <div className="flex gap-3">
        <Avatar user={item.user} />
        <div className="min-w-0 flex-1">
          <p className="text-sm leading-5 text-ink">
            <AuthorLabel user={item.user} />{" "}
            shared a recipe
          </p>
          <Handle handle={item.user.handle} time={item.time} />
        </div>
      </div>

      <Link
        href={`/recipe/${item.recipeId}`}
        className="block overflow-hidden rounded border border-line"
      >
          <RecipeThumbnail
            className="aspect-square w-full"
            iconClassName="h-12 w-14"
            src={recipe.thumbnailUrl}
            category={primaryCategory(recipe)}
            alt={recipe.name}
          />
          <div className="px-3 py-2.5">
            <p className="truncate text-sm font-bold text-ink">{item.recipeName}</p>
            <p className="mt-0.5 line-clamp-2 text-xs leading-4 text-muted">
              {item.preview}
            </p>
          </div>
        </Link>

      <div className="flex items-center gap-4 text-xs text-muted">
        <button
          type="button"
          aria-label={
            saved ? `Unsave ${item.recipeName}` : `Save ${item.recipeName}`
          }
          aria-pressed={saved}
          onClick={() => toggleSave(recipe)}
          className="inline-flex items-center gap-1"
        >
          {saved ? (
            <HeartFillIcon className="size-3.5 text-brand" />
          ) : (
            <HeartIcon className="size-3.5 text-brand" />
          )}
          {likes}
        </button>
        <span className="inline-flex items-center gap-1">
          <CommentIcon className="size-3.5 text-brand" />
          {item.comments}
        </span>
        <button
          type="button"
          aria-label={`Share ${item.recipeName}`}
          onClick={onShare}
          className="ms-auto inline-flex items-center text-brand"
        >
          <ShareIcon className="size-3.5" />
        </button>
      </div>
    </article>
  );
}

function PostFeedCard({ item }: { item: Extract<CommunityItem, { kind: "post" }> }) {
  const { isLiked, likeCount, toggleLike } = useLikedPosts();
  const liked = isLiked(item.postId);
  const likes = likeCount(item.postId, item.likes);

  const onShare = () => {
    void shareContent({
      title: item.title,
      text: item.preview,
      url: absoluteAppUrl(`/post/${item.postId}`),
    });
  };

  return (
    <article className="feed-card flex flex-col gap-2">
      <div className="flex gap-3">
        <Avatar user={item.user} />
        <div className="min-w-0 flex-1">
          <p className="text-sm leading-5 text-ink">
            <AuthorLabel user={item.user} />{" "}
            shared a post
          </p>
          <Handle handle={item.user.handle} time={item.time} />
        </div>
      </div>

      <Link
        href={`/post/${item.postId}`}
        className="block overflow-hidden rounded border border-line"
      >
        <RecipeThumbnail
          className="aspect-square w-full"
          iconClassName="h-12 w-14"
          src={item.thumbnailUrl}
          alt={item.title}
        />
        <div className="px-3 py-2.5">
          <p className="text-sm font-bold text-ink">{item.title}</p>
          <p className="mt-1 line-clamp-3 text-xs leading-4 text-ink-secondary">
            {item.preview}
          </p>
        </div>
      </Link>

      <div className="flex items-center gap-4 text-xs text-muted">
        <button
          type="button"
          aria-label={liked ? `Unlike ${item.title}` : `Like ${item.title}`}
          aria-pressed={liked}
          onClick={() => toggleLike({ id: item.postId, title: item.title })}
          className="inline-flex items-center gap-1"
        >
          {liked ? (
            <HeartFillIcon className="size-3.5 text-brand" />
          ) : (
            <HeartIcon className="size-3.5 text-brand" />
          )}
          {likes}
        </button>
        <span className="inline-flex items-center gap-1">
          <CommentIcon className="size-3.5 text-brand" />
          {item.comments}
        </span>
        <button
          type="button"
          aria-label={`Share ${item.title}`}
          onClick={onShare}
          className="ms-auto inline-flex items-center text-brand"
        >
          <ShareIcon className="size-3.5" />
        </button>
      </div>
    </article>
  );
}

export default function DiscoverScreen() {
  const [featuredSlots, setFeaturedSlots] = useState<CatalogRecipe[]>([]);
  const { entries, loadingMore, hasMore, sentinelRef } = useInfiniteFeed({
    items: COMMUNITY_FEED,
    pageSize: PAGE_SIZE,
    cycle: true,
  });

  const featuredNeeded = useMemo(() => {
    let postsSeen = 0;
    for (const { item } of entries) {
      if (item.kind === "post") postsSeen += 1;
    }
    return Math.floor(postsSeen / FEATURED_EVERY);
  }, [entries]);

  useEffect(() => {
    setFeaturedSlots((prev) => {
      if (featuredNeeded <= prev.length) return prev;
      const needed = featuredNeeded - prev.length;
      const used = new Set(prev.map((r) => r.id));
      const pool = CATALOG_RECIPES.filter((r) => !used.has(r.id));
      return [
        ...prev,
        ...pickFeaturedSlots(needed, pool.length > 0 ? pool : CATALOG_RECIPES),
      ];
    });
  }, [featuredNeeded]);

  let postsSeen = 0;

  return (
    <div className="page-fill">
      <div className="feed-stack touch-pan-y">
        <div className="flex items-center justify-between px-3">
          <h2 className="section-title">Community</h2>
          <span className="text-xs text-muted">Recipes &amp; posts</span>
        </div>

        {entries.map(({ key, item }) => {
          const showFeatured =
            item.kind === "post" && (++postsSeen) % FEATURED_EVERY === 0;
          const featured = showFeatured
            ? featuredSlots[postsSeen / FEATURED_EVERY - 1]
            : undefined;

          return (
            <Fragment key={key}>
              {item.kind === "recipe" ? (
                <RecipeFeedCard item={item} />
              ) : (
                <PostFeedCard item={item} />
              )}
              {featured ? (
                <FeaturedRecipeHeroCta
                  recipe={featured}
                  description={recipeFeaturedDescription(featured)}
                />
              ) : null}
            </Fragment>
          );
        })}

        <InfiniteFeedSentinel
          sentinelRef={sentinelRef}
          loadingMore={loadingMore}
          hasMore={hasMore}
        />
      </div>
    </div>
  );
}
