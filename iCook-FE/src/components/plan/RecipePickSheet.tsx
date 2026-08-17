"use client";

import { useEffect, useMemo, useState } from "react";
import { CloseIcon, PlusIcon, SearchIcon } from "@/components/app/icons";
import RecipeThumbnail from "@/components/app/RecipeThumbnail";
import { useCreatedContent } from "@/components/app/CreatedContentProvider";
import { isOwnAuthor } from "@/components/app/user/authors";
import { useCurrentFeedUser } from "@/components/app/user/useCurrentFeedUser";
import { useSavedRecipes } from "@/components/recipes/SavedRecipesProvider";
import {
  primaryCategory,
  type Recipe,
} from "@/components/recipes/recipesData";
import { searchRecipes } from "@/lib/recipeSearch";
import {
  MEAL_LABELS,
  suggestedMealForCategories,
  type MealSlot,
} from "@/lib/weekPlan";

function RecipeRow({
  recipe,
  onPick,
}: {
  recipe: Recipe;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      className="flex w-full items-center gap-2.5 py-2 text-left"
    >
      <div className="size-12 shrink-0 overflow-hidden rounded border border-line">
        <RecipeThumbnail
          className="size-full"
          iconClassName="h-6 w-7"
          src={recipe.thumbnailUrl}
          category={primaryCategory(recipe)}
          alt=""
        />
      </div>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-ink">
          {recipe.name}
        </span>
        <span className="block truncate text-xs text-muted">
          {recipe.totalTime || "Recipe"}
        </span>
      </span>
      <PlusIcon className="size-4 shrink-0 text-brand" aria-hidden />
    </button>
  );
}

export default function RecipePickSheet({
  open,
  dateLabel,
  meal,
  onClose,
  onChoose,
}: {
  open: boolean;
  dateLabel: string;
  meal: MealSlot;
  onClose: () => void;
  onChoose: (recipeId: string) => void;
}) {
  const me = useCurrentFeedUser();
  const { savedRecipes } = useSavedRecipes();
  const { recipes: createdRecipes, publicRecipes } = useCreatedContent();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    setQuery("");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const ownRecipes = useMemo(
    () => createdRecipes.filter((r) => isOwnAuthor(r.author, me)),
    [createdRecipes, me],
  );

  const pool = useMemo(() => {
    const seen = new Set<string>();
    const list: Recipe[] = [];
    for (const recipe of [...savedRecipes, ...ownRecipes, ...publicRecipes]) {
      if (seen.has(recipe.id)) continue;
      seen.add(recipe.id);
      list.push(recipe);
    }
    return list;
  }, [savedRecipes, ownRecipes, publicRecipes]);

  const matches = useMemo(() => {
    const found = query.trim()
      ? searchRecipes(pool, query)
      : pool.filter(
          (recipe) => suggestedMealForCategories(recipe.categories) === meal,
        );
    const ranked = found.length > 0 ? found : pool;
    return ranked.slice(0, 24);
  }, [pool, query, meal]);

  return (
    <div
      className={`absolute inset-0 z-40 ${open ? "" : "pointer-events-none"}`}
      role="dialog"
      aria-modal="true"
      aria-label={`Plan ${MEAL_LABELS[meal]}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
        className={`absolute inset-0 bg-overlay transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`absolute inset-x-0 bottom-0 flex max-h-[78%] flex-col rounded-t-lg bg-app shadow-panel transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <header className="flex shrink-0 items-center justify-between gap-2 border-b border-line px-3 py-2.5">
          <div className="min-w-0">
            <p className="text-xs font-bold text-brand-soft">
              {dateLabel} · {MEAL_LABELS[meal]}
            </p>
            <h2 className="text-base font-bold text-ink">Pick a recipe</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            tabIndex={open ? 0 : -1}
            className="grid size-8 place-items-center text-ink-secondary"
          >
            <CloseIcon className="size-5" />
          </button>
        </header>

        <div className="shrink-0 px-3 pt-2">
          <label className="relative block">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search saved and recipes"
              tabIndex={open ? 0 : -1}
              className="field py-2 ps-8 text-sm"
            />
          </label>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-1">
          {matches.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">
              No recipes to add yet. Save or create one first.
            </p>
          ) : (
            <div className="divide-y divide-line">
              {matches.map((recipe) => (
                <RecipeRow
                  key={recipe.id}
                  recipe={recipe}
                  onPick={() => onChoose(recipe.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
