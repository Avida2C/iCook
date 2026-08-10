/** Shared structured ingredient line (pantry + recipes). */
export type IngredientLine = {
  name: string;
  amount: string;
  unit: string;
};

export const COMMON_UNITS = [
  "",
  "g",
  "kg",
  "ml",
  "L",
  "tsp",
  "tbsp",
  "cup",
  "Whole",
  "pinch",
  "clove",
  "slice",
  "piece",
  "handful",
  "large",
  "fillet",
] as const;

export type IngredientUnit = (typeof COMMON_UNITS)[number];

/**
 * Canonical ingredient names users can select from (pantry + recipes).
 * Keep sorted A–Z for search UX.
 */
export const INGREDIENT_CATALOG = [
  "Almonds",
  "Basil",
  "Black Pepper",
  "Blueberries",
  "Boneless Chicken",
  "Bread",
  "Butter",
  "Carrots",
  "Cherry Tomatoes",
  "Chocolate",
  "Cinnamon",
  "Digestive Biscuits",
  "Dill",
  "Dried Rosemary",
  "Dried Thyme",  "Dried Oregano",
  "Eggs",
  "Egg Yolk",
  "Flour",
  "Garlic Cloves",
  "Grated Parmesan Cheese",
  "Honey",
  "Heavy Cream",
  "Sour Cream",
  "Iceberg Lettuce",
  "Italian seasoning",
  "Skinless Chicken Breast","Boneless Skinless Chicken Thighs",
  "Chicken Breast","Boneless Chicken Thighs",
  "Jalapeños",
  "Kale",
  "Lemon",
  "Lemon Zest",
  "Mascarpone",
  "Lemon Wedge", "Lemon Juice",
  "Low-sodium Chicken Broth",
  "Chicken Broth",
  "Milk",
  "Nutmeg",
  "Olive Oil",
  "Parmesan",
  "Parsley",
  "Pasta",
  "Popcorn Kernels",
  "Pork",
  "Potatoes",
  "Quinoa",
  "Raspberries",
  "Ricotta",
  "Rosemary",
  "Salmon",
  "Salt",
  "Semolina Flour",
  "Spinach",
  "Steak",
  "Sugar",
  "Thyme",
  "Tomatoes",
  "Ugli Fruit",
  "Unsalted Butter",
  "Vanilla Extract",
  "Walnuts","Garlic Powder",
  "Xanthan Gum",
  "Yogurt",
  "Zucchini",
  "Smoked Paprika",
  "Sweet Paprika","Hot Paprika"
] as const;

/** @deprecated Prefer INGREDIENT_CATALOG — kept for existing imports. */
export const COMMON_INGREDIENTS = INGREDIENT_CATALOG;

export const DEFAULT_PANTRY: IngredientLine[] = [
  { name: "Lemon", amount: "5", unit: "Whole" },
  { name: "Garlic Cloves", amount: "2", unit: "Whole" },
  { name: "Olive Oil", amount: "2", unit: "L" },
  { name: "Dried Thyme", amount: "100", unit: "g" },
  { name: "Dried Rosemary", amount: "100", unit: "g" },
  { name: "Salt", amount: "1/4", unit: "tsp" },
  { name: "Black Pepper", amount: "1/4", unit: "tsp" },
];

const CATALOG_BY_LOWER = new Map(
  INGREDIENT_CATALOG.map((name) => [name.toLowerCase(), name] as const),
);

export function isCatalogIngredient(name: string): boolean {
  return CATALOG_BY_LOWER.has(name.trim().toLowerCase());
}

/** Resolve a free-text / fuzzy name to a catalog entry, or null. */
export function resolveCatalogName(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const exact = CATALOG_BY_LOWER.get(trimmed.toLowerCase());
  if (exact) return exact;

  const normalized = trimmed
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Prefer longest catalog name contained in the text (or vice versa).
  let best: string | null = null;
  let bestLen = 0;
  for (const name of INGREDIENT_CATALOG) {
    const n = name.toLowerCase();
    if (normalized === n) return name;
    if (normalized.includes(n) || n.includes(normalized)) {
      if (n.length > bestLen) {
        best = name;
        bestLen = n.length;
      }
    }
  }
  return best;
}

export function formatIngredientLine(line: IngredientLine): string {
  const name = line.name.trim();
  const amount = line.amount.trim();
  const unit = line.unit.trim();
  if (!name) return "";
  if (!amount && !unit) return name;
  if (amount && unit) return `${amount} ${unit} ${name}`;
  if (amount) return `${amount} ${name}`;
  return `${unit} ${name}`;
}

export function ingredientNamesFromLines(
  lines: IngredientLine[] | undefined,
): string[] {
  const names = new Set<string>();
  for (const line of lines ?? []) {
    const name = line.name.trim();
    if (name) names.add(name);
  }
  return [...names];
}

