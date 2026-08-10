import Link from "next/link";
import RecipeThumbnail from "@/components/app/RecipeThumbnail";
import type { CatalogRecipe } from "@/components/recipes/SavedRecipesProvider";

export type FeaturedRecipeBannerCtaProps = {
  recipe: Pick<CatalogRecipe, "id" | "name">;
  description: string;
  className?: string;
};

/** Compact featured recipe banner CTA (Figma CTAs / Small). */
export default function FeaturedRecipeBannerCta({
  recipe,
  description,
  className = "",
}: FeaturedRecipeBannerCtaProps) {
  return (
    <Link
      href={`/recipe/${recipe.id}`}
      className={`flex w-full flex-col gap-2 bg-brand px-4 pt-2 pb-4 ${className}`}
    >
      <div className="flex w-full items-end justify-between gap-6 border-b-2 border-white/40 pb-2 text-white">
        <p className="min-w-0 flex-1 truncate text-xl leading-6 font-bold">
          {recipe.name}
        </p>
        <span className="shrink-0 text-sm leading-[19.6px] font-normal whitespace-nowrap">
          Read More
        </span>
      </div>

      <div className="flex w-full items-start gap-4 pt-1">
        <div className="size-27 shrink-0 overflow-hidden rounded bg-app">
          <RecipeThumbnail
            className="size-full"
            iconClassName="h-[60px] w-[68px]"
          />
        </div>
        <div className="min-w-0 flex-1 pr-2">
          <p className="line-clamp-5 w-full text-base leading-[22.4px] font-normal text-white">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
}
