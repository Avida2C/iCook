"use client";

import { useState } from "react";
import Link from "next/link";
import {
  SendIcon,
  HeartIcon,
  MessageIcon,
  ShareIcon,
  ClockIcon,
  PlayIcon,
  ServingIcon,
  BookmarkIcon,
  BookmarkFillIcon,
} from "@/components/app/icons";

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
  { n: "1.0", text: "Place the flour in a mound on a clean surface and make a deep well in the center." },
  { n: "1.1", text: "Crack the eggs into the well, then add the salt and olive oil." },
  { n: "1.2", text: "Use a fork to whisk the eggs, gradually incorporating flour from the edges until the mixture thickens into a paste." },
  { n: "1.3", text: "Begin kneading the dough with your hands, adding more flour if sticky or a touch of water if dry." },
  { n: "1.4", text: "Knead for 10-15 minutes until smooth and elastic. Test by pressing a finger into the dough; it should bounce back.", image: true },
  { n: "1.5", text: "Form into a ball, wrap tightly in plastic wrap, and rest at room temperature for 30 minutes." },
  { n: "2.0", text: "Heat olive oil in a pan over medium heat and cook spinach until wilted. Let cool, then squeeze out excess liquid." },
  { n: "2.1", text: "Mix the spinach with ricotta, egg, parmesan, salt, pepper, and nutmeg until well combined. Set aside." },
  { n: "3.0", text: "Divide the rested dough into 4 pieces. Roll each piece, then pass through a pasta machine from widest to thin." },
  { n: "3.1", text: "Lay a rolled sheet on a floured surface. Use a ravioli stamp or cutter to lightly mark shapes." },
  { n: "3.2", text: "Add 1½ teaspoons of filling to each marked area. Place a second sheet of dough on top.", image: true },
  { n: "3.3", text: "Press around the filling to remove air, then cut out the ravioli. Repeat with remaining dough and filling." },
  { n: "4.0", text: "Bring a large pot of salted water to a gentle boil." },
  { n: "4.1", text: "Add ravioli and cook until they float, plus 30-60 seconds (3-4 minutes total)." },
  { n: "4.2", text: "Remove with a slotted spoon, drain, and serve with your favorite sauce." },
];

const moreRecipes = [
  { name: "Traditional Ravioli", emoji: "🥟" },
  { name: "Egg & Tomatoes on Toast", emoji: "🍳" },
  { name: "Popcorn", emoji: "🍿" },
  { name: "Roast Pork", emoji: "🍖" },
  { name: "Salmon with Roast Potatoes", emoji: "🐟" },
  { name: "Steak and Potato Jacket", emoji: "🥩" },
];

function NutritionRing({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid size-[74px] place-items-center rounded-full border-4 border-brand text-center text-base text-black">
      <div>
        <p className="font-bold leading-none">{value}</p>
        <p className="leading-none">{label}</p>
      </div>
    </div>
  );
}

function MoreCard({ name, emoji }: { name: string; emoji: string }) {
  return (
    <div className="relative flex flex-col items-center">
      <Link href="/recipe/1" className="grid size-[100px] place-items-center rounded-[5px] bg-[#e9ecf2] text-4xl">
        {emoji}
      </Link>
      <p className="mt-1 max-w-[100px] truncate text-sm text-[#292929]">{name}</p>
    </div>
  );
}

