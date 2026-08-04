"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  EditIcon,
  MessageIcon,
  UserAddIcon,
  HeartIcon,
  HeartFillIcon,
  CommentIcon,
} from "@/components/app/icons";
import RecipeThumbnail from "@/components/app/RecipeThumbnail";
import {
  MY_RECIPES,
  MyRecipesPanel,
  SavedRecipesPanel,
} from "@/components/app/UserCollectionScreens";
import { useSavedRecipes } from "@/components/recipes/SavedRecipesProvider";

type MeTab = "activity" | "recipes" | "saved" | "followers" | "following";

type FeedUser = { name: string; handle: string; initials: string };

type FeedItem =
  | {
      id: string;
      kind: "follow";
      user: FeedUser;
      time: string;
      unread?: boolean;
    }
  | {
      id: string;
      kind: "recipe";
      user: FeedUser;
      time: string;
      recipeId: string;
      recipeName: string;
      preview: string;
      unread?: boolean;
    }
  | {
      id: string;
      kind: "post";
      user: FeedUser;
      time: string;
      title: string;
      preview: string;
      unread?: boolean;
    }
  | {
      id: string;
      kind: "like";
      user: FeedUser;
      time: string;
      target: string;
      unread?: boolean;
    }
  | {
      id: string;
      kind: "comment";
      user: FeedUser;
      time: string;
      target: string;
      preview: string;
      unread?: boolean;
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

const ACTIVITY_FEED: FeedItem[] = [
  {
    id: "1",
    kind: "follow",
    user: amy,
    time: "2h ago",
    unread: true,
  },
  {
    id: "2",
    kind: "recipe",
    user: ben,
    time: "4h ago",
    recipeId: "3",
    recipeName: "Blueberry Pancakes",
    preview:
      "Fluffy weekend pancakes with fresh blueberries and a touch of lemon zest.",
    unread: true,
  },
  {
    id: "3",
    kind: "post",
    user: sue,
    time: "Yesterday",
    title: "My go-to cookie tip",
    preview:
      "Chill your dough for at least 30 minutes — it keeps the cookies thick and chewy every time.",
  },
  {
    id: "4",
    kind: "comment",
    user: grill,
    time: "Yesterday",
    target: "Ricotta Ravioli",
    preview: "Tried this last night — the filling was perfect!",
  },
  {
    id: "5",
    kind: "recipe",
    user: grill,
    time: "2d ago",
    recipeId: "5",
    recipeName: "Pork Roast",
    preview:
      "Slow-roasted with rosemary and garlic until the crust is golden and crisp.",
  },
  {
    id: "6",
    kind: "like",
    user: amy,
    time: "3d ago",
    target: "Pasta Salad",
  },
  {
    id: "7",
    kind: "follow",
    user: sue,
    time: "3d ago",
  },
  {
    id: "8",
    kind: "post",
    user: amy,
    time: "5d ago",
    title: "Kitchen reset",
    preview:
      "Cleared out the spice rack this morning — sharing what stayed and what went.",
  },
];

const INITIAL_FOLLOWERS = [
  "Jacob Jones",
  "Darlene Robertson",
  "Theresa Webb",
];
const INITIAL_FOLLOWING = [
  "Guy Hawkins",
  "Savannah Nguyen",
  "Annette Black",
  "Kristin Watson",
  "Bessie Cooper",
  "Leslie Alexander",
  "Robert Fox",
  "Kathryn Murphy",
  "Eleanor Pena",
  "Devon Lane",
];

const TAB_META: Record<MeTab, { label: string }> = {
  activity: { label: "Activity" },
  recipes: { label: "Recipes" },
  saved: { label: "Saved" },
  followers: { label: "Followers" },
  following: { label: "Following" },
};

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);
}

function Avatar({ user, size = "md" }: { user: FeedUser; size?: "sm" | "md" }) {
  return (
    <span className={size === "sm" ? "avatar-sm" : "avatar"}>
      {user.initials}
    </span>
  );
}

