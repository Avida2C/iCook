"use client";

import Link from "next/link";
import RecipeThumbnail from "@/components/app/RecipeThumbnail";
import {
  CATALOG_RECIPES,
  useSavedRecipes,
  type CatalogRecipe,
} from "@/components/recipes/SavedRecipesProvider";

export const MY_RECIPES = CATALOG_RECIPES.slice(0, 9).map((r) => ({
  ...r,
  author: "you",
}));

function RecipeCard({
  recipe,
  showActions = false,
  onUnsave,
}: {
  recipe: CatalogRecipe;
  showActions?: boolean;
  onUnsave?: () => void;
}) {
  return (
    <div className="flex w-full flex-col items-center rounded">
      <Link
        href={`/recipe/${recipe.id}`}
        className="relative h-32 w-full overflow-hidden rounded border-2 border-line-soft"
      >
        <RecipeThumbnail className="size-full" iconClassName="h-[60px] w-[68px]" />
      </Link>

      <div className="w-full border-b border-line-soft p-1">
        <Link
          href={`/recipe/${recipe.id}`}
          className="block truncate text-sm leading-[16.8px] text-ink-secondary"
        >
          {recipe.name}
        </Link>
        <div className="flex items-center gap-0.5 py-0.5 text-xs leading-[14px]">
          <span className="text-brand-soft">@</span>
          <span className="truncate text-placeholder">{recipe.author}</span>
        </div>
      </div>

      {showActions ? (
        <div className="flex w-full items-center gap-1 pt-2 pb-1">
          <button
            type="button"
            aria-label={`Edit ${recipe.name}`}
            className="flex w-[65px] items-center gap-0.5"
          >
            <img
              src="/icons/collection/edit.svg"
              alt=""
              aria-hidden
              className="size-4 shrink-0"
            />
            <span className="px-0.5 text-xs leading-[14px] text-placeholder">
              Edit
            </span>
          </button>
          <button
            type="button"
            aria-label={`Delete ${recipe.name}`}
            className="flex w-[65px] items-center gap-0.5"
          >
            <img
              src="/icons/collection/delete.svg"
              alt=""
              aria-hidden
              className="size-4 shrink-0"
            />
            <span className="px-0.5 text-xs leading-[14px] text-placeholder">
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
            <span className="px-0.5 text-xs leading-[14px] text-placeholder">
              Unsave
            </span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function MyRecipesPanel() {
  return (
    <div className="grid w-full grid-cols-3 gap-x-2 gap-y-2 bg-surface px-2 pt-2 pb-2">
      {MY_RECIPES.length === 0 ? (
        <div className="col-span-3 flex flex-col items-center gap-3 py-8">
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
      ) : (
        MY_RECIPES.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} showActions />
        ))
      )}
    </div>
  );
}

export function SavedRecipesPanel() {
  const { savedRecipes, unsave } = useSavedRecipes();

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
