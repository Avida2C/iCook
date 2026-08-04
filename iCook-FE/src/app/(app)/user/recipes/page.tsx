import type { Metadata } from "next";
import { MyRecipesScreen } from "@/components/app/UserCollectionScreens";

export const metadata: Metadata = {
  title: "My Recipes · iCook",
};

export default function UserRecipesPage() {
  return <MyRecipesScreen />;
}