function FeedCard({ item }: { item: FeedItem }) {
  const unreadDot = item.unread ? (
    <span
      className="mt-1.5 size-2 shrink-0 rounded-full bg-brand"
      aria-label="Unread"
    />
  ) : null;

  if (item.kind === "follow") {
    return (
      <article className="feed-card flex gap-3">
        <Avatar user={item.user} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <p className="min-w-0 flex-1 text-sm leading-5 text-ink">
              <span className="font-bold text-brand">{item.user.name}</span>{" "}
              started following you
            </p>
            {unreadDot}
          </div>
          <p className="mt-1 text-xs text-muted">{item.time}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded bg-brand/10 px-2 py-1 text-xs font-bold text-brand">
              <UserAddIcon className="size-3.5" />
              New follower
            </span>
          </div>
        </div>
      </article>
    );
  }

  if (item.kind === "recipe") {
    return (
      <article className="feed-card flex flex-col gap-2">
        <div className="flex gap-3">
          <Avatar user={item.user} />
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-2">
              <p className="min-w-0 flex-1 text-sm leading-5 text-ink">
                <span className="font-bold text-brand">{item.user.name}</span>{" "}
                posted a new recipe
              </p>
              {unreadDot}
            </div>
            <p className="mt-0.5 flex items-center gap-0.5 text-xs leading-[14px]">
              <span className="text-brand-soft">@</span>
              <span className="truncate text-placeholder">
                {item.user.handle}
              </span>
              <span className="text-muted"> · {item.time}</span>
            </p>
          </div>
        </div>
        <Link
          href={`/recipe/${item.recipeId}`}
          className="ms-14 block overflow-hidden rounded border border-line"
        >
          <RecipeThumbnail className="h-20 w-full" iconClassName="h-10 w-11" />
          <div className="px-3 py-2">
            <p className="truncate text-sm font-bold text-ink">
              {item.recipeName}
            </p>
            <p className="mt-0.5 line-clamp-2 text-xs leading-4 text-muted">
              {item.preview}
            </p>
          </div>
        </Link>
      </article>
    );
  }

  if (item.kind === "post") {
    return (
      <article className="feed-card flex flex-col gap-2">
        <div className="flex gap-3">
          <Avatar user={item.user} />
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-2">
              <p className="min-w-0 flex-1 text-sm leading-5 text-ink">
                <span className="font-bold text-brand">{item.user.name}</span>{" "}
                shared a post
              </p>
              {unreadDot}
            </div>
            <p className="mt-0.5 flex items-center gap-0.5 text-xs leading-[14px]">
              <span className="text-brand-soft">@</span>
              <span className="truncate text-placeholder">
                {item.user.handle}
              </span>
              <span className="text-muted"> · {item.time}</span>
            </p>
          </div>
        </div>
        <div className="ms-14 rounded border border-line px-3 py-2">
          <p className="text-sm font-bold text-ink">{item.title}</p>
          <p className="mt-1 line-clamp-3 text-xs leading-4 text-ink-secondary">
            {item.preview}
          </p>
        </div>
      </article>
    );
  }

  if (item.kind === "like") {
    return (
      <article className="feed-card flex gap-3">
        <Avatar user={item.user} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <p className="min-w-0 flex-1 text-sm leading-5 text-ink">
              <span className="font-bold text-brand">{item.user.name}</span> liked
              your recipe{" "}
              <span className="font-bold italic text-ink-secondary">
                {item.target}
              </span>
            </p>
            {unreadDot}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted">
            <HeartIcon className="size-3.5 text-brand" />
            <span>{item.time}</span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="feed-card flex gap-3">
      <Avatar user={item.user} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <p className="min-w-0 flex-1 text-sm leading-5 text-ink">
            <span className="font-bold text-brand">{item.user.name}</span>{" "}
            commented on{" "}
            <span className="font-bold italic text-ink-secondary">
              {item.target}
            </span>
          </p>
          {unreadDot}
        </div>
        <p className="mt-1 line-clamp-2 rounded bg-app px-2 py-1.5 text-xs leading-4 text-ink-secondary">
          &ldquo;{item.preview}&rdquo;
        </p>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted">
          <CommentIcon className="size-3.5 text-brand" />
          <span>{item.time}</span>
        </div>
      </div>
    </article>
  );
}

function handleFromName(name: string) {
  return name.replace(/\s+/g, "").toLowerCase();
}

function PeoplePanel({
  names,
  followingSet,
  onToggleFollow,
}: {
  names: string[];
  followingSet: Set<string>;
  onToggleFollow: (name: string) => void;
}) {
  return (
    <ul className="list-stack">
      {names.length === 0 ? (
        <li className="feed-card px-3 py-8 text-center text-base text-muted">
          No one here yet.
        </li>
      ) : (
        names.map((name) => {
          const isFollowing = followingSet.has(name);
          return (
            <li key={name} className="feed-card flex items-center gap-3">
              <span className="avatar">{initials(name)}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-brand">{name}</p>
                <p className="flex items-center gap-0.5 text-xs leading-[14px]">
                  <span className="text-brand-soft">@</span>
                  <span className="truncate text-placeholder">
                    {handleFromName(name)}
                  </span>
                </p>
              </div>
              <Link
                href="/messages/1"
                aria-label={`Message ${name}`}
                className="shrink-0 rounded border border-line px-2.5 py-1.5 text-xs font-bold text-ink-secondary"
              >
                Message
              </Link>
              <button
                type="button"
                onClick={() => onToggleFollow(name)}
                aria-label={
                  isFollowing ? `Unfollow ${name}` : `Follow ${name}`
                }
                aria-pressed={isFollowing}
                className={
                  isFollowing
                    ? "shrink-0 rounded border-2 border-brand bg-surface px-2.5 py-1.5 text-xs font-bold text-brand"
                    : "shrink-0 rounded bg-brand px-2.5 py-1.5 text-xs font-bold text-white hover:bg-brand-hover"
                }
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            </li>
          );
        })
      )}
    </ul>
  );
}

export default function UserScreen() {
  const [tab, setTab] = useState<MeTab>("activity");
  const [followers] = useState(INITIAL_FOLLOWERS);
  const [following, setFollowing] = useState(INITIAL_FOLLOWING);
  const { savedRecipes } = useSavedRecipes();

  const followingSet = useMemo(() => new Set(following), [following]);

  const tabCounts: Record<MeTab, number> = {
    activity: ACTIVITY_FEED.filter((item) => item.unread).length,
    recipes: MY_RECIPES.length,
    saved: savedRecipes.length,
    followers: followers.length,
    following: following.length,
  };

  const toggleFollow = (name: string) => {
    setFollowing((prev) =>
      prev.includes(name)
        ? prev.filter((n) => n !== name)
        : [...prev, name],
    );
  };

  const selectTab = (next: MeTab) => {
    setTab(next);
  };

  const panelTitle =
    tab === "activity"
      ? "Activity"
      : tab === "recipes"
        ? "My Recipes"
        : tab === "saved"
          ? "Saved Recipes"
          : tab === "followers"
            ? "Followers"
            : "Following";

  return (
    <div className="page-fill">
      <div className="surface-block shrink-0">
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center gap-3">
            <span className="avatar-lg">CH</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xl font-bold text-brand">
                Courtney Henry
              </p>
              <p className="flex items-center gap-0.5 text-sm leading-[14px]">
                <span className="text-brand-soft">@</span>
                <span className="truncate text-placeholder">courtneyhenry</span>
              </p>
            </div>
            <Link
              href="/settings/user"
              className="shrink-0 rounded border border-line px-3 py-1.5 text-sm font-bold text-ink-secondary"
            >
              Edit profile
            </Link>
          </div>
        </div>

        <div className="px-3 pb-3">
          <div className="grid grid-cols-2 gap-2">
            <Link href="/create/recipe" className="btn-primary">
              <EditIcon className="size-5 shrink-0" />
              <span className="leading-tight">Create a Recipe</span>
            </Link>
            <Link href="/create/post" className="btn-secondary">
              <MessageIcon className="size-5 shrink-0" />
              <span className="leading-tight">Write a Post</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-5 border-t border-line" role="tablist">
          {(Object.keys(TAB_META) as MeTab[]).map((id) => {
            const meta = TAB_META[id];
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => selectTab(id)}
                className={`flex flex-col items-center justify-center gap-0.5 px-0.5 py-2.5 ${
                  active ? "tab-underline" : "tab-underline-idle"
                }`}
              >
                <span className="text-base font-bold text-brand">
                  {tabCounts[id]}
                </span>
                <span
                  className={`text-center text-[10px] leading-tight ${
                    active ? "font-bold text-brand" : "text-muted"
                  }`}
                >
                  {meta.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="feed-stack">
        <div className="flex items-center justify-between px-3">
          <h2 className="section-title">{panelTitle}</h2>
          {tab === "activity" ? (
            <Link
              href="/notifications"
              className="text-xs font-bold text-ink-secondary"
            >
              All notifications
            </Link>
          ) : null}
        </div>

        {tab === "activity" ? (
          ACTIVITY_FEED.map((item) => <FeedCard key={item.id} item={item} />)
        ) : tab === "recipes" ? (
          <MyRecipesPanel />
        ) : tab === "saved" ? (
          <SavedRecipesPanel />
        ) : tab === "followers" ? (
          <PeoplePanel
            key="followers"
            names={followers}
            followingSet={followingSet}
            onToggleFollow={toggleFollow}
          />
        ) : (
          <PeoplePanel
            key="following"
            names={following}
            followingSet={followingSet}
            onToggleFollow={toggleFollow}
          />
        )}
      </div>
    </div>
  );
}