export default function RecipeDetailScreen() {
  const [saved, setSaved] = useState(false);

  return (
    <div className="flex flex-col gap-[5px] py-[5px]">
      {/* Hero */}
      <div className="relative grid h-[234px] w-full place-items-center bg-[#e9ecf2] text-6xl">
        🍝
        <button
          type="button"
          aria-label="Play video"
          className="absolute grid size-20 place-items-center rounded-full bg-brand/90 text-white"
        >
          <PlayIcon className="ml-1 size-7" />
        </button>
      </div>

      {/* Title / prep / nutrition */}
      <section className="flex flex-col gap-2.5 bg-white p-2.5">
        <div>
          <div className="flex items-center border-b-2 border-brand py-2.5">
            <h1 className="flex-1 text-xl font-bold text-[#292929]">Traditional Ravioli</h1>
            <button
              type="button"
              aria-label={saved ? "Remove bookmark" : "Save recipe"}
              onClick={() => setSaved((s) => !s)}
              className="text-brand"
            >
              {saved ? (
                <BookmarkFillIcon className="size-8" />
              ) : (
                <BookmarkIcon className="size-8" />
              )}
            </button>
          </div>
          <p className="flex gap-2.5 py-2 text-base text-[#292929]">
            <span className="font-bold">Category</span>
            <span className="italic">Lunch, Dinner</span>
          </p>
        </div>

        <div className="flex items-start justify-between px-[5px]">
          <div className="flex flex-col gap-2.5">
            {[
              { label: "Preparation Time", value: "2 hours" },
              { label: "Cook Time", value: "5 minutes" },
              { label: "Total Time", value: "2 Hours 5 minutes" },
            ].map((row) => (
              <div key={row.label} className="flex items-center gap-2.5">
                <ClockIcon className="size-7 shrink-0 text-brand" />
                <div className="text-base">
                  <p className="text-black">{row.label}</p>
                  <p className="text-brand">{row.value}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2.5">
            <ServingIcon className="size-7 text-brand" />
            <span className="text-base text-black">4 Serving</span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <h2 className="text-xl font-bold text-brand">Nutrition</h2>
          <div className="flex items-center justify-between">
            {nutrition.map((n) => (
              <NutritionRing key={n.label} {...n} />
            ))}
          </div>
        </div>
      </section>

      {/* Ingredients */}
      <section className="flex flex-col gap-2.5 bg-white p-2.5">
        <h2 className="text-xl font-bold text-brand">Ingredients</h2>
        <div className="flex flex-col gap-5 px-[5px] pb-[5px]">
          {ingredientGroups.map((group) => (
            <div key={group.title}>
              <p className="text-base text-[#292929]">{group.title}</p>
              <ul className="ms-6 list-disc text-base text-[#292929]">
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="flex items-center justify-center bg-brand px-2.5 py-1 text-xl font-bold text-white"
        >
          Add to Shopping Cart
        </button>
      </section>

      {/* Instructions */}
      <section className="flex flex-col gap-2.5 bg-white p-2.5 shadow-[0px_2px_2px_rgba(205,205,205,0.25)]">
        <h2 className="text-xl font-bold text-brand">Instructions</h2>
        <div className="flex flex-col gap-1">
          {steps.map((step) => (
            <div key={step.n} className="flex flex-col gap-1">
              <div className="flex gap-2.5 border-b border-[#d0d6e8] px-[5px] py-2.5 text-base">
                <span className="text-black">{step.n}</span>
                <p className="flex-1 text-[#292929]">{step.text}</p>
              </div>
              {step.image ? (
                <div className="grid h-[203px] w-full place-items-center bg-[#d9d9d9] text-4xl">
                  📷
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      {/* Author + comments */}
      <section className="flex flex-col items-center gap-2.5 bg-white px-2.5">
        <div className="flex w-[340px] gap-5 border-b-2 border-brand py-2.5">
          <div className="flex w-[55px] flex-col items-center gap-5">
            <Link href="/user" className="grid size-[55px] place-items-center rounded-full bg-brand/15 text-lg font-bold text-brand">
              CH
            </Link>
            <div className="flex flex-1 flex-col items-center justify-between gap-3 text-brand">
              <button type="button" aria-label="Like"><HeartIcon className="size-7" /></button>
              <button type="button" aria-label="Message"><MessageIcon className="size-7" /></button>
              <button type="button" aria-label="Share"><ShareIcon className="size-6" /></button>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-2.5 py-2.5">
            <p className="text-xl font-bold text-brand">Courtney Henry</p>
            <p className="text-base italic text-[#292929]">
              I&rsquo;m passionate about cooking and love experimenting with
              flavours and ingredients, sharing simple recipes with
              easy-to-follow instructions.
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2.5 py-2.5">
          <h3 className="text-xl font-bold text-brand">Comments</h3>
          <div className="flex gap-[15px] rounded-[5px] bg-[#f6f7fa] p-2.5">
            <span className="grid size-[35px] shrink-0 place-items-center rounded-full bg-brand/15 text-sm font-bold text-brand">
              AM
            </span>
            <div className="flex flex-1 flex-col gap-[5px] py-[5px]">
              <p className="font-semibold text-brand">Arlene McCoy</p>
              <p className="text-sm text-[#292929]">Simple recipe, turned out yummy!</p>
              <p className="text-sm text-muted">10:30AM - 27/11/2024</p>
            </div>
          </div>
          <button type="button" className="flex h-[45px] items-center justify-center bg-brand text-xl font-semibold text-white">
            Show More
          </button>
          <form className="flex items-center gap-1.5 rounded-[5px] bg-[#f6f7fa] px-2.5 py-[5px]">
            <input
              className="flex-1 bg-transparent py-[5px] text-base font-bold text-[#292929] outline-none placeholder:text-muted"
              placeholder="Write a comment!"
              aria-label="Write a comment"
            />
            <button type="submit" aria-label="Send comment" className="text-brand">
              <SendIcon className="size-6" />
            </button>
          </form>
        </div>
      </section>

      {/* More to love */}
      <section className="flex flex-col gap-2.5 bg-white p-2.5 shadow-[0px_2px_2.5px_rgba(178,178,178,0.25)]">
        <div className="flex items-center gap-[5px]">
          <h2 className="flex-1 text-xl font-bold text-brand">More to Love!</h2>
          <Link href="/recipes/more" className="flex h-9 items-center justify-center rounded-[4px] bg-brand px-4 text-xl text-white">
            more
          </Link>
        </div>
        <div className="flex flex-wrap justify-between gap-y-2.5 py-2.5">
          {moreRecipes.map((r, i) => (
            <MoreCard key={`${r.name}-${i}`} {...r} />
          ))}
        </div>
      </section>
    </div>
  );
}
