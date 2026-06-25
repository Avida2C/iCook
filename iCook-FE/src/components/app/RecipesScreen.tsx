import Link from "next/link";
import { BookmarkFillIcon } from "@/components/app/icons";

type Recipe = { name: string; emoji: string };
type Category = { title: string; slug: string; recipes: Recipe[] };

const categories: Category[] = [
  {
    title: "Most Loved Recipes!",
    slug: "loved",
    recipes: [
      { name: "Traditional Ravioli", emoji: "🥟" },
      { name: "Egg & Tomatoes on Toast", emoji: "🍳" },
      { name: "Popcorn", emoji: "🍿" },
    ],
  },
  {
    title: "Breakfast",
    slug: "breakfast",
    recipes: [
      { name: "Egg Avocado Toast", emoji: "🥑" },
      { name: "Egg & Tomatoes on Toast", emoji: "🍳" },
      { name: "Blueberry Pancakes", emoji: "🥞" },
    ],
  },
  {
    title: "Lunch",
    slug: "lunch",
    recipes: [
      { name: "Salad", emoji: "🥗" },
      { name: "Pasta Salad", emoji: "🍝" },
      { name: "Pizza", emoji: "🍕" },
    ],
  },
  {
    title: "Snacks",
    slug: "snacks",
    recipes: [
      { name: "Olive Dip", emoji: "🫒" },
      { name: "Muffins", emoji: "🧁" },
      { name: "Popcorn", emoji: "🍿" },
    ],
  },
  {
    title: "Dinner",
    slug: "dinner",
    recipes: [
      { name: "Ravioli", emoji: "🥟" },
      { name: "Pork Roast", emoji: "🍖" },
      { name: "Spaghetti", emoji: "🍝" },
    ],
  },
  {
    title: "Dessert",
    slug: "dessert",
    recipes: [
      { name: "Raspberry Cheesecake", emoji: "🍰" },
      { name: "Strawberry Yogurt", emoji: "🍓" },
      { name: "Chocolate Cookies", emoji: "🍪" },
    ],
  },
];

function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <div className="relative flex flex-col items-center">
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
  );
}

export default function RecipesScreen() {
  return (
    <div className="flex flex-col gap-[5px] py-[5px]">
      {categories.map((category) => (
        <section
          key={category.slug}
          className="flex flex-col gap-3 bg-white px-[10px] py-[15px] shadow-[0px_2px_2.5px_rgba(178,178,178,0.25)]"
        >
          <div className="flex items-center gap-[5px]">
            <h2 className="flex-1 text-xl font-bold text-brand">
              {category.title}
            </h2>
            <Link
              href="/recipes/more"
              className="flex h-9 items-center justify-center rounded-[4px] bg-brand px-4 text-xl text-white"
            >
              more
            </Link>
          </div>
          <div className="flex items-start justify-between">
            {category.recipes.map((recipe, i) => (
              <RecipeCard key={`${category.slug}-${i}`} recipe={recipe} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
