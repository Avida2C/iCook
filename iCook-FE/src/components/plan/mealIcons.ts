import type { IconType } from "react-icons";
import {
  BreakfastIcon,
  DinnerIcon,
  LunchIcon,
  SnackIcon,
} from "@/components/app/icons";
import type { MealSlot } from "@/lib/weekPlan";

export const MEAL_ICONS: Record<MealSlot, IconType> = {
  breakfast: BreakfastIcon,
  lunch: LunchIcon,
  dinner: DinnerIcon,
  snack: SnackIcon,
};
