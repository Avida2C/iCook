"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import FeaturedRecipeDisplay from "@/components/app/FeaturedRecipeDisplay";
import RecipeAuthor from "@/components/app/RecipeAuthor";
import RecipeThumbnail from "@/components/app/RecipeThumbnail";
import UserAvatar from "@/components/app/UserAvatar";
import { useCreatedContent } from "@/components/app/CreatedContentProvider";
import {
  COMMUNITY_AUTHORS,
  normalizeAuthorKey,
} from "@/components/app/user/authors";
import { CURRENT_USER } from "@/components/app/user/data";
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
import { isProfileSeedEnabled } from "@/lib/accountData";
import { MY_RECIPES } from "@/components/app/UserCollectionScreens";

function resolveUser(handle: string) {
  const key = decodeURIComponent(handle).toLowerCase();
  if (COMMUNITY_AUTHORS[key]) return COMMUNITY_AUTHORS[key];
  if (key === CURRENT_USER.handle) return CURRENT_USER;
  const initials = key.slice(0, 2).toUpperCase();
  return {
    name: key,
    handle: key,
    initials,
    about: "iCook community member.",
  };
}

function ProfileRecipeCard({ recipe }: { recipe: CatalogRecipe }) {
  return (
    <div className="flex w-[30%] flex-col items-center">
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
      <p className="mt-1 w-full truncate text-sm text-ink-secondary">
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

  useEffect(() => {
    setPrefs(readFeaturedRecipePrefs(user.handle));
    setIncludeSeeded(isSelf && isProfileSeedEnabled());
  }, [user.handle, isSelf]);

  const profileRecipes = useMemo(() => {
    const deleted = new Set(deletedRecipeIds);

    if (isSelf) {
      const createdIds = new Set(createdRecipes.map((r) => r.id));
      const own = createdRecipes.filter((r) => !deleted.has(r.id));
      if (!includeSeeded) return own;
      return [
        ...own,
        ...MY_RECIPES.filter(
          (r) => !createdIds.has(r.id) && !deleted.has(r.id),
        ),
      ];
    }

    // Other users: created recipes authored by them, else catalog by handle.
    const authoredCreated = createdRecipes.filter(
      (r) =>
        !deleted.has(r.id) &&
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
    deletedRecipeIds,
    profileHandle,
  ]);

  const featuredRecipe = useMemo(() => {
    if (prefs.recipeId) {
      const fromList = profileRecipes.find((r) => r.id === prefs.recipeId);
      if (fromList) return fromList;
      const fromCreated = getRecipe(prefs.recipeId);
      if (
        fromCreated &&
        (isSelf || normalizeAuthorKey(fromCreated.author) === profileHandle)
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
  }, [prefs.recipeId, profileRecipes, getRecipe, isSelf, profileHandle]);

  const moreRecipes = useMemo(() => {
    const featuredId = featuredRecipe?.id;
    return profileRecipes.filter((r) => r.id !== featuredId).slice(0, 6);
  }, [profileRecipes, featuredRecipe?.id]);

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
              <p className="truncate text-xl font-bold text-brand">
                {displayName}
              </p>
              <p className="flex items-center gap-0.5 text-sm leading-[14px]">
                <span className="text-brand-soft">@</span>
                <span className="truncate text-placeholder">{user.handle}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button type="button" className="btn-primary">
              Follow
            </button>
            <Link href="/messages/1" className="btn-secondary">
              Message
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
          <FeaturedRecipeDisplay
            recipe={featuredRecipe}
            layout={prefs.layout}
          />
        ) : null}

        {moreRecipes.length > 0 ? (
          <section className="feed-card flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <h2 className="section-title min-w-0 flex-1 text-lg">
                More of My Recipes
              </h2>
            </div>
            <div className="flex flex-wrap justify-between gap-y-3">
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
