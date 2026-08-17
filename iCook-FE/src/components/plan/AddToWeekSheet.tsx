"use client";

import { useEffect, useMemo, useState } from "react";
import { ApproveIcon, CheckIcon, CloseIcon, PlusIcon } from "@/components/app/icons";
import { COOK_ICONS, MEAL_ICONS } from "@/components/plan/mealIcons";
import { useWeekPlan } from "@/components/plan/WeekPlanProvider";
import {
  HOUSEHOLD_COOKS,
  MEAL_LABELS,
  MEAL_SLOTS,
  formatWeekRange,
  isSameDay,
  suggestedMealForCategories,
  toISODate,
  weekdayShort,
  weekDates,
  type HouseholdCook,
  type MealSlot,
} from "@/lib/weekPlan";

export default function AddToWeekSheet({
  open,
  recipeId,
  recipeName,
  categories,
  onClose,
}: {
  open: boolean;
  recipeId: string;
  recipeName: string;
  categories?: string[];
  onClose: () => void;
}) {
  const { weekStart, getMeal, setMeal, goToThisWeek } = useWeekPlan();
  const suggested = suggestedMealForCategories(categories);
  const [meal, setMealSlot] = useState<MealSlot>(suggested);
  const [cook, setCook] = useState<HouseholdCook>("Me");
  const [updated, setUpdated] = useState(false);
  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    if (!open) return;
    goToThisWeek();
    setMealSlot(suggested);
    setCook("Me");
    setUpdated(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, suggested, goToThisWeek, onClose]);

  useEffect(() => {
    if (!updated) return;
    const t = window.setTimeout(onClose, 900);
    return () => window.clearTimeout(t);
  }, [updated, onClose]);

  const days = weekDates(weekStart);

  function place(date: Date) {
    if (updated) return;
    setMeal(toISODate(date), meal, { recipeId, cook });
    setUpdated(true);
  }

  return (
    <div
      className={`absolute inset-0 z-40 ${open ? "" : "pointer-events-none"}`}
      role="dialog"
      aria-modal="true"
      aria-label="Add to this week"
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
        className={`absolute inset-x-0 bottom-0 flex max-h-[78%] flex-col overflow-hidden rounded-t-lg bg-app shadow-panel transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {updated ? (
          <div
            className="absolute inset-0 z-10 grid place-items-center bg-overlay"
            role="status"
            aria-live="polite"
          >
            <div className="flex flex-col items-center gap-2 rounded-lg bg-surface px-8 py-6 shadow-panel">
              <ApproveIcon className="size-8 text-brand" aria-hidden />
              <p className="text-base font-bold text-ink">Weekly Planner Updated</p>
            </div>
          </div>
        ) : null}
        <header className="flex shrink-0 items-center justify-between gap-2 border-b border-line px-3 py-2.5">
          <div className="min-w-0">
            <p className="text-xs font-bold text-brand-soft">
              Household week · {formatWeekRange(weekStart)}
            </p>
            <h2 className="truncate text-base font-bold text-ink">
              Add {recipeName}
            </h2>
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

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
          <p className="text-xs font-bold text-muted">Meal</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Meal">
                {MEAL_SLOTS.map((slot) => {
                  const selected = meal === slot;
                  const MealIcon = MEAL_ICONS[slot];
                  return (
                    <button
                      key={slot}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      tabIndex={open ? 0 : -1}
                      onClick={() => setMealSlot(slot)}
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                        selected
                          ? "bg-brand text-white"
                          : "bg-surface-muted text-ink-secondary"
                      }`}
                    >
                      <MealIcon className="size-3.5" aria-hidden />
                      {MEAL_LABELS[slot]}
                    </button>
                  );
                })}
              </div>

              <p className="mt-3 text-xs font-bold text-muted">Who’s cooking</p>
              <div
                className="mt-1.5 flex gap-1.5"
                role="radiogroup"
                aria-label="Who is cooking"
              >
                {HOUSEHOLD_COOKS.map((name) => {
                  const selected = cook === name;
                  const CookIcon = COOK_ICONS[name];
                  return (
                    <button
                      key={name}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      tabIndex={open ? 0 : -1}
                      onClick={() => setCook(name)}
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                        selected
                          ? "bg-brand text-white"
                          : "bg-surface-muted text-ink-secondary"
                      }`}
                    >
                      <CookIcon className="size-3.5" aria-hidden />
                      {name}
                    </button>
                  );
                })}
              </div>

              <p className="mt-3 text-xs font-bold text-muted">Day</p>
              <div className="mt-1.5 flex flex-col gap-1.5">
                {days.map((date) => {
                  const iso = toISODate(date);
                  const taken = getMeal(iso, meal);
                  const todayDay = isSameDay(date, today);
                  return (
                    <button
                      key={iso}
                      type="button"
                      tabIndex={open ? 0 : -1}
                      onClick={() => place(date)}
                      className={`flex items-center justify-between gap-2 rounded border px-3 py-2.5 text-left ${
                        todayDay
                          ? "border-brand bg-brand/5"
                          : "border-line bg-surface"
                      }`}
                    >
                      <span>
                        <span className="block text-sm font-bold text-ink">
                          {weekdayShort(date)} {date.getDate()}
                          {todayDay ? " · Today" : ""}
                        </span>
                        {taken ? (
                          <span className="text-xs text-muted">
                            Replaces the current {MEAL_LABELS[meal].toLowerCase()}
                          </span>
                        ) : (
                          <span className="text-xs text-muted">Free</span>
                        )}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-brand">
                        {taken ? (
                          <CheckIcon className="size-3.5" aria-hidden />
                        ) : (
                          <PlusIcon className="size-3.5" aria-hidden />
                        )}
                        {taken ? "Replace" : "Add"}
                      </span>
                    </button>
                  );
                })}
              </div>
        </div>
      </div>
    </div>
  );
}
