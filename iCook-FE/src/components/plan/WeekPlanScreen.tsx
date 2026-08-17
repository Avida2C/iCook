"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarIcon,
  CheckIcon,
  ChevronRightIcon,
  CopyIcon,
  PlusIcon,
  TrashIcon,
} from "@/components/app/icons";
import { useCreatedContent } from "@/components/app/CreatedContentProvider";
import PlanSlotThumb from "@/components/plan/PlanSlotThumb";
import { useWeekPlan } from "@/components/plan/WeekPlanProvider";
import { type Recipe } from "@/components/recipes/recipesData";
import {
  MEAL_LABELS,
  MEAL_SLOTS,
  formatDayHeading,
  formatWeekRange,
  isSameDay,
  mondayOf,
  toISODate,
  weekdayShort,
  weekDates,
  type MealSlot,
} from "@/lib/weekPlan";

function SlotRow({
  meal,
  recipe,
  planned,
  onAdd,
}: {
  meal: MealSlot;
  recipe: Recipe | undefined;
  planned: boolean;
  onAdd: () => void;
}) {
  const taken = planned;

  return (
    <div className="flex items-center gap-2.5 rounded border border-line bg-surface px-3 py-2.5">
      <PlanSlotThumb recipe={recipe} />
      <span className="min-w-0 flex-1">
        <span className="text-sm font-bold text-ink">{MEAL_LABELS[meal]}</span>
        {recipe ? (
          <Link
            href={`/recipe/${recipe.id}`}
            className="mt-0.5 block truncate text-xs text-muted"
          >
            {recipe.name}
          </Link>
        ) : (
          <span className="mt-0.5 block truncate text-xs text-muted">
            {taken ? "Recipe unavailable" : "No Recipe"}
          </span>
        )}
      </span>
      <button
        type="button"
        onClick={onAdd}
        className={`inline-flex shrink-0 items-center gap-1 rounded px-2.5 py-1 text-[11px] font-bold ${
          taken
            ? "border-2 border-brand bg-surface text-brand"
            : "bg-brand text-white"
        }`}
      >
        {taken ? (
          <CheckIcon className="size-3" aria-hidden />
        ) : (
          <PlusIcon className="size-3" aria-hidden />
        )}
        {taken ? "Replace" : "Add"}
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
    clearWeek,
    copyPreviousWeek,
    mealsThisWeek,
    openRecipePick,
  } = useWeekPlan();
  const { resolveVisibleRecipe } = useCreatedContent();
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
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-app">
        <header className="shrink-0 border-b border-line bg-surface px-2 py-2.5">
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Previous week"
              onClick={() => shiftWeek(-1)}
              className="grid size-8 shrink-0 place-items-center rounded-full text-brand hover:bg-brand/10"
            >
              <ChevronRightIcon className="size-5 rotate-180" />
            </button>
            <div className="min-w-0 flex-1 text-center">
              <p className="text-xs font-bold text-brand-soft">Weekly planner</p>
              <h1 className="text-base font-bold text-ink">
                {formatWeekRange(weekStart)}
              </h1>
            </div>
            <button
              type="button"
              aria-label="Next week"
              onClick={() => shiftWeek(1)}
              className="grid size-8 shrink-0 place-items-center rounded-full text-brand hover:bg-brand/10"
            >
              <ChevronRightIcon className="size-5" />
            </button>
          </div>
          <div className="mt-2 flex items-center justify-between px-1">
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
              <span className="text-xs font-bold text-brand">This week</span>
            )}
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
          <div className="flex flex-col gap-4">
            {days.map((date) => {
              const iso = toISODate(date);
              const todayDay = isSameDay(date, today);
              return (
                <section key={iso} className="flex flex-col gap-1.5">
                  <h2 className="px-0.5 text-sm font-bold text-ink">
                    {formatDayHeading(date)}
                    {todayDay ? (
                      <span className="font-bold text-brand"> · Today</span>
                    ) : null}
                  </h2>
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
                        onAdd={() =>
                          openRecipePick({
                            date: iso,
                            meal,
                            label: `${weekdayShort(date)} ${date.getDate()}`,
                          })
                        }
                      />
                    );
                  })}
                </section>
              );
            })}
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-1.5 border-t border-line bg-surface px-3 py-2">
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
    </div>
  );
}
