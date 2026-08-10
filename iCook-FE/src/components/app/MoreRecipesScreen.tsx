"use client";

import Link from "next/link";
import { HeartIcon, HeartFillIcon } from "@/components/app/icons";
import RecipeAuthor from "@/components/app/RecipeAuthor";
import RecipeThumbnail from "@/components/app/RecipeThumbnail";
import { usePantry } from "@/components/pantry/PantryProvider";
import {
  CATALOG_RECIPES,
  filterRecipesByCategory,
  getCategoryLabel,
  sortByMostBookmarked,
  useSavedRecipes,
  type CatalogRecipe,
} from "@/components/recipes/SavedRecipesProvider";
import { primaryCategory } from "@/components/recipes/recipesData";
import { rankRecipesByPantry } from "@/lib/pantryMatch";

function MoreRecipeCard({ recipe }: { recipe: CatalogRecipe }) {
  const { isSaved, toggleSave } = useSavedRecipes();
  const saved = isSaved(recipe.id);

  return (
    <div className="flex min-w-0 flex-col items-center rounded">
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

export default function MoreRecipesScreen({
  category,
  sort,
}: {
  category?: string;
  sort?: string;
}) {
  const { savedIds } = useSavedRecipes();
  const { items: pantryItems } = usePantry();
  const byLoved = sort === "loved";
  const byPantry = sort === "pantry";

  const pantryNames = pantryItems.map((i) => i.name).filter((n) => n.trim());
  const scoped = filterRecipesByCategory(CATALOG_RECIPES, category);

  const recipes: CatalogRecipe[] = byPantry
    ? rankRecipesByPantry(CATALOG_RECIPES, pantryNames)
    : byLoved
      ? sortByMostBookmarked(scoped, savedIds)
      : scoped;

  const title = byPantry
    ? "Recipes from my pantry"
    : byLoved
      ? category && category !== "all"
        ? `More to Love · ${getCategoryLabel(category)}`
        : "More to Love!"
      : getCategoryLabel(category);

  const emptyMessage = byPantry
    ? pantryNames.length === 0
      ? "Your pantry is empty — add ingredients to find matching recipes."
      : "No recipes match your pantry ingredients yet."
    : "No recipes in this category yet.";

  return (
    <div className="page">
      <section className="flex w-full flex-col gap-2 bg-surface px-2 pt-2 pb-4">
        <h1 className="text-xl leading-6 text-brand">{title}</h1>
        {byPantry && pantryNames.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-1 py-6">
            <p className="text-center text-sm text-muted">{emptyMessage}</p>
            <Link
              href="/hub"
              className="rounded bg-brand px-4 py-2 text-sm font-bold text-white"
            >
              Open pantry
            </Link>
          </div>
        ) : recipes.length === 0 ? (
          <p className="px-1 py-6 text-center text-sm text-muted">
            {emptyMessage}
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {recipes.map((recipe) => (
              <MoreRecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
