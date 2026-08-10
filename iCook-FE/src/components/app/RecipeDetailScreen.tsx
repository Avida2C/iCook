"use client";

import Link from "next/link";
import {
  HeartIcon,
  HeartFillIcon,
  ShareIcon,
  ClockIcon,
  ServingIcon,
} from "@/components/app/icons";
import RecipeAuthor from "@/components/app/RecipeAuthor";
import CommentsSection from "@/components/app/CommentsSection";
import ContentCreatorCard from "@/components/app/ContentCreatorCard";
import RecipeThumbnail from "@/components/app/RecipeThumbnail";
import {
  CATALOG_RECIPES,
  getCategoryLabel,
  useSavedRecipes,
} from "@/components/recipes/SavedRecipesProvider";
import { useCreatedContent } from "@/components/app/CreatedContentProvider";
import { absoluteAppUrl, shareContent } from "@/lib/share";
import { resolveAuthor } from "@/components/app/user/authors";
import { useCurrentFeedUser } from "@/components/app/user/useCurrentFeedUser";
import type { Recipe } from "@/components/recipes/recipesData";

function NutritionRing({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid size-18.5 place-items-center rounded-full border-4 border-brand text-center text-sm text-ink">
      <div>
        <p className="font-bold leading-none">{value}</p>
        <p className="mt-0.5 leading-none text-muted">{label}</p>
      </div>
    </div>
  );
}

function MoreCard({ recipe }: { recipe: Recipe }) {
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
          category={recipe.category}
          alt={recipe.name}
        />
      </Link>
      <p className="mt-1 w-full truncate text-sm text-ink-secondary">{recipe.name}</p>
      <RecipeAuthor author={recipe.author} className="w-full" />
    </div>
  );
}

