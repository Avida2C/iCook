/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import FeaturedRecipeDisplay from "@/components/app/FeaturedRecipeDisplay";
import RecipeAuthor from "@/components/app/RecipeAuthor";
import RecipeThumbnail from "@/components/app/RecipeThumbnail";
import UserAvatar from "@/components/app/UserAvatar";
import { useCreatedContent } from "@/components/app/CreatedContentProvider";
import { MessageIcon, UserAddIcon, UserCheckIcon, UsersIcon } from "@/components/app/icons";
import {
  isOwnAuthor,
  normalizeAuthorKey,
  resolveAuthor,
} from "@/components/app/user/authors";
import { useCurrentFeedUser } from "@/components/app/user/useCurrentFeedUser";
import {
  CATALOG_RECIPES,
  type CatalogRecipe,
} from "@/components/recipes/SavedRecipesProvider";
import { primaryCategory } from "@/components/recipes/recipesData";
import {
  DEFAULT_FEATURED_RECIPE_PREFS,
  readFeaturedRecipePrefs,
  type FeaturedRecipePrefs,
} from "@/lib/featuredRecipePrefs";
import {
  isProfileSeedEnabled,
  isFollowingPerson,
  readFollowers,
  readFollowing,
  setFollowingPerson,
  writeFollowing,
} from "@/lib/accountData";
import { MY_RECIPES } from "@/components/app/UserCollectionScreens";
import { messagePath } from "@/components/app/messagesData";

/** Stable demo follower/following counts for other users' public profiles. */
function demoSocialCounts(handle: string) {
  let hash = 0;
  for (const ch of handle) {
    hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  }
  return {
    followers: 12 + (hash % 80),
    following: 8 + ((hash >>> 8) % 40),
  };
}

function resolveUser(handle: string) {
  return resolveAuthor(decodeURIComponent(handle));
}

function ProfileRecipeCard({ recipe }: { recipe: CatalogRecipe }) {
  return (
    <div className="flex w-full flex-col items-start">
      <Link
        href={`/recipe/${recipe.id}`}
        className="relative aspect-square w-full overflow-hidden rounded border border-line"
      >
        <RecipeThumbnail
          className="size-full"
          iconClassName="h-10 w-11"
          src={recipe.thumbnailUrl}
          category={primaryCategory(recipe)}
          alt={recipe.name}
        />
      </Link>
      <p className="mt-1 w-full truncate text-left text-sm text-ink-secondary">
        {recipe.name}
      </p>
      <RecipeAuthor author={recipe.author} className="w-full" />
    </div>
  );
}

