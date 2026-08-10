"use client";

import Link from "next/link";
import {
  SendIcon,
  HeartIcon,
  HeartFillIcon,
  MessageIcon,
  ShareIcon,
  ClockIcon,
  PlayIcon,
  ServingIcon,
} from "@/components/app/icons";
import RecipeAuthor from "@/components/app/RecipeAuthor";
import RecipeThumbnail from "@/components/app/RecipeThumbnail";
import {
  CATALOG_RECIPES,
  getCategoryLabel,
  useSavedRecipes,
} from "@/components/recipes/SavedRecipesProvider";
import { useCreatedContent } from "@/components/app/CreatedContentProvider";
import UserAvatar from "@/components/app/UserAvatar";
import UserNameLink from "@/components/app/UserNameLink";
import { absoluteAppUrl, shareContent } from "@/lib/share";
import { userProfilePath } from "@/lib/userProfile";
import { resolveAuthor } from "@/components/app/user/authors";
import { useCurrentFeedUser } from "@/components/app/user/useCurrentFeedUser";

const nutrition = [
  { label: "Fat", value: "5.8g" },
  { label: "Carbs", value: "38g" },
  { label: "Protein", value: "10g" },
  { label: "Sodium", value: "615" },
];

const ingredientGroups = [
  {
    title: "For the Pasta Dough",
    items: [
      "3 large eggs",
      "1 large egg yolk",
      "Olive oil",
      "Semolina flour, for dusting",
      "300g Flour",
    ],
  },
  {
    title: "Ravioli Cheese Filling",
    items: [
      "100g (1/2 cup) drained whole milk ricotta",
      "100 g (1/2 cup) mascarpone cheese",
      "10 g (1/4 cup) chopped basil leaves",
      "30 g freshly grated Parmesan cheese",
      "1 egg",
      "Salt & Pepper, to taste",
    ],
  },
];

const steps: { n: string; text: string; image?: boolean }[] = [
  {
    n: "1.0",
    text: "Place the flour in a mound on a clean surface and make a deep well in the center.",
  },
  {
    n: "1.1",
    text: "Crack the eggs into the well, then add the salt and olive oil.",
  },
  {
    n: "1.2",
    text: "Use a fork to whisk the eggs, gradually incorporating flour from the edges until the mixture thickens into a paste.",
  },
  {
    n: "1.3",
    text: "Begin kneading the dough with your hands, adding more flour if sticky or a touch of water if dry.",
  },
  {
    n: "1.4",
    text: "Knead for 10-15 minutes until smooth and elastic. Test by pressing a finger into the dough; it should bounce back.",
    image: true,
  },
  {
    n: "1.5",
    text: "Form into a ball, wrap tightly in plastic wrap, and rest at room temperature for 30 minutes.",
  },
  {
    n: "2.0",
    text: "Heat olive oil in a pan over medium heat and cook spinach until wilted. Let cool, then squeeze out excess liquid.",
  },
  {
    n: "2.1",
    text: "Mix the spinach with ricotta, egg, parmesan, salt, pepper, and nutmeg until well combined. Set aside.",
  },
  {
    n: "3.0",
    text: "Divide the rested dough into 4 pieces. Roll each piece, then pass through a pasta machine from widest to thin.",
  },
  {
    n: "3.1",
    text: "Lay a rolled sheet on a floured surface. Use a ravioli stamp or cutter to lightly mark shapes.",
  },
  {
    n: "3.2",
    text: "Add 1½ teaspoons of filling to each marked area. Place a second sheet of dough on top.",
    image: true,
  },
  {
    n: "3.3",
    text: "Press around the filling to remove air, then cut out the ravioli. Repeat with remaining dough and filling.",
  },
  {
    n: "4.0",
    text: "Bring a large pot of salted water to a gentle boil.",
  },
  {
    n: "4.1",
    text: "Add ravioli and cook until they float, plus 30-60 seconds (3-4 minutes total).",
  },
  {
    n: "4.2",
    text: "Remove with a slotted spoon, drain, and serve with your favorite sauce.",
  },
];

function NutritionRing({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid size-18.5 place-items-center rounded-full border-4 border-brand text-center text-sm text-ink">
      <div>
        <p className="font-bold leading-none">{value}</p>
        <p className="mt-0.5 leading-none text-muted">{label}</p>
      </div>
    </div>
  );
}

