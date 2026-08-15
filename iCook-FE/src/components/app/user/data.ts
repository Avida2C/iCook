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
const paula: FeedUser = {
  name: "Pasta Paula",
  handle: "pastapaula",
  initials: "PP",
};
const fish: FeedUser = {
  name: "Fish Fan",
  handle: "fishfan",
  initials: "FF",
};
const sam: FeedUser = {
  name: "Snack Sam",
  handle: "snacksam",
  initials: "SS",
};
const jacob: FeedUser = {
  name: "Jacob Jones",
  handle: "jacobjones",
  initials: "JJ",
};
const arlene: FeedUser = {
  name: "Arlene McCoy",
  handle: "arlenemccoy",
  initials: "AM",
};
const brooklyn: FeedUser = {
  name: "Brooklyn Simmons",
  handle: "brooklynsimmons",
  initials: "BS",
};
const leslie: FeedUser = {
  name: "Leslie Alexander",
  handle: "lesliealexander",
  initials: "LA",
};
const kristin: FeedUser = {
  name: "Kristin Watson",
  handle: "kristinwatson",
  initials: "KW",
};
const jenny: FeedUser = {
  name: "Jenny Wilson",
  handle: "jennywilson",
  initials: "JW",
};
const robert: FeedUser = {
  name: "Robert Fox",
  handle: "robertfox",
  initials: "RF",
};
const darlene: FeedUser = {
  name: "Darlene Robertson",
  handle: "darlenerobertson",
  initials: "DR",
};
const theresa: FeedUser = {
  name: "Theresa Webb",
  handle: "theresawebb",
  initials: "TW",
};
const eleanor: FeedUser = {
  name: "Eleanor Pena",
  handle: "eleanorpena",
  initials: "EP",
};

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const seededAt = Date.now();

