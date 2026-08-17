"use client";

import FeaturedRecipeBannerCta from "@/components/app/FeaturedRecipeBannerCta";
import FeaturedRecipeHeroCta from "@/components/app/FeaturedRecipeHeroCta";
import RecipeAuthor from "@/components/app/RecipeAuthor";
import RecipeThumbnail from "@/components/app/RecipeThumbnail";
import { useCreatedContent } from "@/components/app/CreatedContentProvider";
import {
  RECIPE_CATEGORIES,
  categoryHref,
  sortByMostBookmarked,
  sortByQuickToMake,
  useSavedRecipes,
  type CatalogRecipe,
} from "@/components/recipes/SavedRecipesProvider";
import { primaryCategory } from "@/components/recipes/recipesData";
import { HeartIcon, HeartFillIcon } from "@/components/app/icons";
import Image from "next/image";
import Link from "next/link";

function featuredDescription(recipe: CatalogRecipe) {
  if (recipe.description?.trim()) return recipe.description.trim();
  return `A community favorite ${primaryCategory(recipe)} recipe from @${recipe.author}. Tap to open the full recipe.`;
}

function DiscoverRecipeCard({ recipe }: { recipe: CatalogRecipe }) {
  const { isSaved, toggleSave } = useSavedRecipes();
  const saved = isSaved(recipe.id);

  return (
    <div className="flex min-w-0 w-full flex-col items-stretch rounded">
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
        <h2 className="min-w-0 flex-1 text-xl leading-6 font-bold text-brand">
          {title}
        </h2>
        <Link
          href={moreHref}
          className="shrink-0 rounded bg-brand px-2 py-0.5 text-center text-base leading-[22.4px] text-white"
        >
          more
        </Link>
      </div>
      <div className="grid w-full grid-cols-3 gap-2">
        {recipes.map((recipe) => (
          <DiscoverRecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </section>
  );
}

export default function RecipesScreen() {
  const { savedIds } = useSavedRecipes();
  const { publicRecipes } = useCreatedContent();
  const mostLoved = sortByMostBookmarked(publicRecipes, savedIds);
  const quickToMake = sortByQuickToMake(publicRecipes);
  const heroRecipe =
    publicRecipes.find((r) => r.id === "1") ?? mostLoved[0] ?? publicRecipes[0];
  const compactRecipe =
    publicRecipes.find((r) => r.id === "11") ??
    mostLoved.find((r) => r.id !== heroRecipe.id) ??
    publicRecipes[1] ??
    heroRecipe;
  const topLoved = mostLoved.slice(0, 3);
  const moreLoved = mostLoved.slice(3, 6);
  const topQuick = quickToMake.slice(0, 3);

  return (
    <div className="flex flex-col gap-1.5 pb-2">
      <div className="bg-surface px-2 pt-2 pb-4">
        <div className="grid grid-cols-5 gap-2">
          {RECIPE_CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={categoryHref(cat.slug)}
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
{topQuick.length > 0 ? (
        <RecipeSection
          title="Quickest Meals"
          recipes={topQuick}
          moreHref="/recipes/more?sort=quick"
        />
      ) : null}
      <FeaturedRecipeHeroCta
        recipe={heroRecipe}
        description={featuredDescription(heroRecipe)}
      />

      {topLoved.length > 0 ? (
        <RecipeSection
          title="Most Loved Recipes!"
          recipes={topLoved}
          moreHref="/recipes/more?sort=loved"
        />
      ) : null}

      <FeaturedRecipeBannerCta
        recipe={compactRecipe}
        description={featuredDescription(compactRecipe)}
      />

      {moreLoved.length > 0 ? (
        <RecipeSection
          title="More to Love"
          recipes={moreLoved}
          moreHref="/recipes/more?sort=loved"
        />
      ) : null}

      
    </div>
  );
}
