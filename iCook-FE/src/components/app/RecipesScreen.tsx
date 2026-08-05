"use client";

import Image from "next/image";
import Link from "next/link";
import { HeartIcon, HeartFillIcon } from "@/components/app/icons";
import RecipeThumbnail from "@/components/app/RecipeThumbnail";
import {
  CATALOG_RECIPES,
  RECIPE_CATEGORIES,
  sortByMostBookmarked,
  useSavedRecipes,
  type CatalogRecipe,
} from "@/components/recipes/SavedRecipesProvider";

function DiscoverRecipeCard({ recipe }: { recipe: CatalogRecipe }) {
  const { isSaved, toggleSave } = useSavedRecipes();
  const saved = isSaved(recipe.id);

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center rounded">
      <div className="relative w-full max-w-33.75">
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
          className="absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded bg-brand text-white"
        >
          {saved ? (
            <HeartFillIcon className="size-3.5" />
          ) : (
            <HeartIcon className="size-3.5" />
          )}
        </button>
      </div>

      <div className="w-full max-w-33.75 p-1">
        <Link
          href={`/recipe/${recipe.id}`}
          className="block truncate text-sm leading-[16.8px] text-ink-secondary"
        >
          {recipe.name}
        </Link>
        <div className="flex items-center gap-0.5 py-0.5 text-xs leading-3.5">
          <span className="text-brand-soft">@</span>
          <span className="truncate text-placeholder">{recipe.author}</span>
        </div>
      </div>
    </div>
  );
}

function RecipeSection({
  title,
  recipes,
  moreHref,
}: {
  title: string;
  recipes: CatalogRecipe[];
  moreHref: string;
}) {
  return (
    <section className="flex w-full flex-col gap-2 bg-surface px-2 pt-2 pb-4">
      <div className="flex items-start gap-4">
        <h2 className="min-w-0 flex-1 text-xl leading-6 text-brand">{title}</h2>
        <Link
          href={moreHref}
          className="shrink-0 rounded bg-brand px-2 py-0.5 text-center text-base leading-[22.4px] text-white"
        >
          more
        </Link>
      </div>
      <div className="flex items-start gap-2">
        {recipes.map((recipe) => (
          <DiscoverRecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </section>
  );
}

function FeaturedRecipeCta({ recipe }: { recipe: CatalogRecipe }) {
  return (
    <section className="relative w-full overflow-hidden rounded">
      <RecipeThumbnail className="h-62 w-full rounded" iconClassName="h-16 w-[72px]" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-brand/75 px-8 pt-10 pb-4 text-app">
        <div className="flex w-full flex-col items-start rounded-lg border-2 border-app px-5 py-4">
          <p className="text-base leading-[22.4px]">{recipe.name}</p>
          <p className="text-base leading-[22.4px]">
            Classic Italian comfort made simple. Homemade ravioli filled with a
            velvety ricotta blend, paired perfectly with a bright, slow-simmered
            tomato and basil sauce.
          </p>
        </div>
        <Link
          href={`/recipe/${recipe.id}`}
          className="w-full text-right text-xl leading-6"
        >
          View Recipe
        </Link>
      </div>
    </section>
  );
}

export default function RecipesScreen() {
  const { savedIds } = useSavedRecipes();
  const mostLoved = sortByMostBookmarked(CATALOG_RECIPES, savedIds);
  const topLoved = mostLoved.slice(0, 3);
  const nextLoved = mostLoved.slice(3, 6);
  const featured = mostLoved[0] ?? CATALOG_RECIPES[0];

  return (
    <div className="flex flex-col gap-1 pb-4">
      <div className="bg-surface px-2 pt-2 pb-4">
        <div className="grid grid-cols-5 gap-2">
          {RECIPE_CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/recipes/more?category=${cat.slug}`}
              className="flex flex-col items-center justify-center gap-1 pt-4"
            >
              <span className="relative size-13.75 shrink-0 overflow-hidden">
                <Image
                  src={cat.icon}
                  alt=""
                  fill
                  sizes="55px"
                  className="object-cover"
                />
              </span>
              <span className="w-full truncate text-center text-[14px] leading-[16.8px] font-normal text-ink-secondary">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <RecipeSection
        title="Most Loved Recipes!"
        recipes={topLoved}
        moreHref="/recipes/more?sort=loved"
      />
      <FeaturedRecipeCta recipe={featured} />
      {nextLoved.length > 0 ? (
        <RecipeSection
          title="Most Loved Recipes!"
          recipes={nextLoved}
          moreHref="/recipes/more?sort=loved"
        />
      ) : null}
    </div>
  );
}
