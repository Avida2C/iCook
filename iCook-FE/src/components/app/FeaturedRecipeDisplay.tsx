"use client";

import FeaturedRecipeHeroCta from "@/components/app/FeaturedRecipeHeroCta";
import type { CatalogRecipe } from "@/components/recipes/SavedRecipesProvider";
import { primaryCategory } from "@/components/recipes/recipesData";

export function recipeFeaturedDescription(
  recipe: CatalogRecipe & { preview?: string },
) {
  if (recipe.preview?.trim()) return recipe.preview.trim();
  if (recipe.description?.trim()) return recipe.description.trim();
  return `A ${primaryCategory(recipe)} favorite from this kitchen. Tap to open the full recipe.`;
}

/** Renders the featured recipe CTA. */
export default function FeaturedRecipeDisplay({
  recipe,
  className = "",
}: {
  recipe: CatalogRecipe & { preview?: string };
  className?: string;
}) {
  const description = recipeFeaturedDescription(recipe);
  return (
    <FeaturedRecipeHeroCta
      recipe={recipe}
      description={description}
      className={className}
    />
  );
}
