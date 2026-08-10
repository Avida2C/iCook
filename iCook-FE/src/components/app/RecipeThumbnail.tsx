/** Shared recipe/post image placeholder that follows the accent color. Always square. */
export default function RecipeThumbnail({
  className = "",
  iconClassName = "h-12 w-14",
}: {
  className?: string;
  iconClassName?: string;
}) {
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