export default function RecipeDetailScreen({
  recipeId = "1",
}: {
  recipeId?: string;
}) {
  const me = useCurrentFeedUser();
  const { resolveRecipe, recipes: createdRecipes } = useCreatedContent();
  const recipe = resolveRecipe(recipeId);
  const { isSaved, toggleSave } = useSavedRecipes();

  if (!recipe) {
    return (
      <div className="page">
        <div className="feed-card flex flex-col items-center gap-3 py-12">
          <p className="text-center text-base text-muted">
            This recipe could not be found.
          </p>
          <Link href="/recipes" className="btn-primary text-sm">
            Browse recipes
          </Link>
        </div>
      </div>
    );
  }

  const saved = isSaved(recipe.id);
  const author = resolveAuthor(recipe.author, me);
  const moreRecipes = [
    ...createdRecipes.filter((r) => r.id !== recipe.id),
    ...CATALOG_RECIPES.filter(
      (r) => r.id !== recipe.id && !createdRecipes.some((c) => c.id === r.id),
    ),
  ].slice(0, 6);

  const nutrition = [
    { label: "Fat", value: recipe.nutrition.fat },
    { label: "Carbs", value: recipe.nutrition.carbs },
    { label: "Protein", value: recipe.nutrition.protein },
    { label: "Sodium", value: recipe.nutrition.sodium },
  ];

  const timeRows = [
    { label: "Preparation Time", value: recipe.prepTime },
    { label: "Cook Time", value: recipe.cookTime },
    { label: "Total Time", value: recipe.totalTime },
  ];

  const onShare = () => {
    void shareContent({
      title: recipe.name,
      text: `Check out ${recipe.name} on iCook`,
      url: absoluteAppUrl(`/recipe/${recipe.id}`),
    });
  };

  return (
    <div className="page">
      <div className="list-stack py-2">
        {/* Hero */}
        <div className="relative h-56 w-full overflow-hidden">
          <RecipeThumbnail
            className="size-full aspect-auto! h-full"
            iconClassName="h-14 w-16"
            src={recipe.thumbnailUrl}
            category={recipe.category}
            alt={recipe.name}
          />
        </div>

        {/* Title / meta */}
        <section className="feed-card flex flex-col gap-3">
          <div>
            <div className="flex items-center gap-2 border-b-2 border-brand py-2">
              <h1 className="min-w-0 flex-1 text-base font-bold text-ink">
                {recipe.name}
              </h1>
              <button
                type="button"
                aria-label={saved ? `Unsave ${recipe.name}` : `Save ${recipe.name}`}
                aria-pressed={saved}
                onClick={() => toggleSave(recipe)}
                className="shrink-0 text-brand"
              >
                {saved ? (
                  <HeartFillIcon className="size-7" />
                ) : (
                  <HeartIcon className="size-7" />
                )}
              </button>
              <button
                type="button"
                aria-label={`Share ${recipe.name}`}
                onClick={onShare}
                className="shrink-0 text-brand"
              >
                <ShareIcon className="size-6" />
              </button>
            </div>
            <p className="mt-2 flex gap-2 text-sm text-ink">
              <span className="font-bold text-ink-secondary">Category</span>
              <span className="italic text-muted">
                {getCategoryLabel(recipe.category)}
              </span>
            </p>
            {recipe.description ? (
              <p className="mt-2 text-sm leading-5 text-ink-secondary">
                {recipe.description}
              </p>
            ) : null}
          </div>

          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-2.5">
              {timeRows.map((row) => (
                <div key={row.label} className="flex items-center gap-2.5">
                  <ClockIcon className="size-6 shrink-0 text-brand" />
                  <div className="text-sm">
                    <p className="text-ink-secondary">{row.label}</p>
                    <p className="font-bold text-brand">{row.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <ServingIcon className="size-6 text-brand" />
              <span className="text-sm text-ink">
                {recipe.servings} Serving{recipe.servings === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <h2 className="section-title text-lg">Nutrition</h2>
            <div className="flex items-center justify-between gap-1">
              {nutrition.map((n) => (
                <NutritionRing key={n.label} {...n} />
              ))}
            </div>
          </div>
        </section>

        {/* Ingredients */}
        <section className="feed-card flex flex-col gap-3">
          <h2 className="section-title text-lg">Ingredients</h2>
          <div className="flex flex-col gap-4">
            {recipe.ingredientGroups.map((group) => (
              <div key={group.title}>
                <p className="text-sm font-bold text-ink">{group.title}</p>
                <ul className="ms-5 mt-1 list-disc text-sm text-ink-secondary">
                  {group.items.map((item) => (
                    <li key={item} className="leading-5">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Instructions */}
        <section className="feed-card flex flex-col gap-2">
          <h2 className="section-title text-lg">Instructions</h2>
          <div className="flex flex-col">
            {recipe.instructions.map((step) => (
              <div key={`${step.n}-${step.text.slice(0, 24)}`} className="flex flex-col">
                <div className="flex gap-2.5 border-b border-line py-2.5 text-sm">
                  <span className="shrink-0 font-bold text-brand">{step.n}</span>
                  <p className="flex-1 leading-5 text-ink">{step.text}</p>
                </div>
                {step.imageUrl ? (
                  <RecipeThumbnail
                    className="aspect-square w-full"
                    iconClassName="h-12 w-14"
                    src={step.imageUrl}
                    alt=""
                  />
                ) : null}
              </div>
            ))}
          </div>
        </section>

        {/* Author + comments */}
        <ContentCreatorCard
          author={author}
          me={me}
          heartPressed={saved}
          heartLabel={
            saved ? `Unsave ${recipe.name}` : `Save ${recipe.name}`
          }
          onHeart={() => toggleSave(recipe)}
          shareLabel={`Share ${recipe.name}`}
          onShare={onShare}
        >
          <CommentsSection
            targetKind="recipe"
            targetId={recipe.id}
            targetTitle={recipe.name}
          />
        </ContentCreatorCard>

        {/* More to love */}
        <section className="feed-card flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <h2 className="section-title min-w-0 flex-1 text-lg">
              More to Love!
            </h2>
            <Link
              href="/recipes/more?sort=loved"
              className="shrink-0 rounded bg-brand px-3 py-1 text-sm font-bold text-white hover:bg-brand-hover"
            >
              more
            </Link>
          </div>
          <div className="flex flex-wrap justify-between gap-y-3">
            {moreRecipes.map((r) => (
              <MoreCard key={r.id} recipe={r} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
