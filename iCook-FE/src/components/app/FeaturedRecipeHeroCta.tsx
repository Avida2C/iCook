import Link from "next/link";
import RecipeThumbnail from "@/components/app/RecipeThumbnail";
import type { CatalogRecipe } from "@/components/recipes/SavedRecipesProvider";
import { primaryCategory } from "@/components/recipes/recipesData";

export type FeaturedRecipeHeroCtaProps = {
  recipe: Pick<CatalogRecipe, "id" | "name" | "categories" | "thumbnailUrl">;
  description: string;
  className?: string;
};

/** Full-bleed featured recipe overlay CTA (Figma CTAs / hero). */
export default function FeaturedRecipeHeroCta({
  recipe,
  description,
  className = "",
}: FeaturedRecipeHeroCtaProps) {
  return (
    <section
      className={`relative w-full overflow-hidden ${className}`}
    >
      <div className="h-62 w-full overflow-hidden bg-app">
        <RecipeThumbnail
          className="size-full aspect-auto! h-full"
          iconClassName="h-[60px] w-[68px]"
          src={recipe.thumbnailUrl}
          category={primaryCategory(recipe)}
          alt={recipe.name}
        />
      </div>
      <div className="absolute inset-0 flex h-62 flex-col justify-center gap-2 bg-brand/40 p-4 text-white">
        <div className="flex w-full flex-col items-start rounded-lg border-3 border-white/40 px-5 py-4 text-base leading-[22.4px] font-normal">
          <p className="whitespace-nowrap text-xl font-bold">{recipe.name}</p>
          <p className="text-base text-white/80 line-clamp-4">{description}</p>
        </div>
        <Link
          href={`/recipe/${recipe.id}`}
          className="w-full text-right text-xl leading-6 font-bold"
        >
          View Recipe
        </Link>
      </div>
    </section>
  );
}
