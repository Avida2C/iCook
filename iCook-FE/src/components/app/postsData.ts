import type { FeedUser } from "@/components/app/user/types";

/** Catalog posts shown on Discover / post detail (without comments). */
export const CATALOG_POSTS: Record<
  string,
  {
    title: string;
    body: string;
    time: string;
    category: string;
    user: FeedUser;
    likes: number;
  }
> = {
  "1": {
    title: "My go-to cookie tip",
    body: "Chill your dough for at least 30 minutes — it keeps the cookies thick and chewy every time. Extra points if you brown the butter first. I also scoop onto a cold sheet so they don't spread as much in the oven.",
    time: "2h ago",
    category: "Tips",
    user: { name: "Sweet Sue", handle: "sweetsue", initials: "SS" },
    likes: 28,
  },
  "2": {
    title: "Kitchen reset",
    body: "Cleared out the spice rack this morning — sharing what stayed, what went, and the three bottles I always refill first: smoked paprika, cumin, and Aleppo pepper. If it smells like cardboard, it's done.",
    time: "Yesterday",
    category: "Tips",
    user: { name: "Chef Amy", handle: "chefamy", initials: "CA" },
    likes: 19,
  },
  "3": {
    title: "Charcoal vs gas — honest take",
    body: "Gas is convenient. Charcoal wins on flavour. If you only grill on weekends, charcoal is worth the mess. Keep a chimney starter and you'll never fight with lighter fluid again.",
    time: "2d ago",
    category: "Cooking Techniques",
    user: { name: "Grill Guy", handle: "grillguy", initials: "GG" },
    likes: 34,
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
  },
};
