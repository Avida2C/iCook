/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-img-element */
"use client";

import FeaturedRecipeDisplay from "@/components/app/FeaturedRecipeDisplay";
import RecipeAuthor from "@/components/app/RecipeAuthor";
import RecipeThumbnail from "@/components/app/RecipeThumbnail";
import { useCreatedContent } from "@/components/app/CreatedContentProvider";
import { useCurrentFeedUser } from "@/components/app/user/useCurrentFeedUser";
import {
  CATALOG_RECIPES,
  useSavedRecipes,
  type CatalogRecipe,
} from "@/components/recipes/SavedRecipesProvider";
import { isProfileSeedEnabled } from "@/lib/accountData";
import {
  DEFAULT_FEATURED_RECIPE_PREFS,
  readFeaturedRecipePrefs,
  writeFeaturedRecipePrefs,
  type FeaturedRecipeLayout,
  type FeaturedRecipePrefs,
} from "@/lib/featuredRecipePrefs";
import { publicProfilePath } from "@/lib/userProfile";
import { primaryCategory } from "@/components/recipes/recipesData";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

export const MY_RECIPES = CATALOG_RECIPES.slice(0, 9).map((r) => ({
  ...r,
  author: "you",
}));

function RecipeCard({
  recipe,
  showActions = false,
  featured = false,
  onUnsave,
  onDelete,
}: {
  recipe: CatalogRecipe;
  showActions?: boolean;
  featured?: boolean;
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
        {featured ? (
          <span className="absolute top-1 left-1 rounded bg-brand px-1.5 py-0.5 text-[10px] font-bold text-white">
            Featured
          </span>
        ) : null}
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

function FeaturedLayoutPicker({
  layout,
  onChange,
}: {
  layout: FeaturedRecipeLayout;
  onChange: (layout: FeaturedRecipeLayout) => void;
}) {
  const options: { id: FeaturedRecipeLayout; label: string; hint: string }[] = [
    {
      id: "hero",
      label: "Featured",
      hint: "Full-bleed image with overlay",
    },
    {
      id: "banner",
      label: "Featured banner",
      hint: "Compact strip with thumbnail",
    },
  ];

  return (
    <div
      className="grid grid-cols-2 gap-2"
      role="radiogroup"
      aria-label="Featured recipe layout"
    >
      {options.map((opt) => {
        const selected = layout === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.id)}
            className={`rounded border px-2.5 py-2 text-left transition-colors ${
              selected
                ? "border-brand bg-brand/10 text-brand"
                : "border-line bg-surface text-ink-secondary hover:border-brand/40"
            }`}
          >
            <p className="text-sm font-bold">{opt.label}</p>
            <p className="mt-0.5 text-[11px] leading-snug text-muted">
              {opt.hint}
            </p>
          </button>
        );
      })}
    </div>
  );
}

export function MyRecipesPanel() {
  const me = useCurrentFeedUser();
  const {
    recipes: createdRecipes,
    deleteRecipe,
    deletedRecipeIds,
  } = useCreatedContent();
  const [includeSeeded, setIncludeSeeded] = useState(true);
  const [prefs, setPrefs] = useState<FeaturedRecipePrefs>(
    DEFAULT_FEATURED_RECIPE_PREFS,
  );

  useEffect(() => {
    setIncludeSeeded(isProfileSeedEnabled());
    setPrefs(readFeaturedRecipePrefs(me.handle));
  }, [me.handle]);

  const persistPrefs = (next: FeaturedRecipePrefs) => {
    setPrefs(next);
    writeFeaturedRecipePrefs(me.handle, next);
  };

  const deleted = new Set(deletedRecipeIds);
  const createdIds = new Set(createdRecipes.map((r) => r.id));
  const ownRecipes = createdRecipes.filter((r) => !deleted.has(r.id));
  const recipes = includeSeeded
    ? [
        ...ownRecipes,
        ...MY_RECIPES.filter(
          (r) => !createdIds.has(r.id) && !deleted.has(r.id),
        ),
      ]
    : ownRecipes;

  const featuredRecipe = useMemo(() => {
    if (!prefs.recipeId) return null;
    return ownRecipes.find((r) => r.id === prefs.recipeId) ?? null;
  }, [ownRecipes, prefs.recipeId]);

  useEffect(() => {
    if (prefs.recipeId && !featuredRecipe) {
      const next = { ...prefs, recipeId: null };
      setPrefs(next);
      writeFeaturedRecipePrefs(me.handle, next);
    }
  }, [prefs, featuredRecipe, me.handle]);

  const onDelete = (id: string) => {
    deleteRecipe(id);
    if (prefs.recipeId === id) {
      persistPrefs({ ...prefs, recipeId: null });
    }
  };

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
      <div className="flex flex-col gap-3 bg-surface px-3 pt-2 pb-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-bold text-ink-secondary">
            Featured on public profile
          </p>
          <Link
            href={publicProfilePath(me.handle)}
            className="text-xs font-bold text-brand"
          >
            Preview
          </Link>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="featured-recipe-select"
            className="text-xs font-bold text-muted"
          >
            Recipe
          </label>
          {ownRecipes.length === 0 ? (
            <p className="rounded border border-line bg-app px-2.5 py-2 text-sm text-muted">
              Create a recipe to feature it on your public profile.
            </p>
          ) : (
            <select
              id="featured-recipe-select"
              value={prefs.recipeId ?? ""}
              onChange={(e) =>
                persistPrefs({
                  ...prefs,
                  recipeId: e.target.value || null,
                })
              }
              className="field-sm w-full"
            >
              <option value="">None</option>
              {ownRecipes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-bold text-muted">Layout</p>
          <FeaturedLayoutPicker
            layout={prefs.layout}
            onChange={(layout) => persistPrefs({ ...prefs, layout })}
          />
        </div>
      </div>

      {featuredRecipe ? (
        <FeaturedRecipeDisplay
          recipe={featuredRecipe}
          layout={prefs.layout}
        />
      ) : (
        <p className="bg-surface px-3 pb-2 text-sm text-muted">
          No featured recipe yet
          {ownRecipes.length > 0
            ? " — choose a recipe and layout above."
            : " — create a recipe to feature one."}
        </p>
      )}

      <div className="grid w-full grid-cols-3 gap-x-2 gap-y-2 bg-surface px-2 pt-2 pb-2">
        {recipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            showActions
            featured={featuredRecipe?.id === recipe.id}
            onDelete={() => onDelete(recipe.id)}
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
