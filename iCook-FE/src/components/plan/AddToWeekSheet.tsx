"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ApproveIcon,
  CheckIcon,
  ChevronRightIcon,
  CloseIcon,
  PlusIcon,
} from "@/components/app/icons";
import { useCreatedContent } from "@/components/app/CreatedContentProvider";
import PlanSlotThumb from "@/components/plan/PlanSlotThumb";
import { useWeekPlan } from "@/components/plan/WeekPlanProvider";
import {
  MEAL_LABELS,
  MEAL_SLOTS,
  formatDayHeading,
  isSameDay,
  toISODate,
  weekdayShort,
  weekDates,
  type MealSlot,
} from "@/lib/weekPlan";

export default function AddToWeekSheet({
  open,
  recipeId,
  recipeName,
  onClose,
}: {
  open: boolean;
  recipeId: string;
  recipeName: string;
  onClose: () => void;
}) {
  const { weekStart, getMeal, setMeal, goToThisWeek } = useWeekPlan();
  const { resolveVisibleRecipe } = useCreatedContent();
  const [dayIndex, setDayIndex] = useState(0);
  const [updated, setUpdated] = useState(false);
  const [placedMeal, setPlacedMeal] = useState<MealSlot | null>(null);
  const today = useMemo(() => new Date(), []);

  const days = weekDates(weekStart);
  const date = days[dayIndex] ?? days[0]!;
  const iso = toISODate(date);
  const todayDay = isSameDay(date, today);

  useEffect(() => {
    if (!open) return;
    goToThisWeek();
    setUpdated(false);
    setPlacedMeal(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setDayIndex((i) => (i + 6) % 7);
      if (e.key === "ArrowRight") setDayIndex((i) => (i + 1) % 7);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, goToThisWeek, onClose]);

  useEffect(() => {
    if (!open) return;
    const dates = weekDates(weekStart);
    const todayIso = toISODate(today);
    const index = dates.findIndex((d) => toISODate(d) === todayIso);
    setDayIndex(index >= 0 ? index : 0);
  }, [open, weekStart, today]);

  useEffect(() => {
    if (!updated) return;
    const t = window.setTimeout(onClose, 1000);
    return () => window.clearTimeout(t);
  }, [updated, onClose]);

  function shiftDay(delta: number) {
    if (updated) return;
    setDayIndex((i) => (i + delta + 7) % 7);
  }

  function place(meal: MealSlot) {
    if (updated) return;
    setMeal(iso, meal, { recipeId });
    setPlacedMeal(meal);
    setUpdated(true);
  }

  return (
    <div
      className={`absolute inset-0 z-40 ${open ? "" : "pointer-events-none"}`}
      role="dialog"
      aria-modal="true"
      aria-label="Add to weekly planner"
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
        className={`absolute inset-x-0 bottom-0 flex max-h-[86%] flex-col overflow-hidden rounded-t-lg bg-app shadow-panel transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {updated ? (
          <div
            className="absolute inset-0 z-10 grid place-items-center bg-overlay"
            role="status"
            aria-live="polite"
          >
            <div className="mx-6 flex flex-col items-center gap-2.5 rounded-lg bg-surface px-8 py-7 text-center shadow-panel">
              <span className="grid size-12 place-items-center rounded-full bg-brand/15 text-brand">
                <ApproveIcon className="size-7" aria-hidden />
              </span>
              <p className="text-base font-bold text-ink">Weekly Planner Updated</p>
              <p className="text-xs text-muted">
                {recipeName}
                {placedMeal
                  ? ` · ${weekdayShort(date)} ${MEAL_LABELS[placedMeal]}`
                  : ""}
              </p>
            </div>
          </div>
        ) : null}

        <div className="flex shrink-0 flex-col items-center pt-2">
          <span className="h-1 w-10 rounded-full bg-line" aria-hidden />
        </div>

        <header className="flex shrink-0 items-center justify-between gap-2 border-b border-line px-3 py-2.5">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-brand-soft">Weekly planner</p>
            <h2 className="text-base font-bold text-ink">Add to a meal</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            tabIndex={open ? 0 : -1}
            className="grid size-8 shrink-0 place-items-center text-ink-secondary"
          >
            <CloseIcon className="size-5" />
          </button>
        </header>

        <div className="shrink-0 border-b border-line bg-surface px-2 py-2.5">
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Previous day"
              tabIndex={open ? 0 : -1}
              onClick={() => shiftDay(-1)}
              className="grid size-8 shrink-0 place-items-center rounded-full text-brand hover:bg-brand/10"
            >
              <ChevronRightIcon className="size-5 rotate-180" />
            </button>
            <div
              className="grid min-w-0 flex-1 grid-cols-7 gap-0.5"
              role="tablist"
              aria-label="Day of the week"
            >
              {days.map((d, i) => {
                const selected = i === dayIndex;
                const isToday = isSameDay(d, today);
                return (
                  <button
                    key={toISODate(d)}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    tabIndex={open ? 0 : -1}
                    onClick={() => !updated && setDayIndex(i)}
                    className={`flex flex-col items-center rounded py-1.5 ${
                      selected
                        ? "bg-brand text-white"
                        : isToday
                          ? "bg-brand/10 text-brand"
                          : "text-ink-secondary hover:bg-app"
                    }`}
                  >
                    <span className="text-[10px] font-bold leading-none">
                      {weekdayShort(d).slice(0, 1)}
                    </span>
                    <span className="mt-1 text-xs font-bold leading-none">
                      {d.getDate()}
                    </span>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              aria-label="Next day"
              tabIndex={open ? 0 : -1}
              onClick={() => shiftDay(1)}
              className="grid size-8 shrink-0 place-items-center rounded-full text-brand hover:bg-brand/10"
            >
              <ChevronRightIcon className="size-5" />
            </button>
          </div>
          <p className="mt-2 text-center text-sm font-bold text-ink">
            {formatDayHeading(date)}
            {todayDay ? (
              <span className="font-bold text-brand"> · Today</span>
            ) : null}
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
          <div className="flex flex-col gap-1.5">
            {MEAL_SLOTS.map((slot) => {
              const planned = getMeal(iso, slot);
              const existing = planned
                ? resolveVisibleRecipe(planned.recipeId)
                : undefined;
              const taken = Boolean(planned);

              return (
                <button
                  key={slot}
                  type="button"
                  tabIndex={open ? 0 : -1}
                  onClick={() => place(slot)}
                  className="flex items-center gap-2.5 rounded border border-line bg-surface px-3 py-2.5 text-left hover:bg-brand/5"
                >
                  <PlanSlotThumb recipe={existing} />
                  <span className="min-w-0 flex-1">
                    <span className="text-sm font-bold text-ink">
                      {MEAL_LABELS[slot]}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-muted">
                      {taken
                        ? existing?.name ?? "Recipe unavailable"
                        : "No Recipe"}
                    </span>
                  </span>
                  <span
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
