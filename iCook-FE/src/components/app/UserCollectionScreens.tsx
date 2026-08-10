/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-img-element */
"use client";

import FeaturedRecipeBannerCta from "@/components/app/FeaturedRecipeBannerCta";
import RecipeAuthor from "@/components/app/RecipeAuthor";
import RecipeThumbnail from "@/components/app/RecipeThumbnail";
import { useCreatedContent } from "@/components/app/CreatedContentProvider";
import {
  CATALOG_RECIPES,
  useSavedRecipes,
  type CatalogRecipe,
} from "@/components/recipes/SavedRecipesProvider";
import { isProfileSeedEnabled } from "@/lib/accountData";
import { primaryCategory } from "@/components/recipes/recipesData";
import { useEffect, useState } from "react";
import Link from "next/link";

export const MY_RECIPES = CATALOG_RECIPES.slice(0, 9).map((r) => ({
  ...r,
  author: "you",
}));

function recipeFeaturedDescription(recipe: CatalogRecipe & { preview?: string }) {
  if (recipe.preview?.trim()) return recipe.preview.trim();
  if (recipe.description?.trim()) return recipe.description.trim();
  return `A ${primaryCategory(recipe)} favorite from your kitchen. Tap to open the full recipe.`;
}

function RecipeCard({
  recipe,
  showActions = false,
  onUnsave,
  onDelete,
}: {
  recipe: CatalogRecipe;
  showActions?: boolean;
  onUnsave?: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className="flex w-full flex-col items-center rounded">
      <Link
        href={`/recipe/${recipe.id}`}
        className="relative aspect-square w-full overflow-hidden rounded border-2 border-line-soft"
      >
        <RecipeThumbnail
          className="size-full"
          iconClassName="h-[60px] w-[68px]"
          src={recipe.thumbnailUrl}
          category={primaryCategory(recipe)}
          alt={recipe.name}
        />
      </Link>

      <div className="w-full border-b border-line-soft p-1">
        <Link
          href={`/recipe/${recipe.id}`}
          className="block truncate text-sm leading-[16.8px] text-ink-secondary"
        >
          {recipe.name}
        </Link>
        <RecipeAuthor author={recipe.author} />
      </div>

      {showActions ? (
        <div className="flex w-full items-center gap-1 pt-2 pb-1">
          <Link
            href={`/recipe/${recipe.id}/edit`}
            aria-label={`Edit ${recipe.name}`}
            className="flex w-16.25 items-center gap-0.5"
          >
            <img
              src="/icons/collection/edit.svg"
              alt=""
              aria-hidden
              className="size-4 shrink-0"
            />
            <span className="px-0.5 text-xs leading-3.5 text-placeholder">
              Edit
            </span>
          </Link>
          <button
            type="button"
            aria-label={`Delete ${recipe.name}`}
            onClick={onDelete}
            className="flex w-16.25 items-center gap-0.5"
          >
            <img
              src="/icons/collection/delete.svg"
              alt=""
              aria-hidden
              className="size-4 shrink-0"
            />
            <span className="px-0.5 text-xs leading-3.5 text-placeholder">
              Delete
            </span>
          </button>
        </div>
      ) : onUnsave ? (
        <div className="flex w-full items-center gap-1 pt-2 pb-1">
          <button
            type="button"
            onClick={onUnsave}
            aria-label={`Unsave ${recipe.name}`}
            className="flex items-center gap-0.5"
          >
            <img
              src="/icons/collection/delete.svg"
              alt=""
              aria-hidden
              className="size-4 shrink-0"
            />
            <span className="px-0.5 text-xs leading-3.5 text-placeholder">
              Unsave
            </span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function MyRecipesPanel() {
  const {
    recipes: createdRecipes,
    deleteRecipe,
    deletedRecipeIds,
  } = useCreatedContent();
  const [includeSeeded, setIncludeSeeded] = useState(true);

  useEffect(() => {
    setIncludeSeeded(isProfileSeedEnabled());
  }, []);

  const deleted = new Set(deletedRecipeIds);
  const createdIds = new Set(createdRecipes.map((r) => r.id));
  const recipes = includeSeeded
    ? [
        ...createdRecipes.filter((r) => !deleted.has(r.id)),
        ...MY_RECIPES.filter(
          (r) => !createdIds.has(r.id) && !deleted.has(r.id),
        ),
      ]
    : createdRecipes.filter((r) => !deleted.has(r.id));
  const featured = recipes[0];

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
    <div className="flex w-full flex-col gap-1">
      {featured ? (
        <FeaturedRecipeBannerCta
          recipe={featured}
          description={recipeFeaturedDescription(featured)}
        />
      ) : null}
      <div className="grid w-full grid-cols-3 gap-x-2 gap-y-2 bg-surface px-2 pt-2 pb-2">
        {recipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            showActions
            onDelete={() => deleteRecipe(recipe.id)}
          />
        ))}
      </div>
    </div>
  );
}

export function SavedRecipesPanel() {
  const { savedIds, unsave } = useSavedRecipes();
  const { resolveRecipe } = useCreatedContent();
  const savedRecipes = savedIds
    .map((id) => resolveRecipe(id))
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
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            onUnsave={() => unsave(recipe.id)}
          />
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
