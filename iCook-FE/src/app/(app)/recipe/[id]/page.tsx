import type { Metadata } from "next";
import RecipeDetailScreen from "@/components/app/RecipeDetailScreen";

export const metadata: Metadata = {
  title: "Recipe · iCook",
};

export default function RecipePage() {
  return <RecipeDetailScreen />;
}
