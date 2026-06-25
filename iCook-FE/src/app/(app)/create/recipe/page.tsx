import type { Metadata } from "next";
import CreateRecipeScreen from "@/components/app/CreateRecipeScreen";

export const metadata: Metadata = {
  title: "Create a Recipe · iCook",
};

export default function CreateRecipePage() {
  return <CreateRecipeScreen />;
}
