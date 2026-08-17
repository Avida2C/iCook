"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  HeartIcon,
  HeartFillIcon,
  ShareIcon,
  ClockIcon,
  ServingIcon,
  EditIcon,
  TrashIcon,
  CalendarIcon,
} from "@/components/app/icons";
import { useWeekPlan } from "@/components/plan/WeekPlanProvider";
import RecipeAuthor from "@/components/app/RecipeAuthor";
import CommentsSection from "@/components/app/CommentsSection";
import ContentCreatorCard from "@/components/app/ContentCreatorCard";
import FeaturedRecipeBannerCta from "@/components/app/FeaturedRecipeBannerCta";
import { recipeFeaturedDescription } from "@/components/app/FeaturedRecipeDisplay";
import RecipeThumbnail from "@/components/app/RecipeThumbnail";
import {
  getCategoryLabel,
  useSavedRecipes,
  type CatalogRecipe,
} from "@/components/recipes/SavedRecipesProvider";
import { useCreatedContent } from "@/components/app/CreatedContentProvider";
import { isPublishEmbargoed } from "@/lib/publishVisibility";
import { absoluteAppUrl, shareContent } from "@/lib/share";
import { isOwnAuthor, resolveAuthor } from "@/components/app/user/authors";
import { useCurrentFeedUser } from "@/components/app/user/useCurrentFeedUser";
import {
  primaryCategory,
  type Recipe,
  hasNutritionFacts,
  nutritionFactRows,
  resolveRecipeTags,
  RECIPE_TAG_LABELS,
  formatIngredientLine,
  formatRecipeCreatedDate,
  resolveRecipeCreatedAt,
} from "@/components/recipes/recipesData";

function pickRandomRecipe(recipes: CatalogRecipe[]) {
  if (recipes.length === 0) return null;
  return recipes[Math.floor(Math.random() * recipes.length)] ?? null;
}

function pickTwoRandomRecipes(recipes: CatalogRecipe[]) {
  if (recipes.length === 0) return [null, null] as const;
  const first = pickRandomRecipe(recipes);
  if (!first || recipes.length === 1) return [first, first] as const;
  const rest = recipes.filter((r) => r.id !== first.id);
  return [first, pickRandomRecipe(rest)] as const;
}

function NutritionRing({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid size-18.5 place-items-center rounded-full border-4 border-brand px-1 text-center text-sm text-ink">
      <div>
        <p className="font-bold leading-none">{value}</p>
        <p className="mt-0.5 text-[10px] leading-tight text-muted">{label}</p>
      </div>
    </div>
  );
}

