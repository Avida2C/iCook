import type { IngredientLine } from "@/components/ingredients/ingredientCatalog";
import {
  coerceIngredientLines,
  formatIngredientLine,
  ingredientNamesFromLines,
} from "@/components/ingredients/ingredientCatalog";

export type RecipeCategorySlug =
  | "breakfast"
  | "lunch"
  | "dinner"
  | "snacks"
  | "sweets"
  | "fruity"
  | "toasty"
  | "savoury"
  | "pasta"
  | "all"
  | "loved";

export type RecipeCategory = Exclude<RecipeCategorySlug, "all" | "loved">;

export type RecipeNutrition = {
  /** Per-serving values; omit empty fields so they stay hidden on the recipe page. */
  calories?: string;
  protein?: string;
  /** Total fat */
  fat?: string;
  cholesterol?: string;
  sodium?: string;
  carbs?: string;
};

export type RecipeTag =
  | "vegetarian"
  | "vegan"
  | "glutenFree"
  | "lactoseFree"
  | "eggFree";

export const RECIPE_TAG_LABELS: Record<RecipeTag, string> = {
  vegetarian: "Vegetarian",
  vegan: "Vegan",
  glutenFree: "Gluten free",
  lactoseFree: "Lactose free",
  eggFree: "Egg free",
};

export const ALL_RECIPE_TAGS: RecipeTag[] = [
  "vegetarian",
  "vegan",
  "glutenFree",
  "lactoseFree",
  "eggFree",
];

export function isRecipeTag(value: string): value is RecipeTag {
  return (ALL_RECIPE_TAGS as string[]).includes(value);
}

export type RecipeIngredientGroup = {
  title: string;
  items: IngredientLine[];
};

export type RecipeStep = {
  n: string;
  text: string;
  imageUrl?: string;
};

export type Recipe = {
  id: string;
  name: string;
  author: string;
  /** One or more browse categories; first entry is primary for thumbnails. */
  categories: RecipeCategory[];
  /** Dietary / attribute tags (e.g. vegetarian). */
  tags?: RecipeTag[];
  /** Community bookmark baseline (other users). Current user save adds +1 at runtime. */
  bookmarkCount: number;
  description: string;
  /** Epoch ms when the recipe was created (user recipes + optional catalog). */
  createdAt?: number;
  thumbnailUrl?: string;
  prepTime: string;
  cookTime: string;
  totalTime: string;
  servings: number;
  nutrition: RecipeNutrition;
  ingredientGroups: RecipeIngredientGroup[];
  /** Flat names for pantry matching in search. */
  ingredients: string[];
  instructions: RecipeStep[];
};

/** @deprecated Prefer `Recipe` — kept as an alias for list/card consumers. */
export type CatalogRecipe = Recipe;

/** Category artwork used when a recipe has no custom thumbnail. */
export const CATEGORY_THUMBNAILS: Record<RecipeCategory, string> = {
  breakfast: "/icons/recipes/breakfast.png",
  lunch: "/icons/recipes/lunch.png",
  dinner: "/icons/recipes/dinner.png",
  snacks: "/icons/recipes/snacks.png",
  sweets: "/icons/recipes/sweets.png",
  fruity: "/icons/recipes/fruity.png",
  toasty: "/icons/recipes/toasty.png",
  savoury: "/icons/recipes/savoury.png",
  pasta: "/icons/recipes/pasta.png",
};

const VALID_CATEGORIES = new Set<string>(Object.keys(CATEGORY_THUMBNAILS));

export function isRecipeCategory(value: string): value is RecipeCategory {
  return VALID_CATEGORIES.has(value);
}

/** First category — used for thumbnail fallback and single-label contexts. */
export function primaryCategory(
  recipe: Pick<Recipe, "categories"> | { categories?: RecipeCategory[]; category?: RecipeCategory },
): RecipeCategory {
  const list =
    "categories" in recipe && Array.isArray(recipe.categories)
      ? recipe.categories
      : [];
  if (list.length > 0) return list[0];
  if ("category" in recipe && recipe.category && isRecipeCategory(recipe.category)) {
    return recipe.category;
  }
  return "dinner";
}

export function recipeHasCategory(
  recipe: Pick<Recipe, "categories"> | { categories?: RecipeCategory[]; category?: RecipeCategory },
  slug: string,
): boolean {
  if ("categories" in recipe && Array.isArray(recipe.categories)) {
    return recipe.categories.includes(slug as RecipeCategory);
  }
  if ("category" in recipe && typeof recipe.category === "string") {
    return recipe.category === slug;
  }
  return false;
}

/** Normalize to a non-empty unique categories list. */
export function normalizeCategories(
  input: RecipeCategory[] | RecipeCategory | undefined,
  fallback: RecipeCategory = "dinner",
): RecipeCategory[] {
  const raw = Array.isArray(input) ? input : input ? [input] : [];
  const unique: RecipeCategory[] = [];
  for (const c of raw) {
    if (isRecipeCategory(c) && !unique.includes(c)) unique.push(c);
  }
  return unique.length > 0 ? unique : [fallback];
}

/** Resolved image for cards/detail — custom upload, else primary category art. */
export function recipeThumbnailSrc(
  recipe: (Pick<Recipe, "categories"> | { category?: RecipeCategory }) & {
    thumbnailUrl?: string;
  },
): string {
  const custom = recipe.thumbnailUrl?.trim();
  if (custom && custom !== "placeholder") return custom;
  return CATEGORY_THUMBNAILS[primaryCategory(recipe)];
}

/** Recipes at or under this total time appear in Quick To Make. */
export const QUICK_TO_MAKE_MAX_MINUTES = 30;

export function recipeTotalMinutes(
  recipe: Pick<Recipe, "totalTime"> | { totalTime?: string },
): number | null {
  return parseMinutes(recipe.totalTime);
}

export function isQuickToMake(
  recipe: Pick<Recipe, "totalTime"> | { totalTime?: string },
): boolean {
  const minutes = recipeTotalMinutes(recipe);
  return minutes != null && minutes <= QUICK_TO_MAKE_MAX_MINUTES;
}

