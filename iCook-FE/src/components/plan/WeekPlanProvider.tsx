"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  addDays,
  countMealsInWeek,
  findRecipeOnWeek,
  mondayOf,
  parseWeekPlan,
  toISODate,
  weekDates,
  type HouseholdCook,
  type MealSlot,
  type PlannedMeal,
  type WeekPlanMap,
} from "@/lib/weekPlan";

const STORAGE_KEY = "icook.weekPlan";

export type AddToWeekTarget = {
  recipeId: string;
  recipeName: string;
};

type WeekPlanContextValue = {
  plan: WeekPlanMap;
  weekStart: Date;
  setWeekStart: (date: Date) => void;
  goToThisWeek: () => void;
  shiftWeek: (weeks: number) => void;
  getMeal: (date: string, meal: MealSlot) => PlannedMeal | undefined;
  setMeal: (
    date: string,
    meal: MealSlot,
    next: PlannedMeal | null,
  ) => void;
  setCook: (date: string, meal: MealSlot, cook: HouseholdCook) => void;
  clearWeek: (monday?: Date) => void;
  copyPreviousWeek: () => number;
  mealsThisWeek: number;
  placementsThisWeek: (recipeId: string) => { date: string; meal: MealSlot }[];
  addToWeekTarget: AddToWeekTarget | null;
  openAddToWeek: (target: AddToWeekTarget) => void;
  closeAddToWeek: () => void;
};

const WeekPlanContext = createContext<WeekPlanContextValue | null>(null);

function readPlan(): WeekPlanMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return parseWeekPlan(JSON.parse(raw));
  } catch {
    return {};
  }
}

export function WeekPlanProvider({ children }: { children: ReactNode }) {
  const [plan, setPlan] = useState<WeekPlanMap>({});
  const [hydrated, setHydrated] = useState(false);
  const [weekStart, setWeekStartState] = useState(() => mondayOf(new Date()));
  const [addToWeekTarget, setAddToWeekTarget] = useState<AddToWeekTarget | null>(
    null,
  );

  useEffect(() => {
    setPlan(readPlan());
    setWeekStartState(mondayOf(new Date()));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
    } catch {
      // ignore
    }
  }, [plan, hydrated]);

  const setWeekStart = useCallback((date: Date) => {
    setWeekStartState(mondayOf(date));
  }, []);

  const goToThisWeek = useCallback(() => {
    setWeekStartState(mondayOf(new Date()));
  }, []);

  const shiftWeek = useCallback((weeks: number) => {
    setWeekStartState((prev) => addDays(prev, weeks * 7));
  }, []);

  const getMeal = useCallback(
    (date: string, meal: MealSlot) => plan[date]?.[meal],
    [plan],
  );

  const setMeal = useCallback(
    (date: string, meal: MealSlot, next: PlannedMeal | null) => {
      setPlan((prev) => {
        const day = { ...(prev[date] ?? {}) };
        if (next) day[meal] = next;
        else delete day[meal];
        const copy = { ...prev };
        if (Object.keys(day).length === 0) delete copy[date];
        else copy[date] = day;
        return copy;
      });
    },
    [],
  );

  const setCook = useCallback(
    (date: string, meal: MealSlot, cook: HouseholdCook) => {
      setPlan((prev) => {
        const current = prev[date]?.[meal];
        if (!current) return prev;
        return {
          ...prev,
          [date]: { ...prev[date], [meal]: { ...current, cook } },
        };
      });
    },
    [],
  );

  const clearWeek = useCallback(
    (monday = weekStart) => {
      const dates = new Set(weekDates(monday).map(toISODate));
      setPlan((prev) => {
        const copy = { ...prev };
        for (const date of dates) delete copy[date];
        return copy;
      });
    },
    [weekStart],
  );

  const copyPreviousWeek = useCallback(() => {
    let copied = 0;
    for (const date of weekDates(weekStart)) {
      const source = plan[toISODate(addDays(date, -7))];
      if (source) copied += Object.keys(source).length;
    }
    setPlan((prev) => {
      const next = { ...prev };
      for (const date of weekDates(weekStart)) {
        const source = prev[toISODate(addDays(date, -7))];
        const target = toISODate(date);
        if (!source) continue;
        next[target] = { ...source };
      }
      return next;
    });
    return copied;
  }, [plan, weekStart]);

  const mealsThisWeek = useMemo(
    () => countMealsInWeek(plan, weekStart),
    [plan, weekStart],
  );

  const placementsThisWeek = useCallback(
    (recipeId: string) => findRecipeOnWeek(plan, weekStart, recipeId),
    [plan, weekStart],
  );

  const openAddToWeek = useCallback((target: AddToWeekTarget) => {
    setAddToWeekTarget(target);
  }, []);

  const closeAddToWeek = useCallback(() => {
    setAddToWeekTarget(null);
  }, []);

  const value = useMemo(
    () => ({
      plan,
      weekStart,
      setWeekStart,
      goToThisWeek,
      shiftWeek,
      getMeal,
      setMeal,
      setCook,
      clearWeek,
      copyPreviousWeek,
      mealsThisWeek,
      placementsThisWeek,
      addToWeekTarget,
      openAddToWeek,
      closeAddToWeek,
    }),
    [
      plan,
      weekStart,
      setWeekStart,
      goToThisWeek,
      shiftWeek,
      getMeal,
      setMeal,
      setCook,
      clearWeek,
      copyPreviousWeek,
      mealsThisWeek,
      placementsThisWeek,
      addToWeekTarget,
      openAddToWeek,
      closeAddToWeek,
    ],
  );

  return (
    <WeekPlanContext.Provider value={value}>{children}</WeekPlanContext.Provider>
  );
}

export function useWeekPlan() {
  const ctx = useContext(WeekPlanContext);
  if (!ctx) {
    throw new Error("useWeekPlan must be used within a WeekPlanProvider");
  }
  return ctx;
}