function MoreCard({ recipe }: { recipe: Recipe }) {
  const { isSaved, toggleSave } = useSavedRecipes();
  const saved = isSaved(recipe.id);

  return (
    <div className="flex w-[30%] flex-col items-center">
      <div className="relative w-full">
        <Link
          href={`/recipe/${recipe.id}`}
          className="relative block aspect-square w-full overflow-hidden rounded border border-line"
        >
          <RecipeThumbnail
            className="size-full"
            iconClassName="h-10 w-11"
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
  const router = useRouter();
  const me = useCurrentFeedUser();
  const {
    resolveVisibleRecipe,
    getRecipe,
    deleteRecipe,
    publicRecipes,
  } = useCreatedContent();
  const recipe = resolveVisibleRecipe(recipeId);
  const { isSaved, toggleSave } = useSavedRecipes();
  const { openAddToWeek } = useWeekPlan();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [ingredientsFeatured, setIngredientsFeatured] =
    useState<CatalogRecipe | null>(null);
  const [commentsFeatured, setCommentsFeatured] =
    useState<CatalogRecipe | null>(null);

  const featuredPool = publicRecipes.filter((r) => r.id !== recipeId);
  const featuredPoolKey = featuredPool.map((r) => r.id).join(",");

  useEffect(() => {
    const [aboveIngredients, underComments] =
      pickTwoRandomRecipes(featuredPool);
    setIngredientsFeatured(aboveIngredients);
    setCommentsFeatured(underComments);
    // Intentionally keyed by pool identity so the CTAs stay stable while viewing.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- featuredPoolKey
  }, [recipeId, featuredPoolKey]);

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

  const created = getRecipe(recipe.id);
  // Own only when authored by the signed-in user (created clone or catalog author).
  // Do not treat demo MY_RECIPES ids as owned for every account.
  const isOwner = isOwnAuthor(
    created?.author ?? recipe.author,
    me,
  );

  const saved = isSaved(recipe.id);
  const author = resolveAuthor(recipe.author, me);

  const moreRecipes = featuredPool.slice(0, 6);

  const nutrition = nutritionFactRows(recipe.nutrition);
  const showNutrition = hasNutritionFacts(recipe.nutrition);
  const tags = resolveRecipeTags(recipe);
  const createdAt = resolveRecipeCreatedAt(recipe, created?.createdAt);

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

  const onDelete = () => {
    if (!isOwner) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    deleteRecipe(recipe.id);
    router.push("/me");
  };

  return (
    <div className="page relative">
      <div className="list-stack py-2">
        {/* Hero */}
        <div className="relative h-56 w-full overflow-hidden">
          <RecipeThumbnail
            className="size-full aspect-auto! h-full"
            iconClassName="h-14 w-16"
            src={recipe.thumbnailUrl}
            category={primaryCategory(recipe)}
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
            {recipe.description ? (
              <p className="mt-2 text-sm leading-5 text-ink-secondary">
                {recipe.description}
              </p>
            ) : null}
                        <button
              type="button"
              onClick={() =>
                openAddToWeek({
                  recipeId: recipe.id,
                  recipeName: recipe.name,
                })
              }
              className="btn-secondary mt-2 w-full text-sm"
            >
              <CalendarIcon className="size-4" />
              Add to Weekly Planner
            </button>
            <div className="mt-2 flex flex-col gap-1">
              <p className="flex gap-2 text-sm text-ink">
                <span className="font-bold text-ink-secondary">
                  {recipe.categories.length > 1 ? "Categories" : "Category"}
                </span>
                <span className="italic text-muted">
                  {recipe.categories.map((c) => getCategoryLabel(c)).join(", ")}
                </span>
              </p>
              <p className="flex gap-2 text-sm text-ink">
                <span className="font-bold text-ink-secondary">Created date</span>
                <span className="italic text-muted">
                  {formatRecipeCreatedDate(createdAt)}
                </span>
              </p>
              {isOwner && created?.isPrivate ? (
                <p className="text-xs italic text-muted">
                  This recipe is private. Only you can see it.
                </p>
              ) : isOwner && created && isPublishEmbargoed(created.createdAt) ? (
                <p className="text-xs italic text-muted">
                  Only you can see this recipe for the first hour after publishing.
                </p>
              ) : null}
                        {tags.length > 0 ? (
            <div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md border border-brand/30 bg-brand/10 px-2 py-0.5 text-xs font-bold text-brand"
                  >
                    {RECIPE_TAG_LABELS[tag]}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
            </div>
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

          {showNutrition ? (
            <div className="flex flex-col gap-2.5">
              <div>
                <h2 className="section-title text-lg">Nutrition</h2><p className="mt-0.5 text-xs italic text-muted">Per serving</p>
                
              </div>
              
              <div className="flex flex-wrap items-center justify-start gap-2">
                {nutrition.map((n) => (
                  <NutritionRing key={n.key} label={n.label} value={n.value} />
                ))}
              </div>
            </div>
          ) : null}
          
        </section>

        {ingredientsFeatured ? (
          <FeaturedRecipeBannerCta
            recipe={ingredientsFeatured}
            description={recipeFeaturedDescription(ingredientsFeatured)}
          />
        ) : null}

        {/* Ingredients */}
        <section className="feed-card flex flex-col gap-3">
          <h2 className="section-title text-lg">Ingredients</h2>
          <div className="flex flex-col gap-4">
            {recipe.ingredientGroups.map((group) => (
              <div key={group.title}>
                <p className="text-sm font-bold text-ink">{group.title}</p>
                <ul className="ms-5 mt-1 list-disc text-sm text-ink-secondary">
                  {group.items.map((item) => {
                    const label = formatIngredientLine(item);
                    return (
                      <li key={`${item.name}-${label}`} className="leading-5">
                        {label}
                      </li>
                    );
                  })}
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

          {isOwner ? (
            <div className="flex items-center pt-1 text-sm text-muted">
              <div className="ms-auto flex items-center gap-1">
                {confirmDelete ? (
                  <>
                    <button
                      type="button"
                      onClick={onDelete}
                      className="inline-flex items-center gap-1 rounded bg-brand px-2.5 py-1.5 text-xs font-bold text-white"
                    >
                      <TrashIcon className="size-3.5" />
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="px-2 py-1.5 text-xs font-bold text-muted"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href={`/recipe/${recipe.id}/edit`}
                      aria-label={`Edit ${recipe.name}`}
                      className="inline-flex items-center gap-1 rounded px-2 py-1.5 text-xs font-bold text-placeholder transition-colors hover:bg-brand/10 hover:text-brand"
                    >
                      <EditIcon className="size-3.5" />
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={onDelete}
                      aria-label={`Delete ${recipe.name}`}
                      className="inline-flex items-center gap-1 rounded px-2 py-1.5 text-xs font-bold text-placeholder transition-colors hover:bg-brand/10 hover:text-brand"
                    >
                      <TrashIcon className="size-3.5" />
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : null}
        </section>

        {/* Author + comments */}
        <ContentCreatorCard
          author={author}
          me={me}
          shareLabel={`Share ${recipe.name}`}
          onShare={onShare}
        >
          <CommentsSection
            targetKind="recipe"
            targetId={recipe.id}
            targetTitle={recipe.name}
            isContentOwner={isOwner}
          />
        </ContentCreatorCard>

        {commentsFeatured ? (
          <FeaturedRecipeBannerCta
            recipe={commentsFeatured}
            description={recipeFeaturedDescription(commentsFeatured)}
          />
        ) : null}

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
