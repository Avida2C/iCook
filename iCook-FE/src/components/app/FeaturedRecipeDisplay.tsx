"use client";

import FeaturedRecipeBannerCta from "@/components/app/FeaturedRecipeBannerCta";
import FeaturedRecipeHeroCta from "@/components/app/FeaturedRecipeHeroCta";
import type { CatalogRecipe } from "@/components/recipes/SavedRecipesProvider";
import { primaryCategory } from "@/components/recipes/recipesData";
import type { FeaturedRecipeLayout } from "@/lib/featuredRecipePrefs";

export function recipeFeaturedDescription(
  recipe: CatalogRecipe & { preview?: string },
) {
  if (recipe.preview?.trim()) return recipe.preview.trim();
  if (recipe.description?.trim()) return recipe.description.trim();
  return `A ${primaryCategory(recipe)} favorite from this kitchen. Tap to open the full recipe.`;
}

/** Renders the selected featured CTA (hero or banner). */
export default function FeaturedRecipeDisplay({
  recipe,
  layout,
  className = "",
}: {
  recipe: CatalogRecipe & { preview?: string };
  layout: FeaturedRecipeLayout;
  className?: string;
}) {
  const description = recipeFeaturedDescription(recipe);
  if (layout === "hero") {
    return (
      <FeaturedRecipeHeroCta
        recipe={recipe}
        description={description}
        className={className}
      />
    );
  }
  return (
    <FeaturedRecipeBannerCta
      recipe={recipe}
      description={description}
      className={className}
    />
  );
}
