import type { Metadata } from "next";
import RecipeEditorScreen from "@/components/app/RecipeEditorScreen";

export const metadata: Metadata = {
  title: "Edit Recipe · iCook",
};

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RecipeEditorScreen recipeId={id} />;
}
