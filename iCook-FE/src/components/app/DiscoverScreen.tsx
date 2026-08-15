"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import FeaturedRecipeHeroCta from "@/components/app/FeaturedRecipeHeroCta";
import { recipeFeaturedDescription } from "@/components/app/FeaturedRecipeDisplay";
import InfiniteFeedSentinel from "@/components/app/InfiniteFeedSentinel";
import { PostFeedCard, RecipeFeedCard } from "@/components/app/CommunityFeedCard";
import { type CatalogRecipe } from "@/components/recipes/SavedRecipesProvider";
import { useCreatedContent } from "@/components/app/CreatedContentProvider";
import { CATALOG_POSTS } from "@/components/app/postsData";
import { formatPublishAge } from "@/lib/publishVisibility";
import { plainTextFromHtml } from "@/lib/postRichText";
import { resolveAuthor } from "@/components/app/user/authors";
import { useCurrentFeedUser } from "@/components/app/user/useCurrentFeedUser";
import type { FeedUser } from "@/components/app/user/types";
import { useInfiniteFeed } from "@/lib/useInfiniteFeed";

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

export default function DiscoverScreen() {
  const me = useCurrentFeedUser();
  const { visiblePosts, visibleRecipes, publicRecipes } = useCreatedContent();
  const [featuredSlots, setFeaturedSlots] = useState<CatalogRecipe[]>([]);

  const feed = useMemo(() => {
    const createdItems: CommunityItem[] = [
      ...visiblePosts
        .filter((post) => !post.isPrivate)
        .map((post) => ({
        id: `created-post-${post.id}`,
        kind: "post" as const,
        user: resolveAuthor(post.author, me),
        time: formatPublishAge(post.createdAt),
        postId: post.id,
        title: post.title,
        preview: plainTextFromHtml(post.body),
        likes: 0,
        comments: 0,
        thumbnailUrl: post.thumbnailUrl,
        createdAt: post.createdAt,
      })),
      ...visibleRecipes
        .filter((recipe) => !recipe.isPrivate)
        .map((recipe) => ({
        id: `created-recipe-${recipe.id}`,
        kind: "recipe" as const,
        user: resolveAuthor(recipe.author, me),
        time: formatPublishAge(recipe.createdAt),
        recipeId: recipe.id,
        recipeName: recipe.name,
        preview: recipe.preview || recipe.description,
        likes: recipe.bookmarkCount,
        comments: 0,
        createdAt: recipe.createdAt,
      })),
    ].sort((a, b) => b.createdAt - a.createdAt);
    return [
      ...createdItems.map(({ createdAt: _createdAt, ...item }) => item),
      ...COMMUNITY_FEED,
    ];
  }, [visiblePosts, visibleRecipes, me]);

  const { entries, loadingMore, hasMore, sentinelRef } = useInfiniteFeed({
    items: feed,
    pageSize: PAGE_SIZE,
    cycle: true,
    resetKey: feed.map((item) => item.id).join(","),
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
      const pool = publicRecipes.filter((r) => !used.has(r.id));
      return [
        ...prev,
        ...pickFeaturedSlots(
          needed,
          pool.length > 0 ? pool : publicRecipes,
        ),
      ];
    });
  }, [featuredNeeded, publicRecipes]);

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
                <RecipeFeedCard
                  user={item.user}
                  time={item.time}
                  recipeId={item.recipeId}
                  recipeName={item.recipeName}
                  preview={item.preview}
                  likes={item.likes}
                  comments={item.comments}
                />
              ) : (
                <PostFeedCard
                  user={item.user}
                  time={item.time}
                  postId={item.postId}
                  title={item.title}
                  preview={item.preview}
                  thumbnailUrl={item.thumbnailUrl}
                  likes={item.likes}
                  comments={item.comments}
                />
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
