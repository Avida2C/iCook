import type { Metadata } from "next";
import RecipesScreen from "@/components/app/RecipesScreen";

export const metadata: Metadata = {
  title: "Recipes · iCook",
};

export default function RecipesPage() {
  return <RecipesScreen />;
}
