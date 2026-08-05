/** Normalize ingredient / pantry names for fuzzy matching. */
export function normalizeIngredientName(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** True when a pantry item covers a recipe ingredient (or vice versa). */
export function ingredientsMatch(pantryName: string, recipeIngredient: string): boolean {
  const a = normalizeIngredientName(pantryName);
  const b = normalizeIngredientName(recipeIngredient);
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;

  // Token overlap for phrases like "garlic cloves" ↔ "garlic"
  const aTokens = a.split(" ").filter((t) => t.length > 2);
  const bTokens = b.split(" ").filter((t) => t.length > 2);
  if (aTokens.length === 0 || bTokens.length === 0) return false;
  return aTokens.some((t) => bTokens.includes(t));
}

export type PantryMatch = {
  matched: string[];
  matchCount: number;
  totalIngredients: number;
  /** 0–1 share of recipe ingredients covered by the pantry. */
  coverage: number;
};

export function matchRecipeToPantry(
  recipeIngredients: string[],
  pantryNames: string[],
): PantryMatch {
  const pantry = pantryNames.map((n) => n.trim()).filter(Boolean);
  const ingredients = recipeIngredients.map((n) => n.trim()).filter(Boolean);
  const matched: string[] = [];

  for (const ingredient of ingredients) {
    const hit = pantry.find((p) => ingredientsMatch(p, ingredient));
    if (hit && !matched.some((m) => m.toLowerCase() === hit.toLowerCase())) {
      matched.push(hit);
    }
  }

  const totalIngredients = ingredients.length;
  return {
    matched,
    matchCount: matched.length,
    totalIngredients,
    coverage: totalIngredients ? matched.length / totalIngredients : 0,
  };
}

export type RankedPantryRecipe<T extends { ingredients: string[] }> = T & {
  pantryMatch: PantryMatch;
};

/** Recipes that use at least one pantry item, best coverage first. */
export function rankRecipesByPantry<T extends { ingredients: string[] }>(
  recipes: T[],
  pantryNames: string[],
): RankedPantryRecipe<T>[] {
  if (pantryNames.length === 0) return [];

  return recipes
    .map((recipe) => ({
      ...recipe,
      pantryMatch: matchRecipeToPantry(recipe.ingredients, pantryNames),
    }))
    .filter((r) => r.pantryMatch.matchCount > 0)
    .sort((a, b) => {
      const cover = b.pantryMatch.coverage - a.pantryMatch.coverage;
      if (cover !== 0) return cover;
      return b.pantryMatch.matchCount - a.pantryMatch.matchCount;
    });
}
