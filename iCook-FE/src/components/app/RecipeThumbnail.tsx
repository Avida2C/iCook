/* eslint-disable @next/next/no-img-element */

import {
  CATEGORY_THUMBNAILS,
  recipeThumbnailSrc,
  type RecipeCategory,
} from "@/components/recipes/recipesData";

const CATEGORY_THUMB_SET = new Set(Object.values(CATEGORY_THUMBNAILS));

function isCategoryArtwork(url: string | undefined): boolean {
  if (!url) return false;
  return CATEGORY_THUMB_SET.has(url);
}

/** Shared recipe/post image. Custom src, else category art, else icon placeholder. */
export default function RecipeThumbnail({
  className = "",
  iconClassName = "h-12 w-14",
  src,
  category,
  alt = "",
}: {
  className?: string;
  iconClassName?: string;
  /** Optional image URL / data URL. */
  src?: string;
  /** When src is missing, use this category's artwork. */
  category?: RecipeCategory;
  alt?: string;
}) {
  const hasCustomPhoto =
    Boolean(src) && src !== "placeholder" && !isCategoryArtwork(src);

  const resolved = hasCustomPhoto
    ? src
    : category
      ? recipeThumbnailSrc({ category, thumbnailUrl: undefined })
      : isCategoryArtwork(src)
        ? src
        : undefined;

  if (resolved && hasCustomPhoto) {
    return (
      <div
        className={`relative flex aspect-square items-center justify-center overflow-hidden bg-brand/10 ${className}`}
      >
        <img src={resolved} alt={alt} className="size-full object-cover" />
      </div>
    );
  }

  if (resolved) {
    return (
      <div
        className={`relative flex aspect-square items-center justify-center overflow-hidden bg-brand/15 p-2 ${className}`}
      >
        <img
          src={resolved}
          alt={alt}
          className="size-full object-contain opacity-25"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative flex aspect-square items-center justify-center overflow-hidden bg-brand/10 ${className}`}
      aria-hidden
    >
      <span
        className={`block shrink-0 bg-brand/45 ${iconClassName}`}
        style={{
          maskImage: "url(/icons/recipes/placeholder.svg)",
          maskSize: "contain",
          maskRepeat: "no-repeat",
          maskPosition: "center",
          WebkitMaskImage: "url(/icons/recipes/placeholder.svg)",
          WebkitMaskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
        }}
      />
    </div>
  );
}