export const ACTIVITY_FEED: FeedItem[] = [
  {
    id: "f-sam-popcorn",
    kind: "recipe",
    user: sam,
    time: "25min ago",
    recipeId: "9",
    recipeName: "Popcorn",
    preview:
      "Stovetop popcorn with butter and salt — ready in minutes for movie night.",
    createdAt: seededAt - 25 * MIN,
  },
  {
    id: "f-amy-toast-post",
    kind: "post",
    user: amy,
    time: "45min ago",
    postId: "5",
    title: "Toast upgrades that actually matter",
    preview:
      "Good bread, room-temp butter, and a pinch of flaky salt. Add a soft egg or smashed avocado if you want.",
    thumbnailUrl: "/icons/recipes/toasty.png",
    createdAt: seededAt - 45 * MIN,
  },
  {
    id: "1",
    kind: "follow",
    user: amy,
    time: "2hr ago",
    createdAt: seededAt - 2 * HOUR,
  },
  {
    id: "f-paula-linguine",
    kind: "recipe",
    user: paula,
    time: "3hr ago",
    recipeId: "14",
    recipeName: "Garlic Butter Linguine",
    preview: "Quick linguine tossed in garlic butter and parsley.",
    createdAt: seededAt - 3 * HOUR,
  },
  {
    id: "2",
    kind: "recipe",
    user: ben,
    time: "4hr ago",
    recipeId: "3",
    recipeName: "Blueberry Pancakes",
    preview:
      "Fluffy weekend pancakes with fresh blueberries and a touch of lemon zest.",
    createdAt: seededAt - 4 * HOUR,
  },
  {
    id: "f-grill-rest-post",
    kind: "post",
    user: grill,
    time: "6hr ago",
    postId: "6",
    title: "Don't skip the resting step",
    preview:
      "Whether it's steak, roast chicken, or cookies — resting is free flavour insurance.",
    thumbnailUrl: "/icons/recipes/dinner.png",
    createdAt: seededAt - 6 * HOUR,
  },
  {
    id: "f-sue-fruit-post",
    kind: "post",
    user: sue,
    time: "8hr ago",
    postId: "7",
    title: "Fruit bowl that isn't boring",
    preview:
      "Toss berries with a squeeze of citrus, a spoon of honey, and torn mint.",
    thumbnailUrl: "/icons/recipes/fruity.png",
    createdAt: seededAt - 8 * HOUR,
  },
  {
    id: "f-ben-pantry-post",
    kind: "post",
    user: ben,
    time: "10hr ago",
    postId: "8",
    title: "Pantry lunch in 12 minutes",
    preview:
      "Tinned beans, olive oil, lemon, chilli flakes, and whatever greens are left.",
    thumbnailUrl: "/icons/recipes/lunch.png",
    createdAt: seededAt - 10 * HOUR,
  },
  {
    id: "f-fish-like-ravioli",
    kind: "like",
    user: fish,
    time: "12hr ago",
    target: "Ricotta Ravioli",
    targetKind: "recipe",
    recipeId: "1",
    createdAt: seededAt - 12 * HOUR,
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
    thumbnailUrl: "/icons/recipes/sweets.png",
    createdAt: seededAt - DAY,
  },
  {
    id: "4",
    kind: "comment",
    user: grill,
    time: "Yesterday",
    target: "Ricotta Ravioli",
    recipeId: "1",
    preview: "Tried this last night — the filling was perfect! 🔥",
    createdAt: seededAt - DAY - 2 * HOUR,
  },
  {
    id: "f-fish-salmon",
    kind: "recipe",
    user: fish,
    time: "Yesterday",
    recipeId: "11",
    recipeName: "Salmon with Roast Potatoes",
    preview:
      "Crispy roast potatoes and dill-lemon salmon — an easy sheet-pan dinner.",
    createdAt: seededAt - DAY - 4 * HOUR,
  },
  {
    id: "f-fish-night-post",
    kind: "post",
    user: fish,
    time: "Yesterday",
    postId: "11",
    title: "Fish night without the fear",
    preview:
      "Pat dry, high heat, don't flip early, finish with lemon and butter.",
    thumbnailUrl: "/icons/recipes/dinner.png",
    createdAt: seededAt - DAY - 6 * HOUR,
  },
  {
    id: "f-paula-comment",
    kind: "comment",
    user: paula,
    time: "Yesterday",
    target: "Pasta Salad",
    recipeId: "4",
    preview: "Made this for lunch and packed the leftovers. Still great cold.",
    createdAt: seededAt - DAY - 8 * HOUR,
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
    createdAt: seededAt - 2 * DAY,
  },
  {
    id: "f-ben-sourdough-post",
    kind: "post",
    user: ben,
    time: "2d ago",
    postId: "12",
    title: "Sourdough starter pep talk",
    preview:
      "If it smells like nail polish remover, feed it and wait. Discard is not failure.",
    thumbnailUrl: "/icons/recipes/toasty.png",
    createdAt: seededAt - 2 * DAY - 3 * HOUR,
  },
  {
    id: "f-amy-mealprep-post",
    kind: "post",
    user: amy,
    time: "2d ago",
    postId: "13",
    title: "Meal prep that doesn't taste sad",
    preview:
      "Cook components, not identical boxes. Roast veggies, a grain, a protein, and a sharp sauce.",
    thumbnailUrl: "/icons/recipes/lunch.png",
    createdAt: seededAt - 2 * DAY - 8 * HOUR,
  },
  {
    id: "f-sue-cookies",
    kind: "recipe",
    user: sue,
    time: "3d ago",
    recipeId: "6",
    recipeName: "Chocolate Cookies",
    preview:
      "Chewy chocolate chip cookies with browned butter notes and melty puddles of chocolate.",
    createdAt: seededAt - 3 * DAY,
  },
  {
    id: "6",
    kind: "like",
    user: amy,
    time: "3d ago",
    target: "Pasta Salad",
    targetKind: "recipe",
    recipeId: "4",
    createdAt: seededAt - 3 * DAY - 2 * HOUR,
  },
  {
    id: "7",
    kind: "follow",
    user: sue,
    time: "3d ago",
    createdAt: seededAt - 3 * DAY - 5 * HOUR,
  },
  {
    id: "f-ben-breakfast-post",
    kind: "post",
    user: ben,
    time: "3d ago",
    postId: "15",
    title: "Breakfast for dinner is a strategy",
    preview:
      "Eggs, toast, and fruit when the fridge is empty still counts as cooking.",
    thumbnailUrl: "/icons/recipes/breakfast.png",
    createdAt: seededAt - 3 * DAY - 7 * HOUR,
  },
  {
    id: "f-sue-snack-post",
    kind: "post",
    user: sue,
    time: "4d ago",
    postId: "10",
    title: "Snack plate > fancy appetizers",
    preview:
      "Cheese, crackers, olives, sliced apple, and a jar of mustard. Put it on a board and call it a night.",
    thumbnailUrl: "/icons/recipes/snacks.png",
    createdAt: seededAt - 4 * DAY,
  },
  {
    id: "f-grill-marks-post",
    kind: "post",
    user: grill,
    time: "4d ago",
    postId: "16",
    title: "Grill marks aren't the goal",
    preview:
      "Colour and crust matter more than perfect diamonds. Leave the food alone until it releases.",
    thumbnailUrl: "/icons/recipes/dinner.png",
    createdAt: seededAt - 4 * DAY - 4 * HOUR,
  },
  {
    id: "f-paula-arrabbiata",
    kind: "recipe",
    user: paula,
    time: "4d ago",
    recipeId: "18",
    recipeName: "Spicy Arrabbiata",
    preview: "Classic spicy tomato pasta with chili flakes.",
    createdAt: seededAt - 4 * DAY - 9 * HOUR,
  },
  {
    id: "f-amy-eggs-toast",
    kind: "recipe",
    user: amy,
    time: "5d ago",
    recipeId: "2",
    recipeName: "Egg on Toast",
    preview:
      "Crispy buttered toast topped with a soft fried egg and a pinch of cracked pepper.",
    createdAt: seededAt - 5 * DAY,
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
    thumbnailUrl: "/icons/recipes/savoury.png",
    createdAt: seededAt - 5 * DAY - 3 * HOUR,
  },
  {
    id: "f-sue-frozen-post",
    kind: "post",
    user: sue,
    time: "5d ago",
    postId: "17",
    title: "Frozen fruit is a dessert cheat code",
    preview:
      "Blend frozen berries with yogurt for soft-serve vibes, or warm them with sugar for an instant sauce.",
    thumbnailUrl: "/icons/recipes/fruity.png",
    createdAt: seededAt - 5 * DAY - 6 * HOUR,
  },
  {
    id: "f-grill-like-post",
    kind: "like",
    user: grill,
    time: "5d ago",
    target: "Weeknight pasta formula",
    targetKind: "post",
    postId: "4",
    createdAt: seededAt - 5 * DAY - 10 * HOUR,
  },
  {
    id: "f-sue-cheesecake",
    kind: "recipe",
    user: sue,
    time: "6d ago",
    recipeId: "13",
    recipeName: "Raspberry Cheesecake",
    preview:
      "No-fuss raspberry cheesecake with a buttery base and tangy yogurt cream.",
    createdAt: seededAt - 6 * DAY,
  },
  {
    id: "f-ben-pastry-post",
    kind: "post",
    user: ben,
    time: "6d ago",
    postId: "19",
    title: "Coffee shop pastry at home",
    preview:
      "Buy good puff pastry, fill with jam or chocolate, egg wash, sugar on top.",
    thumbnailUrl: "/icons/recipes/sweets.png",
    createdAt: seededAt - 6 * DAY - 5 * HOUR,
  },
  {
    id: "f-fish-sheetpan-post",
    kind: "post",
    user: fish,
    time: "6d ago",
    postId: "18",
    title: "Sheet-pan dinners saved my weeknights",
    preview:
      "Protein + sturdy vegetables + oil + salt. Hot oven. One tray.",
    thumbnailUrl: "/icons/recipes/dinner.png",
    createdAt: seededAt - 6 * DAY - 8 * HOUR,
  },
  {
    id: "f-amy-taste-post",
    kind: "post",
    user: amy,
    time: "8d ago",
    postId: "20",
    title: "Taste as you go — seriously",
    preview:
      "The difference between okay and great is usually three tiny adjustments: more salt, more acid, or more fat.",
    thumbnailUrl: "/icons/recipes/savoury.png",
    createdAt: seededAt - 8 * DAY,
  },
  {
    id: "f-grill-steak",
    kind: "recipe",
    user: grill,
    time: "9d ago",
    recipeId: "12",
    recipeName: "Steak and Potato Jacket",
    preview:
      "Seared steak sliced over a fluffy jacket potato with garlic butter.",
    createdAt: seededAt - 9 * DAY,
  },
  {
    id: "f-paula-cacio",
    kind: "recipe",
    user: paula,
    time: "10d ago",
    recipeId: "21",
    recipeName: "Cacio e Pepe",
    preview: "Roman classic: cheese, pepper, and spaghetti.",
    createdAt: seededAt - 10 * DAY,
  },
  {
    id: "f-amy-tomato-toast",
    kind: "recipe",
    user: amy,
    time: "11d ago",
    recipeId: "8",
    recipeName: "Egg & Tomatoes on Toast",
    preview:
      "Garlic-sautéed tomatoes and soft eggs piled on toast with fresh basil.",
    createdAt: seededAt - 11 * DAY,
  },
  {
    id: "f-grill-roast-pork",
    kind: "recipe",
    user: grill,
    time: "12d ago",
    recipeId: "10",
    recipeName: "Roast Pork",
    preview:
      "Lemon-rosemary roast pork with garlic — a simpler cousin of the classic pork roast.",
    createdAt: seededAt - 12 * DAY,
  },
  {
    id: "f-ben-like-vinaigrette",
    kind: "like",
    user: ben,
    time: "12d ago",
    target: "The only vinaigrette ratio I use",
    targetKind: "post",
    postId: "14",
    createdAt: seededAt - 12 * DAY - 4 * HOUR,
  },
  {
    id: "f-sam-comment",
    kind: "comment",
    user: sam,
    time: "13d ago",
    target: "Traditional Ravioli",
    recipeId: "7",
    preview: "Made a snack plate while these boiled. 10/10 pairing.",
    createdAt: seededAt - 13 * DAY,
  },
  {
    id: "f-jacob-follow",
    kind: "follow",
    user: jacob,
    time: "18min ago",
    createdAt: seededAt - 18 * MIN,
  },
  {
    id: "f-brooklyn-follow",
    kind: "follow",
    user: brooklyn,
    time: "6hr ago",
    createdAt: seededAt - 6 * HOUR,
  },
  {
    id: "f-arlene-follow",
    kind: "follow",
    user: arlene,
    time: "Yesterday",
    createdAt: seededAt - DAY - 3 * HOUR,
  },
  {
    id: "f-ben-follow",
    kind: "follow",
    user: ben,
    time: "2d ago",
    createdAt: seededAt - 2 * DAY - 5 * HOUR,
  },
  {
    id: "f-leslie-follow",
    kind: "follow",
    user: leslie,
    time: "2d ago",
    createdAt: seededAt - 2 * DAY - 10 * HOUR,
  },
  {
    id: "f-fish-follow",
    kind: "follow",
    user: fish,
    time: "4d ago",
    createdAt: seededAt - 4 * DAY - 2 * HOUR,
  },
  {
    id: "f-darlene-follow",
    kind: "follow",
    user: darlene,
    time: "5d ago",
    createdAt: seededAt - 5 * DAY - 1 * HOUR,
  },
  {
    id: "f-kristin-follow",
    kind: "follow",
    user: kristin,
    time: "6d ago",
    createdAt: seededAt - 6 * DAY,
  },
  {
    id: "f-paula-follow",
    kind: "follow",
    user: paula,
    time: "6d ago",
    createdAt: seededAt - 6 * DAY - 6 * HOUR,
  },
  {
    id: "f-jenny-follow",
    kind: "follow",
    user: jenny,
    time: "8d ago",
    createdAt: seededAt - 8 * DAY,
  },
  {
    id: "f-theresa-follow",
    kind: "follow",
    user: theresa,
    time: "9d ago",
    createdAt: seededAt - 9 * DAY - 2 * HOUR,
  },
  {
    id: "f-robert-follow",
    kind: "follow",
    user: robert,
    time: "10d ago",
    createdAt: seededAt - 10 * DAY,
  },
  {
    id: "f-sam-follow",
    kind: "follow",
    user: sam,
    time: "11d ago",
    createdAt: seededAt - 11 * DAY - 4 * HOUR,
  },
  {
    id: "f-eleanor-follow",
    kind: "follow",
    user: eleanor,
    time: "12d ago",
    createdAt: seededAt - 12 * DAY,
  },
];

export const INITIAL_FOLLOWERS = [
  "Jacob Jones",
  "Darlene Robertson",
  "Theresa Webb",
  "Arlene McCoy",
  "Chef Amy",
  "Baker Ben",
  "Sweet Sue",
  "Grill Guy",
  "Pasta Paula",
  "Fish Fan",
  "Snack Sam",
  "Brooklyn Simmons",
  "Leslie Alexander",
  "Kristin Watson",
  "Jenny Wilson",
  "Robert Fox",
  "Cameron Williamson",
  "Jane Cooper",
  "Annette Black",
  "Eleanor Pena",
  "Marvin McKinney",
];

export const INITIAL_FOLLOWING = [
  "Chef Amy",
  "Baker Ben",
  "Sweet Sue",
  "Grill Guy",
  "Pasta Paula",
  "Fish Fan",
  "Snack Sam",
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
