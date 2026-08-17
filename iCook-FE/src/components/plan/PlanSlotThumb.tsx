import { ImageOffIcon } from "@/components/app/icons";
import RecipeThumbnail from "@/components/app/RecipeThumbnail";
import { primaryCategory, type Recipe } from "@/components/recipes/recipesData";

/** Recipe photo for a planner slot; empty-image icon when nothing is planned. */
export default function PlanSlotThumb({
  recipe,
  className = "size-10",
}: {
  recipe?: Recipe;
  className?: string;
}) {
  if (recipe) {
    return (
      <div
        className={`shrink-0 overflow-hidden rounded-lg border border-line ${className}`}
      >
        <RecipeThumbnail
          className="size-full"
          iconClassName="h-5 w-6"
          src={recipe.thumbnailUrl}
          category={primaryCategory(recipe)}
          alt=""
        />
      </div>
    );
  }

  return (
    <div
      className={`grid shrink-0 place-items-center rounded-lg border border-dashed border-line bg-app ${className}`}
      aria-hidden
    >
      <ImageOffIcon className="size-[45%] text-muted" />
    </div>
  );
}