function MoreCard({
  id,
  name,
  author,
}: {
  id: string;
  name: string;
  author: string;
}) {
  return (
    <div className="flex w-[30%] flex-col items-center">
      <Link
        href={`/recipe/${id}`}
        className="relative aspect-square w-full overflow-hidden rounded border border-line"
      >
        <RecipeThumbnail className="size-full" iconClassName="h-10 w-11" />
      </Link>
      <p className="mt-1 w-full truncate text-sm text-ink-secondary">{name}</p>
      <RecipeAuthor author={author} className="w-full" />
    </div>
  );
}

export default function RecipeDetailScreen({
  recipeId = "1",
}: {
  recipeId?: string;
}) {
  const me = useCurrentFeedUser();
  const { getRecipe } = useCreatedContent();
  const created = getRecipe(recipeId);
  const recipe =
    created ??
    CATALOG_RECIPES.find((r) => r.id === recipeId) ??
    CATALOG_RECIPES[0];
  const { isSaved, toggleSave } = useSavedRecipes();
  const saved = isSaved(recipe.id);
  const author = resolveAuthor(recipe.author, me);
  const moreRecipes = CATALOG_RECIPES.filter((r) => r.id !== recipe.id).slice(
    0,
    6,
  );

  const onShare = () => {
    void shareContent({
      title: recipe.name,
      text: `Check out ${recipe.name} on iCook`,
      url: absoluteAppUrl(`/recipe/${recipe.id}`),
    });
  };

  return (
    <div className="page">
      <div className="list-stack py-2">
        {/* Hero */}
        <div className="relative h-56 w-full overflow-hidden">
          <RecipeThumbnail className="size-full" iconClassName="h-14 w-16" />
          <button
            type="button"
            aria-label="Play video"
            className="absolute top-1/2 left-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-brand text-white"
          >
            <PlayIcon className="ml-1 size-6" />
          </button>
        </div>

        {/* Title / meta */}
        <section className="feed-card flex flex-col gap-3">
          <div>
            <div className="flex items-center gap-2 border-b-2 border-brand py-2">
              <h1 className="min-w-0 flex-1 text-xl font-bold text-ink">
                {recipe.name}
              </h1>
              <button
                type="button"
                aria-label={saved ? `Unsave ${recipe.name}` : `Save ${recipe.name}`}
                aria-pressed={saved}
                onClick={() => toggleSave(recipe)}
                className="shrink-0 text-brand"
              >
                {saved ? (
                  <HeartFillIcon className="size-7" />
                ) : (
                  <HeartIcon className="size-7" />
                )}
              </button>
              <button
                type="button"
                aria-label={`Share ${recipe.name}`}
                onClick={onShare}
                className="shrink-0 text-brand"
              >
                <ShareIcon className="size-6" />
              </button>
            </div>
            <p className="mt-2 flex gap-2 text-sm text-ink">
              <span className="font-bold text-ink-secondary">Category</span>
              <span className="italic text-muted">
                {getCategoryLabel(recipe.category)}
              </span>
            </p>
          </div>

          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-2.5">
              {[
                { label: "Preparation Time", value: "2 hours" },
                { label: "Cook Time", value: "5 minutes" },
                { label: "Total Time", value: "2 Hours 5 minutes" },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-2.5">
                  <ClockIcon className="size-6 shrink-0 text-brand" />
                  <div className="text-sm">
                    <p className="text-ink-secondary">{row.label}</p>
                    <p className="font-bold text-brand">{row.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <ServingIcon className="size-6 text-brand" />
              <span className="text-sm text-ink">4 Servings</span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <h2 className="section-title text-lg">Nutrition</h2>
            <div className="flex items-center justify-between gap-1">
              {nutrition.map((n) => (
                <NutritionRing key={n.label} {...n} />
              ))}
            </div>
          </div>
        </section>

        {/* Ingredients */}
        <section className="feed-card flex flex-col gap-3">
          <h2 className="section-title text-lg">Ingredients</h2>
          <div className="flex flex-col gap-4">
            {ingredientGroups.map((group) => (
              <div key={group.title}>
                <p className="text-sm font-bold text-ink">{group.title}</p>
                <ul className="ms-5 mt-1 list-disc text-sm text-ink-secondary">
                  {group.items.map((item) => (
                    <li key={item} className="leading-5">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <button type="button" className="btn-primary w-full text-base">
            Add to Shopping Cart
          </button>
        </section>

        {/* Instructions */}
        <section className="feed-card flex flex-col gap-2">
          <h2 className="section-title text-lg">Instructions</h2>
          <div className="flex flex-col">
            {steps.map((step) => (
              <div key={step.n} className="flex flex-col">
                <div className="flex gap-2.5 border-b border-line py-2.5 text-sm">
                  <span className="shrink-0 font-bold text-brand">{step.n}</span>
                  <p className="flex-1 leading-5 text-ink">{step.text}</p>
                </div>
                {step.image ? (
                  <RecipeThumbnail className="aspect-square w-full" iconClassName="h-12 w-14" />
                ) : null}
              </div>
            ))}
          </div>
        </section>

        {/* Author */}
        <section className="feed-card">
          <div className="flex gap-3 border-b border-line pb-3">
            <div className="flex flex-col items-center gap-3">
              <Link
                href={userProfilePath(author.handle, me.handle)}
                aria-label={author.name}
              >
                <UserAvatar
                  initials={author.initials}
                  handle={author.handle}
                  src={author.avatarUrl}
                  size="lg"
                  me={author.handle === me.handle}
                />
              </Link>
              <div className="flex flex-col items-center gap-2 text-brand">
                <button
                  type="button"
                  aria-label={saved ? `Unsave ${recipe.name}` : `Save ${recipe.name}`}
                  aria-pressed={saved}
                  onClick={() => toggleSave(recipe)}
                >
                  {saved ? (
                    <HeartFillIcon className="size-6" />
                  ) : (
                    <HeartIcon className="size-6" />
                  )}
                </button>
                <button type="button" aria-label="Message">
                  <MessageIcon className="size-6" />
                </button>
                <button type="button" aria-label={`Share ${recipe.name}`} onClick={onShare}>
                  <ShareIcon className="size-5" />
                </button>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <UserNameLink
                name={author.name}
                handle={author.handle}
                className="text-base font-bold text-brand"
              />
              <p className="mt-0.5 flex items-center gap-0.5 text-xs leading-3.5">
                <span className="text-brand-soft">@</span>
                <Link
                  href={userProfilePath(author.handle, me.handle)}
                  className="truncate text-placeholder"
                >
                  {author.handle}
                </Link>
              </p>
              <p className="mt-2 text-sm italic leading-5 text-ink-secondary">
                {author.about ??
                  "Passionate about cooking and sharing simple, delicious recipes with easy-to-follow instructions."}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 pt-3">
            <h3 className="section-title">Comments</h3>
            <div className="flex gap-3 rounded bg-app p-2.5">
              <span className="avatar-sm">AM</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-brand">Arlene McCoy</p>
                <p className="mt-0.5 text-sm text-ink">
                  Simple recipe, turned out yummy!
                </p>
                <p className="mt-1 text-xs text-muted">10:30AM - 27/11/2024</p>
              </div>
            </div>
            <button type="button" className="btn-primary w-full text-base">
              Show More
            </button>
            <form
              className="flex items-center gap-1.5 rounded bg-app px-2.5 py-1.5"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                id="recipe-comment"
                name="comment"
                className="flex-1 bg-transparent py-1.5 text-base font-bold text-ink outline-none placeholder:text-muted"
                placeholder="Write a comment!"
                aria-label="Write a comment"
              />
              <button
                type="submit"
                aria-label="Send comment"
                className="text-brand"
              >
                <SendIcon className="size-6" />
              </button>
            </form>
          </div>
        </section>

        {/* More to love */}
        <section className="feed-card flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <h2 className="section-title min-w-0 flex-1 text-lg">
              More to Love!
            </h2>
            <Link
              href="/recipes/more?sort=loved"
              className="shrink-0 rounded bg-brand px-3 py-1 text-sm font-bold text-white hover:bg-brand-hover"
            >
              more
            </Link>
          </div>
          <div className="flex flex-wrap justify-between gap-y-3">
            {moreRecipes.map((r) => (
              <MoreCard
                key={r.id}
                id={r.id}
                name={r.name}
                author={r.author}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
