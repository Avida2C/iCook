import type { Metadata } from "next";
import MoreRecipesScreen from "@/components/app/MoreRecipesScreen";

export const metadata: Metadata = {
  title: "More Recipes · iCook",
};

export default function MoreRecipesPage() {
  return <MoreRecipesScreen />;
}
