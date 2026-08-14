import type { FeedUser } from "@/components/app/user/types";

export type CatalogPost = {
  title: string;
  body: string;
  time: string;
  category: string;
  user: FeedUser;
  likes: number;
  thumbnailUrl?: string;
};

/** Stable demo created-at for catalog posts. */
export function catalogPostCreatedAt(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 33 + id.charCodeAt(i)) >>> 0;
  }
  return Date.UTC(2024, 0, 1) + (hash % 400) * 86_400_000;
}

/** Catalog posts shown on Discover / post detail (without comments). */
export const CATALOG_POSTS: Record<string, CatalogPost> = {
  "1": {
    title: "My go-to cookie tip",
    body: "Chill your dough for at least 30 minutes — it keeps the cookies thick and chewy every time. Extra points if you brown the butter first. I also scoop onto a cold sheet so they don't spread as much in the oven.",
    time: "2h ago",
    category: "Tips",
    user: { name: "Sweet Sue", handle: "sweetsue", initials: "SS" },
    likes: 28,
    thumbnailUrl: "/icons/recipes/sweets.png",
  },
  "2": {
    title: "Kitchen reset",
    body: "Cleared out the spice rack this morning — sharing what stayed, what went, and the three bottles I always refill first: smoked paprika, cumin, and Aleppo pepper. If it smells like cardboard, it's done.",
    time: "Yesterday",
    category: "Tips",
    user: { name: "Chef Amy", handle: "chefamy", initials: "CA" },
    likes: 19,
    thumbnailUrl: "/icons/recipes/savoury.png",
  },
  "3": {
    title: "Charcoal vs gas — honest take",
    body: "Gas is convenient. Charcoal wins on flavour. If you only grill on weekends, charcoal is worth the mess. Keep a chimney starter and you'll never fight with lighter fluid again.",
    time: "2d ago",
    category: "Cooking Techniques",
    user: { name: "Grill Guy", handle: "grillguy", initials: "GG" },
    likes: 34,
    thumbnailUrl: "/icons/recipes/dinner.png",
  },
  "4": {
    title: "Weeknight pasta formula",
    body: "One pan, one handful of greens, whatever cheese you have. Boil pasta, sear garlic in olive oil, toss greens until wilted, finish with pasta water and cheese. The formula I use when dinner needs to happen in 20 minutes.",
    time: "4d ago",
    category: "Recipes",
    user: {
      name: "Courtney Henry",
      handle: "courtneyhenry",
      initials: "CH",
    },
    likes: 56,
    thumbnailUrl: "/icons/recipes/pasta.png",
  },
  "5": {
    title: "Toast upgrades that actually matter",
    body: "Good bread, room-temp butter, and a pinch of flaky salt. Add a soft egg or smashed avocado if you want, but those three alone beat most café toasts.",
    time: "5h ago",
    category: "Breakfast",
    user: { name: "Chef Amy", handle: "chefamy", initials: "CA" },
    likes: 41,
    thumbnailUrl: "/icons/recipes/toasty.png",
  },
  "6": {
    title: "Don't skip the resting step",
    body: "Whether it's steak, roast chicken, or cookies — resting is free flavour insurance. Ten minutes on a board beats cutting in too early and watching the juices run away.",
    time: "6h ago",
    category: "Cooking Techniques",
    user: { name: "Grill Guy", handle: "grillguy", initials: "GG" },
    likes: 63,
    thumbnailUrl: "/icons/recipes/dinner.png",
  },
  "7": {
    title: "Fruit bowl that isn't boring",
    body: "Toss berries with a squeeze of citrus, a spoon of honey, and torn mint. Suddenly it feels like dessert without baking anything.",
    time: "8h ago",
    category: "Tips",
    user: { name: "Sweet Sue", handle: "sweetsue", initials: "SS" },
    likes: 22,
    thumbnailUrl: "/icons/recipes/fruity.png",
  },
  "8": {
    title: "Pantry lunch in 12 minutes",
    body: "Tinned beans, olive oil, lemon, chilli flakes, and whatever greens are left. Warm it all in one skillet and eat with toast. Cheap, fast, surprisingly good.",
    time: "10h ago",
    category: "Lunch",
    user: { name: "Baker Ben", handle: "bakerben", initials: "BB" },
    likes: 37,
    thumbnailUrl: "/icons/recipes/lunch.png",
  },
  "9": {
    title: "Salt earlier than you think",
    body: "Season proteins ahead when you can. Even 20 minutes changes the texture. For vegetables, salt right before they hit heat so they don't weep into a soggy pile.",
    time: "12h ago",
    category: "Cooking Techniques",
    user: {
      name: "Courtney Henry",
      handle: "courtneyhenry",
      initials: "CH",
    },
    likes: 48,
    thumbnailUrl: "/icons/recipes/savoury.png",
  },
  "10": {
    title: "Snack plate > fancy appetizers",
    body: "Cheese, crackers, olives, sliced apple, and a jar of mustard. Put it on a board and call it a night. Guests are happier than with anything that needed a recipe.",
    time: "1d ago",
    category: "Snacks",
    user: { name: "Sweet Sue", handle: "sweetsue", initials: "SS" },
    likes: 31,
    thumbnailUrl: "/icons/recipes/snacks.png",
  },
  "11": {
    title: "Fish night without the fear",
    body: "Pat dry, high heat, don't flip early, finish with lemon and butter. If it sticks, it isn't ready. That's 90% of home fish cooking.",
    time: "1d ago",
    category: "Dinner",
    user: { name: "Fish Fan", handle: "fishfan", initials: "FF" },
    likes: 44,
    thumbnailUrl: "/icons/recipes/dinner.png",
  },
  "12": {
    title: "Sourdough starter pep talk",
    body: "If it smells like nail polish remover, feed it and wait. If it's sluggish, keep it warmer. Discard is not failure — it's how you keep the culture happy.",
    time: "2d ago",
    category: "Baking",
    user: { name: "Baker Ben", handle: "bakerben", initials: "BB" },
    likes: 52,
    thumbnailUrl: "/icons/recipes/toasty.png",
  },
  "13": {
    title: "Meal prep that doesn't taste sad",
    body: "Cook components, not identical boxes. Roast veggies, a grain, a protein, and a sharp sauce. Mix differently each day so Tuesday doesn't taste like Monday.",
    time: "2d ago",
    category: "Tips",
    user: { name: "Chef Amy", handle: "chefamy", initials: "CA" },
    likes: 71,
    thumbnailUrl: "/icons/recipes/lunch.png",
  },
  "14": {
    title: "The only vinaigrette ratio I use",
    body: "1 part acid, 3 parts oil, pinch of salt, tiny spoon of mustard. Shake in a jar. Add honey if the greens are bitter. Done forever.",
    time: "3d ago",
    category: "Tips",
    user: {
      name: "Courtney Henry",
      handle: "courtneyhenry",
      initials: "CH",
    },
    likes: 59,
    thumbnailUrl: "/icons/recipes/savoury.png",
  },
  "15": {
    title: "Breakfast for dinner is a strategy",
    body: "Eggs, toast, and fruit when the fridge is empty still counts as cooking. Add a handful of greens to the pan and you've upgraded it without effort.",
    time: "3d ago",
    category: "Breakfast",
    user: { name: "Baker Ben", handle: "bakerben", initials: "BB" },
    likes: 26,
    thumbnailUrl: "/icons/recipes/breakfast.png",
  },
  "16": {
    title: "Grill marks aren't the goal",
    body: "Colour and crust matter more than perfect diamonds. Leave the food alone until it releases. Flip once. Rest. That's the whole technique.",
    time: "4d ago",
    category: "Cooking Techniques",
    user: { name: "Grill Guy", handle: "grillguy", initials: "GG" },
    likes: 45,
    thumbnailUrl: "/icons/recipes/dinner.png",
  },
  "17": {
    title: "Frozen fruit is a dessert cheat code",
    body: "Blend frozen berries with yogurt for soft-serve vibes, or warm them with sugar for an instant sauce over cake, oatmeal, or ice cream.",
    time: "5d ago",
    category: "Sweets",
    user: { name: "Sweet Sue", handle: "sweetsue", initials: "SS" },
    likes: 38,
    thumbnailUrl: "/icons/recipes/fruity.png",
  },
  "18": {
    title: "Sheet-pan dinners saved my weeknights",
    body: "Protein + sturdy vegetables + oil + salt. Hot oven. One tray. If everything finishes at different times, start the denser stuff first — still fewer dishes than a sink full of pans.",
    time: "5d ago",
    category: "Dinner",
    user: { name: "Fish Fan", handle: "fishfan", initials: "FF" },
    likes: 67,
    thumbnailUrl: "/icons/recipes/dinner.png",
  },
  "19": {
    title: "Coffee shop pastry at home",
    body: "Buy good puff pastry, fill with jam or chocolate, egg wash, sugar on top. Bake until deep golden. Looks fancy, uses almost no skill, disappears in minutes.",
    time: "6d ago",
    category: "Baking",
    user: { name: "Baker Ben", handle: "bakerben", initials: "BB" },
    likes: 54,
    thumbnailUrl: "/icons/recipes/sweets.png",
  },
  "20": {
    title: "Taste as you go — seriously",
    body: "The difference between okay and great is usually three tiny adjustments: more salt, more acid, or more fat. Keep a spoon nearby and check before you plate.",
    time: "1w ago",
    category: "Tips",
    user: { name: "Chef Amy", handle: "chefamy", initials: "CA" },
    likes: 82,
    thumbnailUrl: "/icons/recipes/savoury.png",
  },
};