/** Parse a time string into whole minutes (supports legacy "1 hour 30 minutes"). */
export function parseMinutes(value: string | undefined | null): number | null {
  if (value == null) return null;
  const raw = value.trim().toLowerCase();
  if (!raw || raw === "—" || raw === "-") return null;

  if (/^\d+$/.test(raw)) return Math.max(0, Number(raw));

  const minutesOnly = raw.match(/^(\d+)\s*min(ute)?s?\b/);
  if (minutesOnly) return Math.max(0, Number(minutesOnly[1]));

  let total = 0;
  let matched = false;
  const hourMatch = raw.match(/(\d+)\s*hours?/);
  if (hourMatch) {
    total += Number(hourMatch[1]) * 60;
    matched = true;
  }
  const minMatch = raw.match(/(\d+)\s*min/);
  if (minMatch) {
    total += Number(minMatch[1]);
    matched = true;
  }
  if (matched) return Math.max(0, total);

  const digits = raw.match(/\d+/);
  return digits ? Math.max(0, Number(digits[0])) : null;
}

/** Display / stored form: "12 minutes" (or "1 minute"). */
export function formatMinutes(minutes: number): string {
  const n = Math.max(0, Math.round(minutes));
  return `${n} minute${n === 1 ? "" : "s"}`;
}

/** Normalize any time input to "N minutes", or "—" when empty/invalid. */
export function normalizeTimeMinutes(
  value: string | number | undefined | null,
): string {
  if (typeof value === "number" && Number.isFinite(value)) {
    return formatMinutes(value);
  }
  const parsed = parseMinutes(String(value ?? ""));
  if (parsed == null) return "—";
  return formatMinutes(parsed);
}

export function flatIngredientsFromGroups(
  groups: RecipeIngredientGroup[],
): string[] {
  const names = new Set<string>();
  for (const group of groups) {
    for (const name of ingredientNamesFromLines(group.items)) {
      names.add(name);
    }
  }
  return [...names];
}

/** Normalize group items that may still be legacy free-text strings. */
export function normalizeIngredientGroups(
  groups: RecipeIngredientGroup[] | { title: string; items: unknown[] }[] | undefined,
): RecipeIngredientGroup[] {
  if (!groups?.length) {
    return [{ title: "Ingredients", items: [] }];
  }
  return groups.map((g) => ({
    title: (g.title || "Ingredients").trim() || "Ingredients",
    items: coerceIngredientLines(g.items as unknown[]),
  }));
}

export { formatIngredientLine };

const emptyNutrition = (): RecipeNutrition => ({});

const MEAT_KEYWORDS = [
  "beef",
  "pork",
  "chicken",
  "turkey",
  "lamb",
  "veal",
  "duck",
  "bacon",
  "ham",
  "sausage",
  "pepperoni",
  "salami",
  "prosciutto",
  "chorizo",
  "meat",
  "mince",
  "steak",
  "brisket",
  "ribs",
  "wing",
  "thigh",
  "fish",
  "salmon",
  "tuna",
  "cod",
  "shrimp",
  "prawn",
  "crab",
  "lobster",
  "anchovy",
  "seafood",
  "clam",
  "mussel",
  "oyster",
  "sardine",
];

const DAIRY_KEYWORDS = [
  "milk",
  "cream",
  "butter",
  "cheese",
  "cheddar",
  "parmesan",
  "mozarella",
  "mozzarella",
  "ricotta",
  "mascarpone",
  "yogurt",
  "yoghurt",
  "whey",
  "casein",
  "lactose",
  "ghee",
  "buttermilk",
  "sour cream",
  "creme fraiche",
  "crème fraîche",
  "half-and-half",
  "evaporated milk",
  "condensed milk",
  "ice cream",
];

const EGG_KEYWORDS = [
  "egg",
  "eggs",
  "egg white",
  "egg whites",
  "egg yolk",
  "egg yolks",
  "yolk",
  "yolks",
  "mayonnaise",
  "mayo",
];

/** Extra animal-derived items that block vegan (beyond meat/dairy/egg). */
const NON_VEGAN_EXTRA_KEYWORDS = [
  "honey",
  "gelatin",
  "gelatine",
  "beeswax",
  "royal jelly",
  "fish sauce",
  "worcestershire",
  "lard",
  "tallow",
  "suet",
  "bone broth",
  "chicken stock",
  "beef stock",
  "fish stock",
];

/**
 * Gluten cues — conservative: common wheat products and named grains.
 * Plain "flour" counts (most recipe flour is wheat unless specified otherwise).
 */
const GLUTEN_KEYWORDS = [
  "wheat",
  "barley",
  "rye",
  "malt",
  "seitan",
  "couscous",
  "bulgur",
  "semolina",
  "spelt",
  "farro",
  "durum",
  "flour",
  "bread",
  "breadcrumb",
  "breadcrumbs",
  "pasta",
  "spaghetti",
  "penne",
  "fettuccine",
  "lasagna",
  "lasagne",
  "noodle",
  "noodles",
  "ravioli",
  "tortellini",
  "macaroni",
  "orzo",
  "soy sauce",
  "soya sauce",
  "teriyaki",
  "panko",
  "crouton",
  "croutons",
  "pretzel",
  "baguette",
  "croissant",
  "pita",
  "tortilla",
  "wrap",
];

/** Flours / starches that are typically gluten-free (negate plain "flour" hits). */
const GLUTEN_FREE_FLOUR_CUES = [
  "rice flour",
  "almond flour",
  "coconut flour",
  "corn flour",
  "cornstarch",
  "corn starch",
  "potato starch",
  "tapioca",
  "chickpea flour",
  "gram flour",
  "buckwheat flour",
  "oat flour",
  "gluten-free flour",
  "gluten free flour",
  "gf flour",
];

const GLUTEN_FREE_NOODLE_CUES = [
  "rice noodle",
  "rice noodles",
  "glass noodle",
  "glass noodles",
  "soba",
  "gluten-free pasta",
  "gluten free pasta",
  "gf pasta",
];

function linesMatchAnyKeyword(
  lines: string[],
  keywords: string[],
): boolean {
  if (!lines.length) return false;
  return lines.some((item) => {
    const text = item.toLowerCase();
    return keywords.some((kw) =>
      new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(
        text,
      ),
    );
  });
}

