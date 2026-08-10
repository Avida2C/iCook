"use client";

import Link from "next/link";
import {
  HeartIcon,
  HeartFillIcon,
  CommentIcon,
  ShareIcon,
} from "@/components/app/icons";
import RecipeThumbnail from "@/components/app/RecipeThumbnail";
import UserAvatar from "@/components/app/UserAvatar";
import UserNameLink from "@/components/app/UserNameLink";
import { useLikedPosts } from "@/components/app/LikedPostsProvider";
import {
  CATALOG_RECIPES,
  useSavedRecipes,
} from "@/components/recipes/SavedRecipesProvider";
import { withLiveProfile } from "@/components/app/user/authors";
import { useCurrentFeedUser } from "@/components/app/user/useCurrentFeedUser";
import type { FeedUser } from "@/components/app/user/types";
import { absoluteAppUrl, shareContent } from "@/lib/share";
import { userProfilePath } from "@/lib/userProfile";

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

const COMMUNITY_FEED: CommunityItem[] = [
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
    id: "c2",
    kind: "post",
    user: sue,
    time: "2h ago",
    postId: "1",
    title: "My go-to cookie tip",
    preview:
      "Chill your dough for at least 30 minutes — it keeps the cookies thick and chewy every time. Extra points if you brown the butter first.",
    likes: 28,
    comments: 5,
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
    id: "c4",
    kind: "post",
    user: amy,
    time: "Yesterday",
    postId: "2",
    title: "Kitchen reset",
    preview:
      "Cleared out the spice rack this morning — sharing what stayed, what went, and the three bottles I always refill first.",
    likes: 19,
    comments: 3,
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
    id: "c6",
    kind: "post",
    user: grill,
    time: "2d ago",
    postId: "3",
    title: "Charcoal vs gas — honest take",
    preview:
      "Gas is convenient. Charcoal wins on flavour. If you only grill on weekends, charcoal is worth the mess.",
    likes: 34,
    comments: 14,
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
    id: "c9",
    kind: "post",
    user: courtney,
    time: "4d ago",
    postId: "4",
    title: "Weeknight pasta formula",
    preview:
      "One pan, one handful of greens, whatever cheese you have. The formula I use when dinner needs to happen in 20 minutes.",
    likes: 56,
    comments: 11,
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
            category={recipe.category}
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
        className="block rounded border border-line px-3 py-2.5"
      >
        <p className="text-sm font-bold text-ink">{item.title}</p>
        <p className="mt-1 line-clamp-3 text-xs leading-4 text-ink-secondary">
          {item.preview}
        </p>
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
  return (
    <div className="page-fill">
      <div className="feed-stack">
        <div className="flex items-center justify-between px-3">
          <h2 className="section-title">Community</h2>
          <span className="text-xs text-muted">Recipes &amp; posts</span>
        </div>

        {COMMUNITY_FEED.map((item) =>
          item.kind === "recipe" ? (
            <RecipeFeedCard key={item.id} item={item} />
          ) : (
            <PostFeedCard key={item.id} item={item} />
          ),
        )}
      </div>
    </div>
  );
}