export default function PublicProfileScreen({ handle }: { handle: string }) {
  const me = useCurrentFeedUser();
  const {
    recipes: createdRecipes,
    visibleRecipes,
    deletedRecipeIds,
    getRecipe,
  } = useCreatedContent();
  const user = resolveUser(handle);
  const profileHandle = normalizeAuthorKey(user.handle);
  const isSelf = profileHandle === normalizeAuthorKey(me.handle);

  const [prefs, setPrefs] = useState<FeaturedRecipePrefs>(
    DEFAULT_FEATURED_RECIPE_PREFS,
  );
  const [includeSeeded, setIncludeSeeded] = useState(false);
  const [socialCounts, setSocialCounts] = useState({
    followers: 0,
    following: 0,
  });
  const [showAllRecipes, setShowAllRecipes] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPrefs(readFeaturedRecipePrefs(user.handle));
    setIncludeSeeded(isSelf && isProfileSeedEnabled());
    setShowAllRecipes(false);
    if (isSelf) {
      setIsFollowing(false);
      setSocialCounts({
        followers: readFollowers().length,
        following: readFollowing().length,
      });
    } else {
      const following = isFollowingPerson(readFollowing(), user);
      setIsFollowing(following);
      const demo = demoSocialCounts(profileHandle);
      setSocialCounts({
        followers: demo.followers + (following ? 1 : 0),
        following: demo.following,
      });
    }
  }, [user.handle, user.name, isSelf, profileHandle]);

  const onToggleFollow = () => {
    if (isSelf) return;
    const next = !isFollowing;
    writeFollowing(setFollowingPerson(readFollowing(), user, next));
    setIsFollowing(next);
    setSocialCounts((counts) => ({
      ...counts,
      followers: Math.max(0, counts.followers + (next ? 1 : -1)),
    }));
  };

  const profileRecipes = useMemo(() => {
    const deleted = new Set(deletedRecipeIds);

    if (isSelf) {
      const own = createdRecipes.filter(
        (r) =>
          isOwnAuthor(r.author, me) &&
          !deleted.has(r.id) &&
          !r.isPrivate,
      );
      const createdIds = new Set(own.map((r) => r.id));
      if (!includeSeeded) return own;
      return [
        ...own,
        ...MY_RECIPES.filter(
          (r) => !createdIds.has(r.id) && !deleted.has(r.id),
        ),
      ];
    }

    // Other users: created recipes authored by them, else catalog by handle.
    const authoredCreated = visibleRecipes.filter(
      (r) =>
        !deleted.has(r.id) &&
        !r.isPrivate &&
        normalizeAuthorKey(r.author) === profileHandle,
    );
    if (authoredCreated.length > 0) return authoredCreated;

    return CATALOG_RECIPES.filter(
      (r) => normalizeAuthorKey(r.author) === profileHandle,
    );
  }, [
    isSelf,
    includeSeeded,
    createdRecipes,
    visibleRecipes,
    deletedRecipeIds,
    profileHandle,
    me,
  ]);

  const featuredRecipe = useMemo(() => {
    if (prefs.recipeId) {
      const fromList = profileRecipes.find((r) => r.id === prefs.recipeId);
      if (fromList) return fromList;
      const fromCreated = getRecipe(prefs.recipeId);
      if (
        fromCreated &&
        !fromCreated.isPrivate &&
        (isSelf ||
          (visibleRecipes.some((r) => r.id === fromCreated.id) &&
            normalizeAuthorKey(fromCreated.author) === profileHandle))
      ) {
        return fromCreated;
      }
      const fromCatalog = CATALOG_RECIPES.find((r) => r.id === prefs.recipeId);
      if (
        fromCatalog &&
        normalizeAuthorKey(fromCatalog.author) === profileHandle
      ) {
        return fromCatalog;
      }
    }

    if (!prefs.recipeId && !isSelf) {
      return profileRecipes[0] ?? null;
    }

    return null;
  }, [prefs.recipeId, profileRecipes, getRecipe, isSelf, profileHandle, visibleRecipes]);

  const otherRecipes = useMemo(() => {
    const featuredId = featuredRecipe?.id;
    return profileRecipes.filter((r) => r.id !== featuredId);
  }, [profileRecipes, featuredRecipe?.id]);

  const hasMoreRecipes = otherRecipes.length > 6;
  const moreRecipes = showAllRecipes
    ? otherRecipes
    : otherRecipes.slice(0, 6);

  const displayName = isSelf ? me.name : user.name;
  const displayAbout =
    (isSelf ? me.about : user.about) ?? "iCook community member.";
  const displayAvatar = isSelf ? me.avatarUrl : user.avatarUrl;

  return (
    <div className="page">
      <div className="list-stack py-2">
        <div className="feed-card flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <UserAvatar
              initials={isSelf ? me.initials : user.initials}
              handle={user.handle}
              src={displayAvatar}
              size="lg"
              me={isSelf}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <p className="min-w-0 flex-1 truncate text-xl font-bold text-brand">
                  {displayName}
                </p>
                <div className="flex shrink-0 items-center gap-3 text-sm">
                  <span
                    className="inline-flex items-center gap-1.5 text-brand"
                    title="Followers"
                    aria-label={`${socialCounts.followers} followers`}
                  >
                    <UsersIcon className="size-4 shrink-0" aria-hidden />
                    <span className="font-bold tabular-nums">
                      {socialCounts.followers}
                    </span>
                  </span>
                  <span
                    className="inline-flex items-center gap-1.5 text-brand"
                    title="Following"
                    aria-label={`${socialCounts.following} following`}
                  >
                    <UserCheckIcon className="size-4 shrink-0" aria-hidden />
                    <span className="font-bold tabular-nums">
                      {socialCounts.following}
                    </span>
                  </span>
                </div>
              </div>
              <p className="flex items-center gap-0.5 text-sm leading-3.5">
                <span className="text-brand-soft">@</span>
                <span className="truncate text-placeholder">{user.handle}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onToggleFollow}
              disabled={isSelf}
              aria-pressed={isFollowing}
              aria-label={
                isFollowing
                  ? `Unfollow ${displayName}`
                  : `Follow ${displayName}`
              }
              className={isFollowing ? "btn-secondary" : "btn-primary"}
            >
              {isFollowing ? (
                <UserCheckIcon className="size-5 shrink-0" />
              ) : (
                <UserAddIcon className="size-5 shrink-0" />
              )}
              <span className="leading-tight">
                {isFollowing ? "Unfollow" : "Follow"}
              </span>
            </button>
            <Link href={messagePath(user.handle)} className="btn-secondary">
              <MessageIcon className="size-5 shrink-0" />
              <span className="leading-tight">Message</span>
            </Link>
          </div>
        </div>

        <section className="feed-card flex flex-col gap-2">
          <h2 className="section-title text-lg">About Me</h2>
          <p className="text-sm italic leading-5 text-ink-secondary">
            {displayAbout}
          </p>
        </section>

        {featuredRecipe ? (
          <FeaturedRecipeDisplay recipe={featuredRecipe} />
        ) : null}

        {moreRecipes.length > 0 ? (
          <section className="feed-card flex w-full flex-col gap-3">
            <div className="flex items-center gap-2">
              <h2 className="section-title min-w-0 flex-1 text-lg">
                My Recipes ({profileRecipes.length})
              </h2>
              {hasMoreRecipes && !showAllRecipes ? (
                <button
                  type="button"
                  onClick={() => setShowAllRecipes(true)}
                  className="shrink-0 rounded bg-brand px-3 py-1 text-sm font-bold text-white hover:bg-brand-hover"
                >
                  more
                </button>
              ) : null}
            </div>
            <div className="grid w-full grid-cols-3 gap-2">
              {moreRecipes.map((recipe) => (
                <ProfileRecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
