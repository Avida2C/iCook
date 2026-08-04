"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BackIcon } from "@/components/app/icons";
import RecipeThumbnail from "@/components/app/RecipeThumbnail";
import {
  CATALOG_RECIPES,
  filterRecipesByCategory,
  getCategoryLabel,
  sortByMostBookmarked,
  useSavedRecipes,
  type CatalogRecipe,
} from "@/components/recipes/SavedRecipesProvider";

function MoreRecipeCard({ recipe }: { recipe: CatalogRecipe }) {
  const { isSaved, toggleSave } = useSavedRecipes();
  const saved = isSaved(recipe.id);

  return (
    <div className="flex min-w-0 flex-col items-center rounded">
      <div className="relative w-full">
        <Link
          href={`/recipe/${recipe.id}`}
          className="relative block h-32 w-full overflow-hidden rounded border-2 border-line-soft"
        >
          <RecipeThumbnail className="size-full" iconClassName="h-[60px] w-[68px]" />
        </Link>
        <button
          type="button"
          aria-label={saved ? `Unsave ${recipe.name}` : `Save ${recipe.name}`}
          aria-pressed={saved}
          onClick={() => toggleSave(recipe)}
          className="absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded bg-brand p-1.5"
        >
          <img
            src={
              saved
                ? "/icons/recipes/bookmark-fill.svg"
                : "/icons/recipes/bookmark-empty.svg"
            }
            alt=""
            aria-hidden
            className="h-[13.5px] w-[10.83px]"
          />
        </button>
      </div>

      <div className="w-full p-1">
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
  const router = useRouter();
  const { savedIds } = useSavedRecipes();
  const byLoved = sort === "loved";

  const scoped = filterRecipesByCategory(CATALOG_RECIPES, category);
  const recipes = byLoved
    ? sortByMostBookmarked(scoped, savedIds)
    : scoped;

  const title = byLoved
    ? category && category !== "all"
      ? `Most Loved · ${getCategoryLabel(category)}`
      : "Most Loved Recipes!"
    : getCategoryLabel(category);

  return (
    <div className="page">
      <div className="subhead">
        <button type="button" onClick={() => router.back()} aria-label="Back">
          <BackIcon className="size-6 text-ink" />
        </button>
        <span className="section-title truncate">{title}</span>
      </div>

      <section className="flex w-full flex-col gap-2 bg-surface px-2 pt-2 pb-4">
        <h1 className="text-xl leading-6 text-brand">{title}</h1>
        {recipes.length === 0 ? (
          <p className="px-1 py-6 text-center text-sm text-muted">
            No recipes in this category yet.
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
