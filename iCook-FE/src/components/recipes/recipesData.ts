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
  fat: string;
  carbs: string;
  protein: string;
  sodium: string;
};

export type RecipeIngredientGroup = {
  title: string;
  items: string[];
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
  category: RecipeCategory;
  /** Community bookmark baseline (other users). Current user save adds +1 at runtime. */
  bookmarkCount: number;
  description: string;
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

/** Resolved image for cards/detail — custom upload, else category art. */
export function recipeThumbnailSrc(
  recipe: Pick<Recipe, "category"> & { thumbnailUrl?: string },
): string {
  const custom = recipe.thumbnailUrl?.trim();
  if (custom && custom !== "placeholder") return custom;
  return CATEGORY_THUMBNAILS[recipe.category];
}

export function flatIngredientsFromGroups(
  groups: RecipeIngredientGroup[],
): string[] {
  const names = new Set<string>();
  for (const group of groups) {
    for (const item of group.items) {
      const cleaned = item
        .replace(/^\d+(\.\d+)?\s*(g|kg|ml|l|cup|cups|tsp|tbsp|tablespoons?|teaspoons?)?\s*/i, "")
        .replace(/\(.*?\)/g, "")
        .replace(/,.*$/, "")
        .trim();
      if (cleaned) names.add(cleaned);
    }
  }
  return [...names];
}

const emptyNutrition = (): RecipeNutrition => ({
  fat: "0g",
  carbs: "0g",
  protein: "0g",
  sodium: "0",
});

/** Shared recipes that appear in Discover/Recipes and can be saved. */
export const CATALOG_RECIPES: Recipe[] = [
  {
    id: "1",
    name: "Ricotta Ravioli",
    author: "courtneyhenry",
    category: "pasta",
    thumbnailUrl: "/icons/recipes/pasta.png",
    bookmarkCount: 128,
    description:
      "Homemade ravioli filled with a creamy ricotta and mascarpone mix, finished with fresh basil.",
    prepTime: "2 hours",
    cookTime: "5 minutes",
    totalTime: "2 Hours 5 minutes",
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
    ],
    ingredients: [
      "Flour",
      "Eggs",
      "Ricotta",
      "Basil",
      "Olive Oil",
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
    category: "toasty",
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
          "2 large eggs",
          "2 slices bread",
          "1 tbsp butter",
          "1 tsp olive oil",
          "Salt & black pepper, to taste",
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
    category: "breakfast",
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
          "200g Flour",
          "2 large eggs",
          "250ml Milk",
          "2 tbsp melted butter",
          "2 tbsp sugar",
          "1 tsp lemon zest",
          "150g Blueberries",
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
    category: "lunch",
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
          "300g Pasta",
          "200g Cherry tomatoes, halved",
          "2 Garlic cloves, minced",
          "Handful of parsley, chopped",
          "3 tbsp olive oil",
          "Juice of 1 lemon",
          "Salt & black pepper, to taste",
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
    category: "dinner",
    thumbnailUrl: "/icons/recipes/dinner.png",
    bookmarkCount: 88,
    description:
      "Herb-rubbed pork roast with rosemary and thyme, roasted until juicy with a crisp exterior.",
    prepTime: "20 minutes",
    cookTime: "1 hour 30 minutes",
    totalTime: "1 hour 50 minutes",
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
          "1.5kg Pork roast",
          "4 Garlic cloves, crushed",
          "2 tbsp dried rosemary",
          "1 tbsp dried thyme",
          "3 tbsp olive oil",
          "Salt & black pepper, to taste",
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
    category: "sweets",
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
          "250g Flour",
          "170g Butter, softened",
          "150g Sugar",
          "2 large eggs",
          "200g Chocolate, chopped",
          "1 tsp vanilla extract",
          "1/2 tsp salt",
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
    category: "pasta",
    thumbnailUrl: "/icons/recipes/pasta.png",
    bookmarkCount: 63,
    description:
      "Classic ricotta ravioli with a simple dough and fresh basil — a weeknight pasta classic.",
    prepTime: "1 hour",
    cookTime: "5 minutes",
    totalTime: "1 hour 5 minutes",
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
          "300g Flour",
          "3 large eggs",
          "150g Ricotta",
          "2 tbsp olive oil",
          "Salt, to taste",
          "Handful of basil, chopped",
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
    category: "toasty",
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
          "4 large eggs",
          "2 ripe tomatoes, chopped",
          "2 Garlic cloves, sliced",
          "2 tbsp olive oil",
          "Fresh basil leaves",
          "Salt & black pepper, to taste",
          "4 slices bread, toasted",
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
    category: "snacks",
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
          "80g Popcorn kernels",
          "2 tbsp olive oil",
          "2 tbsp butter, melted",
          "Salt, to taste",
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
    category: "dinner",
    thumbnailUrl: "/icons/recipes/dinner.png",
    bookmarkCount: 57,
    description:
      "Lemon-rosemary roast pork with garlic — a simpler cousin of the classic pork roast.",
    prepTime: "15 minutes",
    cookTime: "1 hour 15 minutes",
    totalTime: "1 hour 30 minutes",
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
          "1.2kg Pork roast",
          "4 Garlic cloves",
          "2 tbsp dried rosemary",
          "3 tbsp olive oil",
          "Juice of 1 lemon",
          "Salt & black pepper, to taste",
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
    category: "dinner",
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
          "4 Salmon fillets",
          "800g Potatoes, cubed",
          "4 tbsp olive oil",
          "1 Lemon, sliced",
          "Fresh dill",
          "3 Garlic cloves",
          "Salt & black pepper, to taste",
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
    category: "savoury",
    thumbnailUrl: "/icons/recipes/savoury.png",
    bookmarkCount: 69,
    description:
      "Seared steak sliced over a fluffy jacket potato with garlic butter.",
    prepTime: "10 minutes",
    cookTime: "50 minutes",
    totalTime: "1 hour",
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
          "2 Steaks",
          "2 large Potatoes",
          "2 tbsp olive oil",
          "2 tbsp butter",
          "2 Garlic cloves, crushed",
          "Salt & black pepper, to taste",
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
    category: "fruity",
    thumbnailUrl: "/icons/recipes/fruity.png",
    bookmarkCount: 104,
    description:
      "No-fuss raspberry cheesecake with a buttery base and tangy yogurt cream.",
    prepTime: "25 minutes",
    cookTime: "0 minutes",
    totalTime: "25 minutes (+ chill)",
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
          "200g Digestive biscuits, crushed",
          "80g Butter, melted",
          "300g Yogurt",
          "100g Sugar",
          "1 tsp vanilla extract",
          "Zest of 1 lemon",
          "200g Raspberries",
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
];

export function getCatalogRecipe(id: string): Recipe | undefined {
  return CATALOG_RECIPES.find((r) => r.id === id);
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
    category: "dinner",
    description: "",
    prepTime: "",
    cookTime: "",
    totalTime: "",
    servings: 4,
    nutrition: emptyNutrition(),
    ingredientGroups: [{ title: "Ingredients", items: [""] }],
    ingredients: [],
    instructions: [{ n: "1.0", text: "" }],
    ...partial,
  };
}
