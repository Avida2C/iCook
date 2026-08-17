import type { IconType } from "react-icons";
import {
  BreakfastIcon,
  DinnerIcon,
  EmojiIcon,
  LunchIcon,
  SnackIcon,
  UserIcon,
  UsersIcon,
} from "@/components/app/icons";
import type { HouseholdCook, MealSlot } from "@/lib/weekPlan";

export const MEAL_ICONS: Record<MealSlot, IconType> = {
  breakfast: BreakfastIcon,
  lunch: LunchIcon,
  dinner: DinnerIcon,
  snack: SnackIcon,
};

export const COOK_ICONS: Record<HouseholdCook, IconType> = {
  Me: UserIcon,
  Partner: UsersIcon,
  Kids: EmojiIcon,
};
