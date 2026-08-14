/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-img-element */
"use client";

import { HeartIcon, HeartFillIcon } from "@/components/app/icons";
import RecipeAuthor from "@/components/app/RecipeAuthor";
import RecipeThumbnail from "@/components/app/RecipeThumbnail";
import { useCreatedContent } from "@/components/app/CreatedContentProvider";
import { useCurrentFeedUser } from "@/components/app/user/useCurrentFeedUser";
import { isOwnAuthor } from "@/components/app/user/authors";
import {
  CATALOG_RECIPES,
  useSavedRecipes,
  type CatalogRecipe,
} from "@/components/recipes/SavedRecipesProvider";
import { isProfileSeedEnabled } from "@/lib/accountData";
import {
  DEFAULT_FEATURED_RECIPE_PREFS,
  readFeaturedRecipePrefs,
  type FeaturedRecipePrefs,
} from "@/lib/featuredRecipePrefs";
import { primaryCategory } from "@/components/recipes/recipesData";
import { useEffect, useState } from "react";
import Link from "next/link";

export const MY_RECIPES = CATALOG_RECIPES.slice(0, 9).map((r) => ({
  ...r,
  author: "you",
}));

function RecipeCard({
  recipe,
  featured = false,
}: {
  recipe: CatalogRecipe;
  featured?: boolean;
}) {
  const { isSaved, toggleSave } = useSavedRecipes();
  const saved = isSaved(recipe.id);

  return (
    <div className="flex min-w-0 w-full flex-col items-center rounded">
      <div className="relative w-full">
        <Link
          href={`/recipe/${recipe.id}`}
          className="relative block aspect-square w-full overflow-hidden rounded border-2 border-line-soft"
        >
          <RecipeThumbnail
            className="size-full"
            iconClassName="h-[60px] w-[68px]"
            src={recipe.thumbnailUrl}
            category={primaryCategory(recipe)}
            alt={recipe.name}
          />
        </Link>
        {featured ? (
          <span className="absolute top-1 left-1 rounded bg-brand px-1.5 py-0.5 text-[10px] font-bold text-white">
            Featured
          </span>
        ) : null}
        <button
          type="button"
          aria-label={saved ? `Unsave ${recipe.name}` : `Save ${recipe.name}`}
          aria-pressed={saved}
          onClick={() => toggleSave(recipe)}
          className="absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded bg-brand text-white"
        >
          {saved ? (
            <HeartFillIcon className="size-3.5" />
          ) : (
            <HeartIcon className="size-3.5" />
          )}
        </button>
      </div>

      <div className="w-full p-1">
        <Link
          href={`/recipe/${recipe.id}`}
          className="block truncate text-sm leading-[16.8px] text-ink-secondary"
        >
          {recipe.name}
        </Link>
        <RecipeAuthor author={recipe.author} />
      </div>
    </div>
  );
}

export function MyRecipesPanel() {
  const me = useCurrentFeedUser();
  const { recipes: createdRecipes, deletedRecipeIds } = useCreatedContent();
  const [includeSeeded, setIncludeSeeded] = useState(true);
  const [prefs, setPrefs] = useState<FeaturedRecipePrefs>(
    DEFAULT_FEATURED_RECIPE_PREFS,
  );

  useEffect(() => {
    setIncludeSeeded(isProfileSeedEnabled());
    setPrefs(readFeaturedRecipePrefs(me.handle));
  }, [me.handle]);

  const deleted = new Set(deletedRecipeIds);
  const ownRecipes = createdRecipes.filter(
    (r) => isOwnAuthor(r.author, me) && !deleted.has(r.id),
  );
  const createdIds = new Set(ownRecipes.map((r) => r.id));
  const recipes = includeSeeded
    ? [
        ...ownRecipes,
        ...MY_RECIPES.filter(
          (r) => !createdIds.has(r.id) && !deleted.has(r.id),
        ),
      ]
    : ownRecipes;

  if (recipes.length === 0) {
    return (
      <div className="flex w-full flex-col items-center gap-3 bg-surface px-2 py-8">
        <p className="text-center text-base text-muted">
          No recipes yet — create your first one.
        </p>
        <Link
          href="/create/recipe"
          className="rounded bg-brand px-4 py-2 text-sm font-bold text-white"
        >
          Create a Recipe
        </Link>
      </div>
    );
  }

  return (
    <div className="grid w-full grid-cols-3 gap-x-2 gap-y-2 bg-surface px-2 pt-2 pb-2">
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          featured={prefs.recipeId === recipe.id}
        />
      ))}
    </div>
  );
}

export function SavedRecipesPanel() {
  const { savedIds } = useSavedRecipes();
  const { resolveVisibleRecipe } = useCreatedContent();
  const savedRecipes = savedIds
    .map((id) => resolveVisibleRecipe(id))
    .filter((r): r is NonNullable<typeof r> => Boolean(r));

  return (
    <div className="grid w-full grid-cols-3 gap-x-2 gap-y-2 bg-surface px-2 pt-2 pb-2">
      {savedRecipes.length === 0 ? (
        <p className="col-span-3 py-8 text-center text-base text-muted">
          No saved recipes yet. Like a recipe from Discover or Recipes to save
          it here.
        </p>
      ) : (
        savedRecipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))
      )}
    </div>
  );
}

export function MyRecipesScreen() {
  return (
    <div className="flex min-h-full flex-col bg-surface">
      <div className="flex items-center gap-2 border-b border-line px-3 py-3">
        <img
          src="/icons/collection/utensils.svg"
          alt=""
          aria-hidden
          className="h-5 w-4"
        />
        <h1 className="text-lg font-bold text-brand">My Recipes</h1>
      </div>
      <MyRecipesPanel />
    </div>
  );
}

export function SavedRecipesScreen() {
  return (
    <div className="flex min-h-full flex-col bg-surface">
      <div className="flex items-center gap-2 border-b border-line px-3 py-3">
        <img
          src="/icons/collection/save.svg"
          alt=""
          aria-hidden
          className="size-5"
        />
        <h1 className="text-lg font-bold text-brand">Saved Recipes</h1>
      </div>
      <SavedRecipesPanel />
    </div>
  );
}