/** True when ingredient text suggests meat/fish/seafood. */
export function ingredientsContainMeat(
  ingredients: string[] | undefined,
): boolean {
  return linesMatchAnyKeyword(ingredients ?? [], MEAT_KEYWORDS);
}

export function ingredientsContainDairy(
  ingredients: string[] | undefined,
): boolean {
  return linesMatchAnyKeyword(ingredients ?? [], DAIRY_KEYWORDS);
}

export function ingredientsContainEgg(
  ingredients: string[] | undefined,
): boolean {
  return linesMatchAnyKeyword(ingredients ?? [], EGG_KEYWORDS);
}

export function ingredientsContainNonVeganExtras(
  ingredients: string[] | undefined,
): boolean {
  return linesMatchAnyKeyword(ingredients ?? [], NON_VEGAN_EXTRA_KEYWORDS);
}

/** True when lines likely include gluten-containing ingredients. */
export function ingredientsContainGluten(
  ingredients: string[] | undefined,
): boolean {
  const lines = ingredients ?? [];
  if (!lines.length) return false;

  return lines.some((item) => {
    const text = item.toLowerCase();
    if (GLUTEN_FREE_FLOUR_CUES.some((cue) => text.includes(cue))) return false;
    if (GLUTEN_FREE_NOODLE_CUES.some((cue) => text.includes(cue))) return false;
    if (/\bgluten[- ]?free\b/.test(text) || /\bgf\b/.test(text)) return false;
    return GLUTEN_KEYWORDS.some((kw) =>
      new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(
        text,
      ),
    );
  });
}

/** Flat + grouped ingredient lines used for dietary tag inference. */
export function recipeIngredientLines(
  recipe: Pick<Recipe, "ingredients" | "ingredientGroups">,
): string[] {
  const names = new Set<string>();
  for (const n of recipe.ingredients ?? []) {
    if (n.trim()) names.add(n.trim());
  }
  for (const group of recipe.ingredientGroups ?? []) {
    for (const name of ingredientNamesFromLines(group.items)) {
      names.add(name);
    }
  }
  return [...names];
}

/**
 * Infer dietary tags from ingredients only (stored tags ignored).
 * Independent detectors: vegan recipes also get vegetarian / egg / lactose chips.
 * No tags when there are no ingredient lines yet.
 */
export function resolveRecipeTags(
  recipe: Pick<Recipe, "ingredients" | "ingredientGroups" | "tags">,
): RecipeTag[] {
  const lines = recipeIngredientLines(recipe);
  if (lines.length === 0) return [];

  const hasMeat = ingredientsContainMeat(lines);
  const hasDairy = ingredientsContainDairy(lines);
  const hasEgg = ingredientsContainEgg(lines);
  const hasGluten = ingredientsContainGluten(lines);
  const hasNonVeganExtra = ingredientsContainNonVeganExtras(lines);

  const tags: RecipeTag[] = [];
  if (!hasMeat) tags.push("vegetarian");
  if (!hasMeat && !hasDairy && !hasEgg && !hasNonVeganExtra) tags.push("vegan");
  if (!hasGluten) tags.push("glutenFree");
  if (!hasDairy) tags.push("lactoseFree");
  if (!hasEgg) tags.push("eggFree");
  return tags;
}

export function normalizeNutrition(
  input: RecipeNutrition | undefined | null,
): RecipeNutrition {
  if (!input || typeof input !== "object") return {};
  const out: RecipeNutrition = {};
  const keys = [
    "calories",
    "protein",
    "fat",
    "cholesterol",
    "sodium",
    "carbs",
  ] as const;
  for (const key of keys) {
    const raw = input[key];
    if (typeof raw !== "string") continue;
    const trimmed = raw.trim();
    if (!trimmed || trimmed === "—" || trimmed === "-") continue;
    out[key] = trimmed;
  }
  return out;
}

export function hasNutritionFacts(nutrition: RecipeNutrition | undefined): boolean {
  return nutritionFactRows(nutrition).length > 0;
}

/** Ordered nutrition rows for display (only filled values). */
export function nutritionFactRows(
  nutrition: RecipeNutrition | undefined,
): { key: keyof RecipeNutrition; label: string; value: string }[] {
  const n = nutrition ?? {};
  const order: { key: keyof RecipeNutrition; label: string }[] = [
    { key: "calories", label: "Calories" },
    { key: "fat", label: "Total Fat" },
    { key: "cholesterol", label: "Cholesterol" },
    { key: "sodium", label: "Sodium" },
    { key: "carbs", label: "Carbs" },
    { key: "protein", label: "Protein" },
  ];
  return order
    .filter(({ key }) => {
      const v = n[key];
      return typeof v === "string" && v.trim().length > 0;
    })
    .map(({ key, label }) => ({ key, label, value: n[key]!.trim() }));
}

