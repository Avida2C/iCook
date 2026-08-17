import {
  QUICK_TO_MAKE_MAX_MINUTES,
  isRecipeCategory,
  recipeHasCategory,
  recipeIngredientLines,
  recipeTotalMinutes,
  resolveRecipeTags,
  type Recipe,
  type RecipeCategory,
  type RecipeTag,
} from "@/components/recipes/recipesData";

export type RecipeSearchQuery = {
  tags: RecipeTag[];
  categories: RecipeCategory[];
  /** Cap on total time in minutes (e.g. “quick”). Not a browse facet. */
  maxTotalMinutes: number | null;
  /** Remaining words after dietary phrases and meal types are stripped. */
  textTokens: string[];
};

const TAG_PHRASES: { tag: RecipeTag; pattern: RegExp }[] = [
  { tag: "glutenFree", pattern: /\bgluten[\s-]*free\b|\bgf\b/gi },
  { tag: "lactoseFree", pattern: /\blactose[\s-]*free\b|\bdairy[\s-]*free\b/gi },
  { tag: "eggFree", pattern: /\begg[\s-]*free\b/gi },
  { tag: "vegetarian", pattern: /\bvegetarian\b|\bveggie\b/gi },
  { tag: "vegan", pattern: /\bvegan\b/gi },
];

const CATEGORY_PHRASES: { category: RecipeCategory; pattern: RegExp }[] = [
  { category: "breakfast", pattern: /\bbreakfasts?\b/gi },
  { category: "lunch", pattern: /\blunches\b|\blunch\b/gi },
  { category: "dinner", pattern: /\bdinners?\b/gi },
  { category: "snacks", pattern: /\bsnacks?\b/gi },
  { category: "sweets", pattern: /\bsweets?\b|\bdesserts?\b/gi },
  { category: "fruity", pattern: /\bfruity\b/gi },
  { category: "toasty", pattern: /\btoasty\b/gi },
  { category: "savoury", pattern: /\bsavou?ry\b/gi },
  { category: "pasta", pattern: /\bpasta\b/gi },
];

/** Search-only time language — not a category chip or recipes-page facet. */
const QUICK_TIME_PHRASE = /\bquick(?:ly)?\b|\bfast\b/gi;

function uniquePreserve<T>(items: T[]): T[] {
  const seen = new Set<T>();
  const out: T[] = [];
  for (const item of items) {
    if (seen.has(item)) continue;
    seen.add(item);
    out.push(item);
  }
  return out;
}

function extractPhrases<T>(
  query: string,
  phrases: { value: T; pattern: RegExp }[],
): { remaining: string; values: T[] } {
  let remaining = query;
  const values: T[] = [];
  for (const { value, pattern } of phrases) {
    const next = remaining.replace(pattern, " ");
    if (next !== remaining) values.push(value);
    remaining = next;
  }
  return { remaining, values: uniquePreserve(values) };
}

/** Parse a free-text search into dietary tags, meal categories, and leftover terms. */
export function parseRecipeSearchQuery(raw: string): RecipeSearchQuery {
  const empty: RecipeSearchQuery = {
    tags: [],
    categories: [],
    maxTotalMinutes: null,
    textTokens: [],
  };
  const query = raw.trim().toLowerCase();
  if (!query) return empty;

  const tags = extractPhrases(
    query,
    TAG_PHRASES.map(({ tag, pattern }) => ({ value: tag, pattern })),
  );
  const categories = extractPhrases(
    tags.remaining,
    CATEGORY_PHRASES.map(({ category, pattern }) => ({
      value: category,
      pattern,
    })),
  );

  let remaining = categories.remaining;
  let maxTotalMinutes: number | null = null;
  const withoutQuick = remaining.replace(QUICK_TIME_PHRASE, " ");
  if (withoutQuick !== remaining) {
    maxTotalMinutes = QUICK_TO_MAKE_MAX_MINUTES;
    remaining = withoutQuick;
  }

  const textTokens = remaining
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1 && !isRecipeCategory(token));

  return {
    tags: tags.values,
    categories: categories.values,
    maxTotalMinutes,
    textTokens: uniquePreserve(textTokens),
  };
}

function recipeSearchHaystack(
  recipe: Pick<
    Recipe,
    "name" | "description" | "ingredients" | "ingredientGroups" | "author"
  >,
): string {
  const parts = [
    recipe.name,
    recipe.description,
    recipe.author,
    ...recipeIngredientLines(recipe),
  ];
  return parts.join(" ").toLowerCase();
}

export function recipeMatchesSearch(
  recipe: Pick<
    Recipe,
    | "name"
    | "description"
    | "author"
    | "categories"
    | "ingredients"
    | "ingredientGroups"
    | "tags"
    | "totalTime"
  >,
  parsed: RecipeSearchQuery,
): boolean {
  if (
    parsed.tags.length === 0 &&
    parsed.categories.length === 0 &&
    parsed.maxTotalMinutes == null &&
    parsed.textTokens.length === 0
  ) {
    return false;
  }

  if (parsed.tags.length > 0) {
    const tags = resolveRecipeTags(recipe);
    if (!parsed.tags.every((tag) => tags.includes(tag))) return false;
  }

  if (parsed.categories.length > 0) {
    if (!parsed.categories.every((cat) => recipeHasCategory(recipe, cat))) {
      return false;
    }
  }

  if (parsed.maxTotalMinutes != null) {
    const minutes = recipeTotalMinutes(recipe);
    if (minutes == null || minutes > parsed.maxTotalMinutes) return false;
  }

  if (parsed.textTokens.length > 0) {
    const haystack = recipeSearchHaystack(recipe);
    if (!parsed.textTokens.every((token) => haystack.includes(token))) {
      return false;
    }
  }

  return true;
}

export function searchRecipes<T extends Recipe>(
  recipes: T[],
  rawQuery: string,
): T[] {
  const parsed = parseRecipeSearchQuery(rawQuery);
  if (
    parsed.tags.length === 0 &&
    parsed.categories.length === 0 &&
    parsed.maxTotalMinutes == null &&
    parsed.textTokens.length === 0
  ) {
    return [];
  }
  const matches = recipes.filter((recipe) => recipeMatchesSearch(recipe, parsed));
  if (parsed.maxTotalMinutes == null) return matches;

  return [...matches].sort((a, b) => {
    const aMin = recipeTotalMinutes(a);
    const bMin = recipeTotalMinutes(b);
    if (aMin == null && bMin == null) return a.name.localeCompare(b.name);
    if (aMin == null) return 1;
    if (bMin == null) return -1;
    if (aMin !== bMin) return aMin - bMin;
    return a.name.localeCompare(b.name);
  });
}
