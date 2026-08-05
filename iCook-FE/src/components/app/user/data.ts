import type { FeedItem, FeedUser, MeTab } from "./types";

export const CURRENT_USER: FeedUser = {
  name: "Courtney Henry",
  handle: "courtneyhenry",
  initials: "CH",
  about:
    "Passionate about cooking and sharing simple, delicious recipes with easy-to-follow instructions.",
};

const amy: FeedUser = {
  name: "Chef Amy",
  handle: "chefamy",
  initials: "CA",
};
const ben: FeedUser = {
  name: "Baker Ben",
  handle: "bakerben",
  initials: "BB",
};
const sue: FeedUser = {
  name: "Sweet Sue",
  handle: "sweetsue",
  initials: "SS",
};
const grill: FeedUser = {
  name: "Grill Guy",
  handle: "grillguy",
  initials: "GG",
};

export const ACTIVITY_FEED: FeedItem[] = [
  {
    id: "1",
    kind: "follow",
    user: amy,
    time: "2h ago",
    unread: true,
  },
  {
    id: "2",
    kind: "recipe",
    user: ben,
    time: "4h ago",
    recipeId: "3",
    recipeName: "Blueberry Pancakes",
    preview:
      "Fluffy weekend pancakes with fresh blueberries and a touch of lemon zest.",
    unread: true,
  },
  {
    id: "3",
    kind: "post",
    user: sue,
    time: "Yesterday",
    postId: "1",
    title: "My go-to cookie tip",
    preview:
      "Chill your dough for at least 30 minutes — it keeps the cookies thick and chewy every time.",
  },
  {
    id: "4",
    kind: "comment",
    user: grill,
    time: "Yesterday",
    target: "Ricotta Ravioli",
    recipeId: "1",
    preview: "Tried this last night — the filling was perfect!",
  },
  {
    id: "5",
    kind: "recipe",
    user: grill,
    time: "2d ago",
    recipeId: "5",
    recipeName: "Pork Roast",
    preview:
      "Slow-roasted with rosemary and garlic until the crust is golden and crisp.",
  },
  {
    id: "6",
    kind: "like",
    user: amy,
    time: "3d ago",
    target: "Pasta Salad",
    targetKind: "recipe",
    recipeId: "4",
  },
  {
    id: "7",
    kind: "follow",
    user: sue,
    time: "3d ago",
  },
  {
    id: "8",
    kind: "post",
    user: amy,
    time: "5d ago",
    postId: "2",
    title: "Kitchen reset",
    preview:
      "Cleared out the spice rack this morning — sharing what stayed and what went.",
  },
];

export const INITIAL_FOLLOWERS = [
  "Jacob Jones",
  "Darlene Robertson",
  "Theresa Webb",
];

export const INITIAL_FOLLOWING = [
  "Guy Hawkins",
  "Savannah Nguyen",
  "Annette Black",
  "Kristin Watson",
  "Bessie Cooper",
  "Leslie Alexander",
  "Robert Fox",
  "Kathryn Murphy",
  "Eleanor Pena",
  "Devon Lane",
];

export const TAB_META: Record<MeTab, { label: string }> = {
  activity: { label: "Activity" },
  recipes: { label: "Recipes" },
  saved: { label: "Saved" },
  followers: { label: "Followers" },
  following: { label: "Following" },
};

export const PANEL_TITLE: Record<MeTab, string> = {
  activity: "Activity",
  recipes: "My Recipes",
  saved: "Saved Recipes",
  followers: "Followers",
  following: "Following",
};