/** Compact demo recipes for Pasta Paula (public profile “more” testing). */
const PASTA_PAULA_RECIPES: Recipe[] = (
  [
    {
      id: "14",
      name: "Garlic Butter Linguine",
      categories: ["pasta", "dinner"] as RecipeCategory[],
      thumbnailUrl: "/icons/recipes/pasta.png",
      bookmarkCount: 64,
      description: "Quick linguine tossed in garlic butter and parsley.",
      items: [
        { name: "Linguine", amount: "400", unit: "g" },
        { name: "Butter", amount: "60", unit: "g" },
        { name: "Garlic Cloves", amount: "4", unit: "clove" },
        { name: "Parsley", amount: "1", unit: "handful" },
        { name: "Salt", amount: "", unit: "pinch" },
      ],
      steps: [
        "Boil linguine in salted water until al dente.",
        "Melt butter with sliced garlic until fragrant.",
        "Toss pasta with garlic butter and chopped parsley.",
      ],
    },
    {
      id: "15",
      name: "Tomato Basil Penne",
      categories: ["pasta", "lunch"] as RecipeCategory[],
      thumbnailUrl: "/icons/recipes/pasta.png",
      bookmarkCount: 71,
      description: "Penne in a simple tomato-basil sauce.",
      items: [
        { name: "Penne", amount: "400", unit: "g" },
        { name: "Tomato", amount: "400", unit: "g" },
        { name: "Basil", amount: "10", unit: "g" },
        { name: "Olive Oil", amount: "2", unit: "tbsp" },
        { name: "Garlic Cloves", amount: "2", unit: "clove" },
      ],
      steps: [
        "Cook penne until al dente; reserve a splash of pasta water.",
        "Simmer crushed tomatoes with garlic and olive oil.",
        "Toss with pasta, basil, and pasta water to loosen.",
      ],
    },
    {
      id: "16",
      name: "Creamy Mushroom Tagliatelle",
      categories: ["pasta", "dinner"] as RecipeCategory[],
      thumbnailUrl: "/icons/recipes/pasta.png",
      bookmarkCount: 88,
      description: "Tagliatelle in a creamy mushroom sauce.",
      items: [
        { name: "Tagliatelle", amount: "400", unit: "g" },
        { name: "Mushrooms", amount: "300", unit: "g" },
        { name: "Cream", amount: "150", unit: "ml" },
        { name: "Parmesan", amount: "40", unit: "g" },
        { name: "Butter", amount: "2", unit: "tbsp" },
      ],
      steps: [
        "Sauté sliced mushrooms in butter until golden.",
        "Stir in cream and simmer briefly; season.",
        "Toss with cooked tagliatelle and grated parmesan.",
      ],
    },
    {
      id: "17",
      name: "Lemon Ricotta Farfalle",
      categories: ["pasta", "lunch"] as RecipeCategory[],
      thumbnailUrl: "/icons/recipes/pasta.png",
      bookmarkCount: 53,
      description: "Bow-tie pasta with lemony ricotta and black pepper.",
      items: [
        { name: "Farfalle", amount: "400", unit: "g" },
        { name: "Ricotta", amount: "200", unit: "g" },
        { name: "Lemon", amount: "1", unit: "Whole" },
        { name: "Black Pepper", amount: "", unit: "pinch" },
        { name: "Olive Oil", amount: "1", unit: "tbsp" },
      ],
      steps: [
        "Cook farfalle until al dente.",
        "Whisk ricotta with lemon zest, juice, and olive oil.",
        "Fold through pasta and finish with black pepper.",
      ],
    },
    {
      id: "18",
      name: "Spicy Arrabbiata",
      categories: ["pasta", "dinner"] as RecipeCategory[],
      thumbnailUrl: "/icons/recipes/pasta.png",
      bookmarkCount: 77,
      description: "Classic spicy tomato pasta with chili flakes.",
      items: [
        { name: "Spaghetti", amount: "400", unit: "g" },
        { name: "Tomato", amount: "400", unit: "g" },
        { name: "Garlic Cloves", amount: "3", unit: "clove" },
        { name: "Chili Flakes", amount: "1", unit: "tsp" },
        { name: "Olive Oil", amount: "3", unit: "tbsp" },
      ],
      steps: [
        "Sizzle garlic and chili flakes in olive oil.",
        "Add tomatoes and simmer into a thick sauce.",
        "Toss with spaghetti and serve hot.",
      ],
    },
    {
      id: "19",
      name: "Pesto Fusilli",
      categories: ["pasta", "lunch"] as RecipeCategory[],
      thumbnailUrl: "/icons/recipes/pasta.png",
      bookmarkCount: 61,
      description: "Fusilli coated in fresh basil pesto.",
      items: [
        { name: "Fusilli", amount: "400", unit: "g" },
        { name: "Basil", amount: "40", unit: "g" },
        { name: "Pine Nuts", amount: "30", unit: "g" },
        { name: "Parmesan", amount: "40", unit: "g" },
        { name: "Olive Oil", amount: "80", unit: "ml" },
      ],
      steps: [
        "Blend basil, pine nuts, parmesan, and olive oil into pesto.",
        "Cook fusilli until al dente.",
        "Toss with pesto and a splash of pasta water.",
      ],
    },
    {
      id: "20",
      name: "Sausage Ragu Rigatoni",
      categories: ["pasta", "dinner"] as RecipeCategory[],
      thumbnailUrl: "/icons/recipes/pasta.png",
      bookmarkCount: 92,
      description: "Hearty sausage ragu clinging to rigatoni.",
      items: [
        { name: "Rigatoni", amount: "400", unit: "g" },
        { name: "Sausage", amount: "400", unit: "g" },
        { name: "Tomato", amount: "400", unit: "g" },
        { name: "Onion", amount: "1", unit: "Whole" },
        { name: "Olive Oil", amount: "2", unit: "tbsp" },
      ],
      steps: [
        "Brown crumbled sausage with diced onion in olive oil.",
        "Add tomatoes and simmer until thick.",
        "Toss with rigatoni and serve.",
      ],
    },
    {
      id: "21",
      name: "Cacio e Pepe",
      categories: ["pasta", "dinner"] as RecipeCategory[],
      thumbnailUrl: "/icons/recipes/pasta.png",
      bookmarkCount: 105,
      description: "Roman classic: cheese, pepper, and spaghetti.",
      items: [
        { name: "Spaghetti", amount: "400", unit: "g" },
        { name: "Pecorino", amount: "80", unit: "g" },
        { name: "Black Pepper", amount: "2", unit: "tsp" },
        { name: "Salt", amount: "", unit: "pinch" },
      ],
      steps: [
        "Toast black pepper briefly in a warm pan.",
        "Cook spaghetti; reserve starchy pasta water.",
        "Emulsify pecorino and pasta water with pepper; toss pasta in.",
      ],
    },
  ] as const
).map((r) => ({
  id: r.id,
  name: r.name,
  author: "pastapaula",
  categories: [...r.categories],
  thumbnailUrl: r.thumbnailUrl,
  bookmarkCount: r.bookmarkCount,
  description: r.description,
  prepTime: "10 minutes",
  cookTime: "20 minutes",
  totalTime: "30 minutes",
  servings: 4,
  nutrition: {
    fat: "12g",
    carbs: "52g",
    protein: "16g",
    sodium: "480",
  },
  ingredientGroups: [
    {
      title: "Ingredients",
      items: [...r.items],
    },
  ],
  ingredients: r.items.map((i) => i.name),
  instructions: r.steps.map((text, i) => ({
    n: `${i + 1}.0`,
    text,
  })),
}));

