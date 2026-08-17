export const MEAL_SLOTS = ["breakfast", "lunch", "dinner", "snack"] as const;
export type MealSlot = (typeof MEAL_SLOTS)[number];

export const MEAL_LABELS: Record<MealSlot, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

export const HOUSEHOLD_COOKS = ["Me", "Partner", "Kids"] as const;
export type HouseholdCook = (typeof HOUSEHOLD_COOKS)[number];

export type PlannedMeal = {
  recipeId: string;
  cook?: HouseholdCook;
};

export type DayMeals = Partial<Record<MealSlot, PlannedMeal>>;
export type WeekPlanMap = Record<string, DayMeals>;

export function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Monday of the week containing `date` (local). */
export function mondayOf(date: Date): Date {
  const day = startOfLocalDay(date);
  const weekday = day.getDay();
  const diff = weekday === 0 ? -6 : 1 - weekday;
  day.setDate(day.getDate() + diff);
  return day;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function fromISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function weekDates(monday: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

export function formatWeekRange(monday: Date): string {
  const end = addDays(monday, 6);
  const sameMonth = monday.getMonth() === end.getMonth();
  const startLabel = monday.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  const endLabel = end.toLocaleDateString(undefined, {
    month: sameMonth ? undefined : "short",
    day: "numeric",
  });
  return `${startLabel} – ${endLabel}`;
}

export function weekdayShort(date: Date): string {
  return date.toLocaleDateString(undefined, { weekday: "short" });
}

export function isSameDay(a: Date, b: Date): boolean {
  return toISODate(a) === toISODate(b);
}

export function suggestedMealForCategories(
  categories: string[] | undefined,
): MealSlot {
  const set = new Set((categories ?? []).map((c) => c.toLowerCase()));
  if (set.has("breakfast")) return "breakfast";
  if (set.has("lunch")) return "lunch";
  if (set.has("snacks")) return "snack";
  return "dinner";
}

export function countMealsInWeek(plan: WeekPlanMap, monday: Date): number {
  let count = 0;
  for (const date of weekDates(monday)) {
    const day = plan[toISODate(date)];
    if (!day) continue;
    for (const slot of MEAL_SLOTS) {
      if (day[slot]) count += 1;
    }
  }
  return count;
}

export function findRecipeOnWeek(
  plan: WeekPlanMap,
  monday: Date,
  recipeId: string,
): { date: string; meal: MealSlot }[] {
  const hits: { date: string; meal: MealSlot }[] = [];
  for (const date of weekDates(monday)) {
    const iso = toISODate(date);
    const day = plan[iso];
    if (!day) continue;
    for (const meal of MEAL_SLOTS) {
      if (day[meal]?.recipeId === recipeId) hits.push({ date: iso, meal });
    }
  }
  return hits;
}

export function parseWeekPlan(raw: unknown): WeekPlanMap {
  if (!raw || typeof raw !== "object") return {};
  const plan: WeekPlanMap = {};
  for (const [date, day] of Object.entries(raw as Record<string, unknown>)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !day || typeof day !== "object") {
      continue;
    }
    const meals: DayMeals = {};
    for (const meal of MEAL_SLOTS) {
      const slot = (day as Record<string, unknown>)[meal];
      if (!slot || typeof slot !== "object") continue;
      const recipeId = (slot as { recipeId?: unknown }).recipeId;
      if (typeof recipeId !== "string" || !recipeId.trim()) continue;
      const cook = (slot as { cook?: unknown }).cook;
      meals[meal] = {
        recipeId: recipeId.trim(),
        cook:
          typeof cook === "string" &&
          (HOUSEHOLD_COOKS as readonly string[]).includes(cook)
            ? (cook as HouseholdCook)
            : undefined,
      };
    }
    if (Object.keys(meals).length > 0) plan[date] = meals;
  }
  return plan;
}
