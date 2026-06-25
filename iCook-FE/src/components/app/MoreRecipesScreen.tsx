import Link from "next/link";
import { BookmarkFillIcon } from "@/components/app/icons";

const recipes = [
  { name: "Traditional Ravioli", emoji: "🥟" },
  { name: "Egg & Tomatoes on Toast", emoji: "🍳" },
  { name: "Popcorn", emoji: "🍿" },
  { name: "Roast Pork", emoji: "🍖" },
  { name: "Salmon with Roast Potatoes", emoji: "🐟" },
  { name: "Steak and Potato Jacket", emoji: "🥩" },
  { name: "Blueberry Pancakes", emoji: "🥞" },
  { name: "Pasta Salad", emoji: "🥗" },
  { name: "Raspberry Cheesecake", emoji: "🍰" },
];

export default function MoreRecipesScreen() {
  return (
    <div className="flex flex-col gap-2.5 bg-white p-2.5">
      <h1 className="text-xl font-bold text-brand">More Recipes</h1>
      <div className="flex flex-wrap justify-between gap-y-4">
        {recipes.map((recipe, i) => (
          <div key={`${recipe.name}-${i}`} className="relative flex flex-col items-center">
            <Link
              href="/recipe/1"
              className="grid size-[100px] place-items-center rounded-[5px] bg-[#e9ecf2] text-4xl"
            >
              {recipe.emoji}
            </Link>
            <p className="mt-1 max-w-[100px] truncate text-sm text-[#292929]">
              {recipe.name}
            </p>
            <button
              type="button"
              aria-label={`Save ${recipe.name}`}
              className="absolute left-[64px] top-[4px] text-brand"
            >
              <BookmarkFillIcon className="size-7 drop-shadow" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