const UNIT_ALIASES: Record<string, string> = {
  g: "g",
  gram: "g",
  grams: "g",
  kg: "kg",
  ml: "ml",
  l: "L",
  liter: "L",
  litre: "L",
  tsp: "tsp",
  teaspoon: "tsp",
  teaspoons: "tsp",
  tbsp: "tbsp",
  tablespoon: "tbsp",
  tablespoons: "tbsp",
  cup: "cup",
  cups: "cup",
  whole: "Whole",
  pinch: "pinch",
  clove: "clove",
  cloves: "clove",
  slice: "slice",
  slices: "slice",
  piece: "piece",
  pieces: "piece",
  handful: "handful",
  large: "large",
  fillet: "fillet",
  fillets: "fillet",
};

function normalizeUnitToken(raw: string): string {
  const key = raw.trim().toLowerCase();
  return UNIT_ALIASES[key] ?? raw.trim();
}

/**
 * Best-effort parse of legacy free-text like "300g Flour" or "2 tbsp olive oil".
 * Maps the name onto the catalog when possible.
 */
export function parseLegacyIngredientLine(
  raw: string | IngredientLine | null | undefined,
): IngredientLine | null {
  if (raw == null) return null;
  if (typeof raw === "object") {
    const name =
      resolveCatalogName(String(raw.name ?? "")) ?? String(raw.name ?? "").trim();
    if (!name || !isCatalogIngredient(name)) return null;
    return {
      name,
      amount: String(raw.amount ?? "").trim(),
      unit: String(raw.unit ?? "").trim(),
    };
  }

  const text = raw.trim();
  if (!text || text === "—") return null;

  // "300g Flour" / "250ml Milk" / "1.5kg Pork"
  const glued = text.match(
    /^(\d+(?:\/\d+)?(?:\.\d+)?)\s*(g|kg|ml|l|tsp|tbsp|cup|cups)\b\s*(.+)$/i,
  );
  if (glued) {
    const amount = glued[1];
    const unit = normalizeUnitToken(glued[2]);
    const rest = glued[3]
      .replace(/\(.*?\)/g, "")
      .replace(/,.*$/, "")
      .replace(/\s+to taste$/i, "")
      .trim();
    const name = resolveCatalogName(rest);
    if (!name) return null;
    return { name, amount, unit };
  }

  // "2 tbsp olive oil" / "1 tsp lemon zest" / "4 Salmon fillets"
  const spaced = text.match(
    /^(?:juice of\s+)?(\d+(?:\/\d+)?(?:\.\d+)?)\s+(large\s+)?(g|kg|ml|l|tsp|tbsp|cup|cups|tablespoons?|teaspoons?|slices?|cloves?|fillets?|handful|whole)?\s*(.+)$/i,
  );
  if (spaced) {
    const amount = spaced[1];
    const largePrefix = Boolean(spaced[2]);
    const unitRaw = spaced[3];
    let unit = unitRaw ? normalizeUnitToken(unitRaw) : "";
    let rest = spaced[4]
      .replace(/\(.*?\)/g, "")
      .replace(/,.*$/, "")
      .replace(/\s+to taste$/i, "")
      .replace(/^(eggs?|egg yolks?)\b/i, (m) => m)
      .trim();

    // "2 large eggs" → amount 2, unit large, name Eggs
    if (largePrefix && !unit) {
      unit = "large";
    }

    // "4 Salmon fillets" — fillets may be in rest
    const filletMatch = rest.match(/^(.*?)\s+fillets?$/i);
    if (filletMatch && !unit) {
      unit = "fillet";
      rest = filletMatch[1].trim();
    }

    const eggYolk = /^egg yolks?\b/i.test(rest);
    const eggs = /^eggs?\b/i.test(rest);
    let name = resolveCatalogName(rest);
    if (!name && eggYolk) name = "Egg Yolk";
    if (!name && eggs) name = "Eggs";
    if (!name) return null;
    return { name, amount, unit };
  }

  // "Handful of parsley" / "Fresh basil leaves" / "Olive oil"
  const cleaned = text
    .replace(/\(.*?\)/g, "")
    .replace(/,.*$/, "")
    .replace(/^(fresh|handful of|handful)\s+/i, "")
    .replace(/\s+leaves$/i, "")
    .replace(/\s+to taste$/i, "")
    .replace(/^salt\s*&\s*(black\s*)?pepper$/i, "Salt")
    .trim();

  // Combined "Salt & Pepper" → Salt (Black Pepper is separate when listed)
  if (/^salt\s*&\s*(black\s*)?pepper/i.test(text)) {
    return { name: "Salt", amount: "", unit: "pinch" };
  }

  const name = resolveCatalogName(cleaned) ?? resolveCatalogName(text);
  if (!name) return null;
  return { name, amount: "", unit: "" };
}

/** Normalize a list that may mix strings and IngredientLine objects. */
export function coerceIngredientLines(
  items: unknown[] | undefined,
): IngredientLine[] {
  if (!Array.isArray(items)) return [];
  const out: IngredientLine[] = [];
  const seen = new Set<string>();
  for (const item of items) {
    const line =
      typeof item === "string" || (item && typeof item === "object")
        ? parseLegacyIngredientLine(item as string | IngredientLine)
        : null;
    if (!line) continue;
    const key = line.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(line);
  }
  return out;
}

export function emptyIngredientLine(name = ""): IngredientLine {
  return { name, amount: "1", unit: "" };
}
