"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CloseIcon, SearchIcon } from "@/components/app/icons";
import RecipeThumbnail from "@/components/app/RecipeThumbnail";
import { useCreatedContent } from "@/components/app/CreatedContentProvider";
import { isOwnAuthor } from "@/components/app/user/authors";
import { useCurrentFeedUser } from "@/components/app/user/useCurrentFeedUser";
import { useSavedRecipes } from "@/components/recipes/SavedRecipesProvider";
import { useWeekPlan } from "@/components/plan/WeekPlanProvider";
import {
  primaryCategory,
  type Recipe,
} from "@/components/recipes/recipesData";
import { searchRecipes } from "@/lib/recipeSearch";
import {
  MEAL_LABELS,
  suggestedMealForCategories,
} from "@/lib/weekPlan";

function RecipeHit({
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
      className="flex w-full items-center gap-3 rounded bg-surface p-2.5 text-left"
    >
      <RecipeThumbnail
        className="size-10 shrink-0 rounded"
        iconClassName="h-5 w-6"
        src={recipe.thumbnailUrl}
        category={primaryCategory(recipe)}
        alt={recipe.name}
      />
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-base font-bold text-ink">
          {recipe.name}
        </span>
        {recipe.description.trim() ? (
          <span className="truncate text-sm text-muted">
            {recipe.description.trim()}
          </span>
        ) : null}
      </span>
    </button>
  );
}

export default function RecipePickSheet() {
  const {
    recipePickTarget,
    closeRecipePick,
    setMeal,
  } = useWeekPlan();
  const open = recipePickTarget != null;
  const meal = recipePickTarget?.meal ?? "dinner";
  const dateLabel = recipePickTarget?.label ?? "";

  const me = useCurrentFeedUser();
  const { savedRecipes } = useSavedRecipes();
  const { recipes: createdRecipes, publicRecipes } = useCreatedContent();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  const handleClose = () => {
    setQuery("");
    closeRecipePick();
  };

  useEffect(() => {
    if (!open) return;
    setQuery("");
    const t = window.setTimeout(() => inputRef.current?.focus(), 200);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

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

  const suggestions = useMemo(() => {
    const matched = pool.filter(
      (recipe) => suggestedMealForCategories(recipe.categories) === meal,
    );
    return (matched.length > 0 ? matched : pool).slice(0, 24);
  }, [pool, meal]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return searchRecipes(pool, query);
  }, [pool, query]);

  function pick(recipeId: string) {
    if (!recipePickTarget) return;
    setMeal(recipePickTarget.date, recipePickTarget.meal, { recipeId });
    handleClose();
  }

  return (
    <div
      className={`absolute inset-0 z-30 ${open ? "" : "pointer-events-none"}`}
      role="dialog"
      aria-modal="true"
      aria-label={`Search recipes for ${MEAL_LABELS[meal]}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close search"
        tabIndex={open ? 0 : -1}
        onClick={handleClose}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        className={`absolute inset-x-0 top-0 flex h-[42%] flex-col bg-app shadow-xl transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="flex shrink-0 flex-col gap-2 bg-surface px-3 py-2.5 shadow-sm">
          <div className="flex flex-1 items-center gap-2 rounded-sm border border-line bg-app px-3 py-2">
            <SearchIcon className="size-5 text-brand" />
            <input
              ref={inputRef}
              id="plan-recipe-search"
              name="plan-recipe-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search recipes"
              aria-label="Search recipes"
              tabIndex={open ? 0 : -1}
              className="flex-1 bg-transparent text-base text-ink outline-none placeholder:italic placeholder:text-line"
            />
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                aria-label="Clear search"
                className="text-muted"
              >
                <CloseIcon className="size-5" aria-hidden />
              </button>
            ) : null}
          </div>
          <p className="px-0.5 text-sm font-bold text-ink-secondary">
            {dateLabel} · {MEAL_LABELS[meal]}
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {query.trim() ? (
            results.length ? (
              <ul className="flex flex-col gap-1">
                {results.map((recipe) => (
                  <li key={recipe.id}>
                    <RecipeHit recipe={recipe} onPick={() => pick(recipe.id)} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="pt-4 text-center text-base text-muted">
                No results for &ldquo;{query.trim()}&rdquo;.
              </p>
            )
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-base font-bold text-ink">Recipes</p>
              {suggestions.length ? (
                <ul className="flex flex-col gap-1">
                  {suggestions.map((recipe) => (
                    <li key={recipe.id}>
                      <RecipeHit
                        recipe={recipe}
                        onPick={() => pick(recipe.id)}
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="pt-2 text-center text-base text-muted">
                  No recipes to add yet.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
