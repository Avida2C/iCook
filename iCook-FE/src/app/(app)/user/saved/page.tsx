import type { Metadata } from "next";
import { SavedRecipesScreen } from "@/components/app/UserCollectionScreens";

export const metadata: Metadata = {
  title: "Saved Recipes · iCook",
};

export default function UserSavedPage() {
  return <SavedRecipesScreen />;
}
