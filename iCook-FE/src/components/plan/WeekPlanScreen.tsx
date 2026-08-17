"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarIcon,
  ChevronRightIcon,
  CopyIcon,
  PlusIcon,
  TrashIcon,
} from "@/components/app/icons";
import RecipeThumbnail from "@/components/app/RecipeThumbnail";
import { useCreatedContent } from "@/components/app/CreatedContentProvider";
import { MEAL_ICONS } from "@/components/plan/mealIcons";
import RecipePickSheet from "@/components/plan/RecipePickSheet";
import { useWeekPlan } from "@/components/plan/WeekPlanProvider";
import { primaryCategory, type Recipe } from "@/components/recipes/recipesData";
import {
  HOUSEHOLD_COOKS,
  MEAL_LABELS,
  MEAL_SLOTS,
  formatWeekRange,
  isSameDay,
  mondayOf,
  toISODate,
  weekdayShort,
  weekDates,
  type HouseholdCook,
  type MealSlot,
} from "@/lib/weekPlan";

type PickerTarget = { date: string; meal: MealSlot; label: string };

function SlotRow({
  meal,
  recipe,
  planned,
  cook,
  onAdd,
  onRemove,
  onCook,
}: {
  meal: MealSlot;
  recipe: Recipe | undefined;
  planned: boolean;
  cook?: HouseholdCook;
  onAdd: () => void;
  onRemove: () => void;
  onCook: (cook: HouseholdCook) => void;
}) {
  if (!planned) {
    const MealIcon = MEAL_ICONS[meal];
    return (
      <button
        type="button"
        onClick={onAdd}
        className="flex w-full items-center gap-2 rounded border border-dashed border-line px-2 py-1.5 text-left"
      >
        <MealIcon className="size-4 shrink-0 text-muted" aria-hidden />
        <span className="w-16 shrink-0 text-[11px] font-bold text-muted">
          {MEAL_LABELS[meal]}
        </span>
        <span className="min-w-0 flex-1 text-xs text-muted">Tap to plan</span>
        <PlusIcon className="size-4 shrink-0 text-brand" />
      </button>
    );
  }

  const MealIcon = MEAL_ICONS[meal];

  if (!recipe) {
    return (
      <div className="flex w-full items-center gap-2 rounded border border-line px-2 py-1.5">
        <MealIcon className="size-4 shrink-0 text-brand" aria-hidden />
        <span className="w-16 shrink-0 text-[11px] font-bold text-brand">
          {MEAL_LABELS[meal]}
        </span>
        <span className="min-w-0 flex-1 text-xs text-muted">
          Recipe unavailable
        </span>
        <button
          type="button"
          aria-label={`Remove ${MEAL_LABELS[meal]}`}
          onClick={onRemove}
          className="shrink-0 text-muted hover:text-brand"
        >
          <TrashIcon className="size-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded border border-line bg-app px-2 py-1.5">
      <MealIcon className="size-4 shrink-0 text-brand" aria-hidden />
      <span className="w-16 shrink-0 text-[11px] font-bold text-brand">
        {MEAL_LABELS[meal]}
      </span>
      <Link
        href={`/recipe/${recipe.id}`}
        className="flex min-w-0 flex-1 items-center gap-2"
      >
        <div className="size-8 shrink-0 overflow-hidden rounded">
          <RecipeThumbnail
            className="size-full"
            iconClassName="h-4 w-5"
            src={recipe.thumbnailUrl}
            category={primaryCategory(recipe)}
            alt=""
          />
        </div>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-xs font-bold text-ink">
            {recipe.name}
          </span>
          {cook ? (
            <span className="block truncate text-[10px] text-muted">
              {cook}
            </span>
          ) : null}
        </span>
      </Link>
      <select
        aria-label={`Who cooks ${MEAL_LABELS[meal]}`}
        value={cook ?? "Me"}
        onChange={(e) => onCook(e.target.value as HouseholdCook)}
        className="max-w-[4.5rem] shrink-0 rounded border border-line bg-surface px-1 py-0.5 text-[10px] text-ink-secondary"
      >
        {HOUSEHOLD_COOKS.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
      <button
        type="button"
        aria-label={`Remove ${MEAL_LABELS[meal]}`}
        onClick={onRemove}
        className="shrink-0 text-muted hover:text-brand"
      >
        <TrashIcon className="size-3.5" />
      </button>
    </div>
  );
}

export default function WeekPlanScreen() {
  const {
    weekStart,
    shiftWeek,
    goToThisWeek,
    getMeal,
    setMeal,
    setCook,
    clearWeek,
    copyPreviousWeek,
    mealsThisWeek,
  } = useWeekPlan();
  const { resolveVisibleRecipe } = useCreatedContent();
  const [picker, setPicker] = useState<PickerTarget | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const today = useMemo(() => new Date(), []);
  const thisWeek = isSameDay(weekStart, mondayOf(today));
  const days = weekDates(weekStart);

  function flash(text: string) {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 2200);
  }

  function onCopy() {
    const copied = copyPreviousWeek();
    flash(
      copied > 0
        ? `Copied ${copied} meal${copied === 1 ? "" : "s"} from last week.`
        : "Last week was empty.",
    );
  }

  return (
    <div className="page-fill relative">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <header className="shrink-0 bg-surface px-3 py-2.5 shadow-bar">
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous week"
              onClick={() => shiftWeek(-1)}
              className="grid size-8 place-items-center text-brand"
            >
              <ChevronRightIcon className="size-5 rotate-180" />
            </button>
            <div className="min-w-0 flex-1 text-center">
              <h1 className="text-base font-bold text-brand">This week</h1>
              <p className="text-xs text-muted">{formatWeekRange(weekStart)}</p>
            </div>
            <button
              type="button"
              aria-label="Next week"
              onClick={() => shiftWeek(1)}
              className="grid size-8 place-items-center text-brand"
            >
              <ChevronRightIcon className="size-5" />
            </button>
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            <p className="text-xs text-muted">
              {mealsThisWeek} meal{mealsThisWeek === 1 ? "" : "s"} planned
            </p>
            {!thisWeek ? (
              <button
                type="button"
                onClick={goToThisWeek}
                className="inline-flex items-center gap-1 text-xs font-bold text-brand"
              >
                <CalendarIcon className="size-3.5" aria-hidden />
                Jump to today
              </button>
            ) : (
              <span className="text-xs font-bold text-brand">Household calendar</span>
            )}
          </div>
        </header>

        <div className="list-stack min-h-0 flex-1 overflow-y-auto overscroll-contain py-2">
          {days.map((date) => {
            const iso = toISODate(date);
            const todayDay = isSameDay(date, today);
            return (
              <section
                key={iso}
                className={`feed-card flex flex-col gap-1.5 ${
                  todayDay ? "ring-1 ring-brand/40" : ""
                }`}
              >
                <div className="flex items-baseline justify-between">
                  <h2 className="text-sm font-bold text-ink">
                    {weekdayShort(date)} {date.getDate()}
                  </h2>
                  {todayDay ? (
                    <span className="text-[10px] font-bold tracking-wide text-brand uppercase">
                      Today
                    </span>
                  ) : null}
                </div>
                {MEAL_SLOTS.map((meal) => {
                  const planned = getMeal(iso, meal);
                  const recipe = planned
                    ? resolveVisibleRecipe(planned.recipeId)
                    : undefined;
                  return (
                    <SlotRow
                      key={meal}
                      meal={meal}
                      recipe={recipe}
                      planned={Boolean(planned)}
                      cook={planned?.cook}
                      onAdd={() =>
                        setPicker({
                          date: iso,
                          meal,
                          label: `${weekdayShort(date)} ${date.getDate()}`,
                        })
                      }
                      onRemove={() => setMeal(iso, meal, null)}
                      onCook={(next) => setCook(iso, meal, next)}
                    />
                  );
                })}
              </section>
            );
          })}
        </div>

        <div className="flex shrink-0 flex-col gap-1.5 bg-surface px-3 py-2 shadow-nav">
          <div className="flex gap-2">
            <button type="button" onClick={onCopy} className="btn-secondary flex-1">
              <CopyIcon className="size-4" aria-hidden />
              Copy last week
            </button>
            <button
              type="button"
              onClick={() => {
                clearWeek();
                flash("This week is cleared.");
              }}
              className="btn-secondary flex-1"
              disabled={mealsThisWeek === 0}
            >
              <TrashIcon className="size-4" aria-hidden />
              Clear week
            </button>
          </div>
          {message ? (
            <p role="status" className="text-center text-xs font-bold text-ink-secondary">
              {message}
            </p>
          ) : null}
        </div>
      </div>

      <RecipePickSheet
        open={picker != null}
        dateLabel={picker?.label ?? ""}
        meal={picker?.meal ?? "dinner"}
        onClose={() => setPicker(null)}
        onChoose={(recipeId, cook) => {
          if (!picker) return;
          setMeal(picker.date, picker.meal, { recipeId, cook });
          setPicker(null);
        }}
      />
    </div>
  );
}