/** Shared recipes that appear in Discover/Recipes and can be saved. */
export const CATALOG_RECIPES: Recipe[] = [
  {
    id: "1",
    name: "Ricotta Ravioli",
    author: "courtneyhenry",
    categories: ["pasta", "dinner"],
    thumbnailUrl: "/icons/recipes/pasta.png",
    bookmarkCount: 128,
    description:
      "Homemade ravioli filled with a creamy ricotta and mascarpone mix, finished with fresh basil.",
    prepTime: "120 minutes",
    cookTime: "5 minutes",
    totalTime: "125 minutes",
    servings: 4,
    nutrition: {
      fat: "5.8g",
      carbs: "38g",
      protein: "10g",
      sodium: "615",
    },
    ingredientGroups: [
      {
        title: "For the Pasta Dough",
        items: [
          { name: "Eggs", amount: "3", unit: "large" },
          { name: "Egg Yolk", amount: "1", unit: "large" },
          { name: "Olive Oil", amount: "", unit: "" },
          { name: "Semolina Flour", amount: "", unit: "" },
          { name: "Flour", amount: "300", unit: "g" },
        ],
      },
      {
        title: "Ravioli Cheese Filling",
        items: [
          { name: "Ricotta", amount: "100", unit: "g" },
          { name: "Mascarpone", amount: "100", unit: "g" },
          { name: "Basil", amount: "10", unit: "g" },
          { name: "Parmesan", amount: "30", unit: "g" },
          { name: "Eggs", amount: "1", unit: "" },
          { name: "Salt", amount: "", unit: "pinch" },
          { name: "Black Pepper", amount: "", unit: "pinch" },
        ],
      },
    ],
    ingredients: [
      "Flour",
      "Eggs",
      "Egg Yolk",
      "Ricotta",
      "Mascarpone",
      "Basil",
      "Parmesan",
      "Olive Oil",
      "Semolina Flour",
      "Salt",
      "Black Pepper",
      "Spinach",
      "Nutmeg",
    ],
    instructions: [
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
        imageUrl: "placeholder",
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
        imageUrl: "placeholder",
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
    ],
  },
  {
    id: "2",
    name: "Egg on Toast",
    author: "chefamy",
    categories: ["toasty", "breakfast"],
    thumbnailUrl: "/icons/recipes/toasty.png",
    bookmarkCount: 96,
    description:
      "Crispy buttered toast topped with a soft fried egg and a pinch of cracked pepper.",
    prepTime: "5 minutes",
    cookTime: "5 minutes",
    totalTime: "10 minutes",
    servings: 1,
    nutrition: {
      fat: "12g",
      carbs: "22g",
      protein: "11g",
      sodium: "420",
    },
    ingredientGroups: [
      {
        title: "Ingredients",
        items: [
          { name: "Eggs", amount: "2", unit: "large" },
          { name: "Bread", amount: "2", unit: "slice" },
          { name: "Butter", amount: "1", unit: "tbsp" },
          { name: "Olive Oil", amount: "1", unit: "tsp" },
          { name: "Salt", amount: "", unit: "pinch" },
          { name: "Black Pepper", amount: "", unit: "pinch" },
        ],
      },
    ],
    ingredients: ["Eggs", "Olive Oil", "Salt", "Black Pepper", "Butter"],
    instructions: [
      {
        n: "1.0",
        text: "Toast the bread until golden. Spread with butter while warm.",
      },
      {
        n: "1.1",
        text: "Heat olive oil in a non-stick pan over medium heat.",
      },
      {
        n: "1.2",
        text: "Crack in the eggs and cook to your preferred doneness. Season with salt and pepper.",
      },
      {
        n: "1.3",
        text: "Slide the eggs onto the toast and serve immediately.",
      },
    ],
  },
  {
    id: "3",
    name: "Blueberry Pancakes",
    author: "bakerben",
    categories: ["breakfast", "sweets"],
    thumbnailUrl: "/icons/recipes/breakfast.png",
    bookmarkCount: 112,
    description:
      "Fluffy buttermilk-style pancakes studded with juicy blueberries and a hint of lemon.",
    prepTime: "10 minutes",
    cookTime: "15 minutes",
    totalTime: "25 minutes",
    servings: 4,
    nutrition: {
      fat: "8g",
      carbs: "48g",
      protein: "9g",
      sodium: "380",
    },
    ingredientGroups: [
      {
        title: "Batter",
        items: [
          { name: "Flour", amount: "200", unit: "g" },
          { name: "Eggs", amount: "2", unit: "large" },
          { name: "Milk", amount: "250", unit: "ml" },
          { name: "Butter", amount: "2", unit: "tbsp" },
          { name: "Sugar", amount: "2", unit: "tbsp" },
          { name: "Lemon Zest", amount: "1", unit: "tsp" },
          { name: "Blueberries", amount: "150", unit: "g" },
        ],
      },
    ],
    ingredients: [
      "Flour",
      "Eggs",
      "Milk",
      "Butter",
      "Sugar",
      "Blueberries",
      "Lemon",
    ],
    instructions: [
      {
        n: "1.0",
        text: "Whisk flour, sugar, and lemon zest in a bowl.",
      },
      {
        n: "1.1",
        text: "Add eggs, milk, and melted butter. Mix until just combined — small lumps are fine.",
      },
      {
        n: "1.2",
        text: "Fold in most of the blueberries, reserving a handful for topping.",
      },
      {
        n: "2.0",
        text: "Cook scoops of batter on a lightly buttered pan until bubbles form, then flip.",
      },
      {
        n: "2.1",
        text: "Serve stacked with remaining blueberries and a drizzle of maple syrup if you like.",
      },
    ],
  },
  {
    id: "4",
    name: "Pasta Salad",
    author: "courtneyhenry",
    categories: ["lunch", "pasta"],
    thumbnailUrl: "/icons/recipes/lunch.png",
    bookmarkCount: 74,
    description:
      "A bright lemon-garlic pasta salad with tomatoes and fresh parsley — perfect cold or room temp.",
    prepTime: "15 minutes",
    cookTime: "12 minutes",
    totalTime: "27 minutes",
    servings: 4,
    nutrition: {
      fat: "14g",
      carbs: "52g",
      protein: "12g",
      sodium: "510",
    },
    ingredientGroups: [
      {
        title: "Salad",
        items: [
          { name: "Pasta", amount: "300", unit: "g" },
          { name: "Cherry Tomatoes", amount: "200", unit: "g" },
          { name: "Garlic Cloves", amount: "2", unit: "clove" },
          { name: "Parsley", amount: "1", unit: "handful" },
          { name: "Olive Oil", amount: "3", unit: "tbsp" },
          { name: "Lemon", amount: "1", unit: "Whole" },
          { name: "Salt", amount: "", unit: "pinch" },
          { name: "Black Pepper", amount: "", unit: "pinch" },
        ],
      },
    ],
    ingredients: [
      "Pasta",
      "Olive Oil",
      "Lemon",
      "Garlic Cloves",
      "Parsley",
      "Salt",
      "Black Pepper",
      "Tomatoes",
    ],
    instructions: [
      {
        n: "1.0",
        text: "Cook pasta in salted water until al dente. Drain and rinse briefly under cold water.",
      },
      {
        n: "1.1",
        text: "Whisk olive oil, lemon juice, garlic, salt, and pepper into a dressing.",
      },
      {
        n: "1.2",
        text: "Toss pasta with tomatoes, parsley, and dressing. Chill or serve at room temperature.",
      },
    ],
  },
  {
    id: "5",
    name: "Pork Roast",
    author: "grillguy",
    categories: ["dinner"],
    thumbnailUrl: "/icons/recipes/dinner.png",
    bookmarkCount: 88,
    description:
      "Herb-rubbed pork roast with rosemary and thyme, roasted until juicy with a crisp exterior.",
    prepTime: "20 minutes",
    cookTime: "90 minutes",
    totalTime: "110 minutes",
    servings: 6,
    nutrition: {
      fat: "18g",
      carbs: "2g",
      protein: "42g",
      sodium: "620",
    },
    ingredientGroups: [
      {
        title: "Rub & roast",
        items: [
          { name: "Pork", amount: "1.5", unit: "kg" },
          { name: "Garlic Cloves", amount: "4", unit: "clove" },
          { name: "Dried Rosemary", amount: "2", unit: "tbsp" },
          { name: "Dried Thyme", amount: "1", unit: "tbsp" },
          { name: "Olive Oil", amount: "3", unit: "tbsp" },
          { name: "Salt", amount: "", unit: "pinch" },
          { name: "Black Pepper", amount: "", unit: "pinch" },
        ],
      },
    ],
    ingredients: [
      "Pork",
      "Garlic Cloves",
      "Dried Rosemary",
      "Dried Thyme",
      "Olive Oil",
      "Salt",
      "Black Pepper",
    ],
    instructions: [
      {
        n: "1.0",
        text: "Preheat oven to 180°C (350°F). Pat the pork dry.",
      },
      {
        n: "1.1",
        text: "Mix garlic, rosemary, thyme, olive oil, salt, and pepper into a paste. Rub all over the pork.",
      },
      {
        n: "2.0",
        text: "Roast until the internal temperature reaches 63°C (145°F), about 90 minutes depending on size.",
      },
      {
        n: "2.1",
        text: "Rest 15 minutes before slicing. Serve with pan juices.",
      },
    ],
  },
  {
    id: "6",
    name: "Chocolate Cookies",
    author: "sweetsue",
    categories: ["sweets"],
    thumbnailUrl: "/icons/recipes/sweets.png",
    bookmarkCount: 141,
    description:
      "Chewy chocolate chip cookies with browned butter notes and melty puddles of chocolate.",
    prepTime: "15 minutes",
    cookTime: "12 minutes",
    totalTime: "27 minutes",
    servings: 24,
    nutrition: {
      fat: "9g",
      carbs: "28g",
      protein: "3g",
      sodium: "160",
    },
    ingredientGroups: [
      {
        title: "Dough",
        items: [
          { name: "Flour", amount: "250", unit: "g" },
          { name: "Butter", amount: "170", unit: "g" },
          { name: "Sugar", amount: "150", unit: "g" },
          { name: "Eggs", amount: "2", unit: "large" },
          { name: "Chocolate", amount: "200", unit: "g" },
          { name: "Vanilla Extract", amount: "1", unit: "tsp" },
          { name: "Salt", amount: "1/2", unit: "tsp" },
        ],
      },
    ],
    ingredients: [
      "Flour",
      "Butter",
      "Sugar",
      "Eggs",
      "Chocolate",
      "Vanilla Extract",
      "Salt",
    ],
    instructions: [
      {
        n: "1.0",
        text: "Cream butter and sugar until light. Beat in eggs and vanilla.",
      },
      {
        n: "1.1",
        text: "Fold in flour and salt, then stir in the chocolate.",
      },
      {
        n: "2.0",
        text: "Scoop onto a lined tray. Bake at 180°C (350°F) for 10–12 minutes until edges are set.",
      },
      {
        n: "2.1",
        text: "Cool on the tray for 5 minutes, then transfer to a rack.",
      },
    ],
  },
  {
    id: "7",
    name: "Traditional Ravioli",
    author: "courtneyhenry",
    categories: ["pasta"],
    thumbnailUrl: "/icons/recipes/pasta.png",
    bookmarkCount: 63,
    description:
      "Classic ricotta ravioli with a simple dough and fresh basil — a weeknight pasta classic.",
    prepTime: "60 minutes",
    cookTime: "5 minutes",
    totalTime: "65 minutes",
    servings: 4,
    nutrition: {
      fat: "6g",
      carbs: "36g",
      protein: "11g",
      sodium: "540",
    },
    ingredientGroups: [
      {
        title: "Dough & filling",
        items: [
          { name: "Flour", amount: "300", unit: "g" },
          { name: "Eggs", amount: "3", unit: "large" },
          { name: "Ricotta", amount: "150", unit: "g" },
          { name: "Olive Oil", amount: "2", unit: "tbsp" },
          { name: "Salt", amount: "", unit: "pinch" },
          { name: "Basil", amount: "1", unit: "handful" },
        ],
      },
    ],
    ingredients: ["Flour", "Eggs", "Ricotta", "Olive Oil", "Salt", "Basil"],
    instructions: [
      {
        n: "1.0",
        text: "Make a simple egg pasta dough and rest 30 minutes.",
      },
      {
        n: "1.1",
        text: "Mix ricotta with basil, salt, and a drizzle of olive oil for the filling.",
      },
      {
        n: "2.0",
        text: "Roll dough thin, fill, seal, and cut ravioli.",
      },
      {
        n: "2.1",
        text: "Boil in salted water until they float, then serve with butter or sauce.",
      },
    ],
  },
  {
    id: "8",
    name: "Egg & Tomatoes on Toast",
    author: "chefamy",
    categories: ["toasty"],
    thumbnailUrl: "/icons/recipes/toasty.png",
    bookmarkCount: 51,
    description:
      "Garlic-sautéed tomatoes and soft eggs piled on toast with fresh basil.",
    prepTime: "8 minutes",
    cookTime: "10 minutes",
    totalTime: "18 minutes",
    servings: 2,
    nutrition: {
      fat: "14g",
      carbs: "24g",
      protein: "13g",
      sodium: "480",
    },
    ingredientGroups: [
      {
        title: "Ingredients",
        items: [
          { name: "Eggs", amount: "4", unit: "large" },
          { name: "Tomatoes", amount: "2", unit: "" },
          { name: "Garlic Cloves", amount: "2", unit: "clove" },
          { name: "Olive Oil", amount: "2", unit: "tbsp" },
          { name: "Basil", amount: "", unit: "" },
          { name: "Salt", amount: "", unit: "pinch" },
          { name: "Black Pepper", amount: "", unit: "pinch" },
          { name: "Bread", amount: "4", unit: "slice" },
        ],
      },
    ],
    ingredients: [
      "Eggs",
      "Tomatoes",
      "Olive Oil",
      "Garlic Cloves",
      "Salt",
      "Black Pepper",
      "Basil",
    ],
    instructions: [
      {
        n: "1.0",
        text: "Sauté garlic in olive oil until fragrant, then add tomatoes and cook until saucy.",
      },
      {
        n: "1.1",
        text: "Fry or scramble the eggs to your liking. Season well.",
      },
      {
        n: "1.2",
        text: "Spoon tomatoes over toast, top with eggs and torn basil.",
      },
    ],
  },
  {
    id: "9",
    name: "Popcorn",
    author: "snacksam",
    categories: ["snacks"],
    thumbnailUrl: "/icons/recipes/snacks.png",
    bookmarkCount: 39,
    description:
      "Stovetop popcorn with butter and salt — ready in minutes for movie night.",
    prepTime: "2 minutes",
    cookTime: "5 minutes",
    totalTime: "7 minutes",
    servings: 4,
    nutrition: {
      fat: "7g",
      carbs: "18g",
      protein: "3g",
      sodium: "290",
    },
    ingredientGroups: [
      {
        title: "Ingredients",
        items: [
          { name: "Popcorn Kernels", amount: "80", unit: "g" },
          { name: "Olive Oil", amount: "2", unit: "tbsp" },
          { name: "Butter", amount: "2", unit: "tbsp" },
          { name: "Salt", amount: "", unit: "pinch" },
        ],
      },
    ],
    ingredients: ["Olive Oil", "Salt", "Butter"],
    instructions: [
      {
        n: "1.0",
        text: "Heat olive oil in a large pot with a lid. Add a few kernels; when they pop, add the rest.",
      },
      {
        n: "1.1",
        text: "Shake the pot as kernels pop. Remove from heat when popping slows.",
      },
      {
        n: "1.2",
        text: "Toss with melted butter and salt. Serve warm.",
      },
    ],
  },
  {
    id: "10",
    name: "Roast Pork",
    author: "grillguy",
    categories: ["dinner"],
    thumbnailUrl: "/icons/recipes/dinner.png",
    bookmarkCount: 57,
    description:
      "Lemon-rosemary roast pork with garlic — a simpler cousin of the classic pork roast.",
    prepTime: "15 minutes",
    cookTime: "75 minutes",
    totalTime: "90 minutes",
    servings: 6,
    nutrition: {
      fat: "16g",
      carbs: "3g",
      protein: "40g",
      sodium: "580",
    },
    ingredientGroups: [
      {
        title: "Rub & roast",
        items: [
          { name: "Pork", amount: "1.2", unit: "kg" },
          { name: "Garlic Cloves", amount: "4", unit: "clove" },
          { name: "Dried Rosemary", amount: "2", unit: "tbsp" },
          { name: "Olive Oil", amount: "3", unit: "tbsp" },
          { name: "Lemon", amount: "1", unit: "Whole" },
          { name: "Salt", amount: "", unit: "pinch" },
          { name: "Black Pepper", amount: "", unit: "pinch" },
        ],
      },
    ],
    ingredients: [
      "Pork",
      "Garlic Cloves",
      "Dried Rosemary",
      "Olive Oil",
      "Salt",
      "Black Pepper",
      "Lemon",
    ],
    instructions: [
      {
        n: "1.0",
        text: "Mix garlic, rosemary, olive oil, lemon juice, salt, and pepper. Rub over the pork.",
      },
      {
        n: "2.0",
        text: "Roast at 180°C (350°F) until cooked through. Rest before carving.",
      },
    ],
  },
  {
    id: "11",
    name: "Salmon with Roast Potatoes",
    author: "fishfan",
    categories: ["dinner"],
    thumbnailUrl: "/icons/recipes/dinner.png",
    bookmarkCount: 82,
    description:
      "Crispy roast potatoes and dill-lemon salmon — an easy sheet-pan dinner.",
    prepTime: "15 minutes",
    cookTime: "35 minutes",
    totalTime: "50 minutes",
    servings: 4,
    nutrition: {
      fat: "22g",
      carbs: "32g",
      protein: "34g",
      sodium: "490",
    },
    ingredientGroups: [
      {
        title: "Sheet pan",
        items: [
          { name: "Salmon", amount: "4", unit: "fillet" },
          { name: "Potatoes", amount: "800", unit: "g" },
          { name: "Olive Oil", amount: "4", unit: "tbsp" },
          { name: "Lemon", amount: "1", unit: "Whole" },
          { name: "Dill", amount: "", unit: "" },
          { name: "Garlic Cloves", amount: "3", unit: "clove" },
          { name: "Salt", amount: "", unit: "pinch" },
          { name: "Black Pepper", amount: "", unit: "pinch" },
        ],
      },
    ],
    ingredients: [
      "Salmon",
      "Potatoes",
      "Olive Oil",
      "Lemon",
      "Dill",
      "Salt",
      "Black Pepper",
      "Garlic Cloves",
    ],
    instructions: [
      {
        n: "1.0",
        text: "Toss potatoes with oil, garlic, salt, and pepper. Roast at 200°C (400°F) for 20 minutes.",
      },
      {
        n: "1.1",
        text: "Add salmon, lemon slices, and dill. Roast another 12–15 minutes until salmon flakes.",
      },
      {
        n: "1.2",
        text: "Serve salmon over the potatoes with extra lemon.",
      },
    ],
  },
  {
    id: "12",
    name: "Steak and Potato Jacket",
    author: "grillguy",
    categories: ["savoury"],
    thumbnailUrl: "/icons/recipes/savoury.png",
    bookmarkCount: 69,
    description:
      "Seared steak sliced over a fluffy jacket potato with garlic butter.",
    prepTime: "10 minutes",
    cookTime: "50 minutes",
    totalTime: "60 minutes",
    servings: 2,
    nutrition: {
      fat: "28g",
      carbs: "40g",
      protein: "38g",
      sodium: "540",
    },
    ingredientGroups: [
      {
        title: "Ingredients",
        items: [
          { name: "Steak", amount: "2", unit: "piece" },
          { name: "Potatoes", amount: "2", unit: "large" },
          { name: "Olive Oil", amount: "2", unit: "tbsp" },
          { name: "Butter", amount: "2", unit: "tbsp" },
          { name: "Garlic Cloves", amount: "2", unit: "clove" },
          { name: "Salt", amount: "", unit: "pinch" },
          { name: "Black Pepper", amount: "", unit: "pinch" },
        ],
      },
    ],
    ingredients: [
      "Steak",
      "Potatoes",
      "Olive Oil",
      "Salt",
      "Black Pepper",
      "Garlic Cloves",
      "Butter",
    ],
    instructions: [
      {
        n: "1.0",
        text: "Bake potatoes at 200°C (400°F) until soft inside, about 45 minutes.",
      },
      {
        n: "1.1",
        text: "Season steaks and sear in hot oil to preferred doneness. Rest 5 minutes.",
      },
      {
        n: "1.2",
        text: "Split potatoes, add garlic butter, and top with sliced steak.",
      },
    ],
  },
  {
    id: "13",
    name: "Raspberry Cheesecake",
    author: "sweetsue",
    categories: ["sweets", "fruity"],
    thumbnailUrl: "/icons/recipes/fruity.png",
    bookmarkCount: 104,
    description:
      "No-fuss raspberry cheesecake with a buttery base and tangy yogurt cream.",
    prepTime: "25 minutes",
    cookTime: "0 minutes",
    totalTime: "25 minutes",
    servings: 8,
    nutrition: {
      fat: "16g",
      carbs: "34g",
      protein: "6g",
      sodium: "210",
    },
    ingredientGroups: [
      {
        title: "Base & filling",
        items: [
          { name: "Digestive Biscuits", amount: "200", unit: "g" },
          { name: "Butter", amount: "80", unit: "g" },
          { name: "Yogurt", amount: "300", unit: "g" },
          { name: "Sugar", amount: "100", unit: "g" },
          { name: "Vanilla Extract", amount: "1", unit: "tsp" },
          { name: "Lemon Zest", amount: "1", unit: "" },
          { name: "Raspberries", amount: "200", unit: "g" },
        ],
      },
    ],
    ingredients: [
      "Raspberries",
      "Sugar",
      "Butter",
      "Vanilla Extract",
      "Lemon",
      "Yogurt",
    ],
    instructions: [
      {
        n: "1.0",
        text: "Mix crushed biscuits with melted butter. Press into a tin and chill.",
      },
      {
        n: "1.1",
        text: "Whip yogurt with sugar, vanilla, and lemon zest. Spread over the base.",
      },
      {
        n: "1.2",
        text: "Top with raspberries and chill at least 2 hours before slicing.",
      },
    ],
  },
  ...PASTA_PAULA_RECIPES,
];

