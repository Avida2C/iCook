import type { Metadata } from "next";
import RecipeDetailScreen from "@/components/app/RecipeDetailScreen";

export const metadata: Metadata = {
  title: "Recipe · iCook",
};

export default async function RecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RecipeDetailScreen recipeId={id} />;
}