export function getCatalogRecipe(id: string): Recipe | undefined {
  return CATALOG_RECIPES.find((r) => r.id === id);
}

/** Stable demo created-at for catalog recipes that omit `createdAt`. */
export function catalogRecipeCreatedAt(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 33 + id.charCodeAt(i)) >>> 0;
  }
  return Date.UTC(2024, 0, 1) + (hash % 400) * 86_400_000;
}

export function formatRecipeCreatedDate(ms: number): string {
  return new Date(ms).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function resolveRecipeCreatedAt(
  recipe: Pick<Recipe, "id" | "createdAt">,
  storedCreatedAt?: number,
): number {
  if (typeof storedCreatedAt === "number") return storedCreatedAt;
  if (typeof recipe.createdAt === "number") return recipe.createdAt;
  return catalogRecipeCreatedAt(recipe.id);
}

export function emptyRecipeDraft(
  author: string,
  partial?: Partial<Recipe>,
): Omit<Recipe, "id" | "bookmarkCount"> & {
  id?: string;
  bookmarkCount?: number;
} {
  return {
    name: "",
    author,
    categories: ["dinner"],
    description: "",
    prepTime: "",
    cookTime: "",
    totalTime: "",
    servings: 4,
    nutrition: emptyNutrition(),
    ingredientGroups: [{ title: "Ingredients", items: [] }],
    ingredients: [],
    instructions: [{ n: "1.0", text: "" }],
    ...partial,
  };
}
