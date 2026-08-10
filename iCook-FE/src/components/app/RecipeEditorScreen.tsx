"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  useCreatedContent,
  type RecipeInput,
} from "@/components/app/CreatedContentProvider";
import RecipeThumbnail from "@/components/app/RecipeThumbnail";
import ThumbnailUploadField from "@/components/app/ThumbnailUploadField";
import {
  type Recipe,
  type RecipeCategory,
  type RecipeIngredientGroup,
  type RecipeNutrition,
  type RecipeStep,
  flatIngredientsFromGroups,
  normalizeNutrition,
  parseMinutes,
  formatMinutes,
  resolveRecipeTags,
  RECIPE_TAG_LABELS,
} from "@/components/recipes/recipesData";
import type { IngredientLine } from "@/components/ingredients/ingredientCatalog";
import IngredientCatalogPicker from "@/components/ingredients/IngredientCatalogPicker";
import IngredientLineRow from "@/components/ingredients/IngredientLineRow";
import { loadImageAsDataUrl } from "@/lib/imageUpload";

const categories = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Snacks",
  "Sweets",
  "Fruity",
  "Toasty",
  "Savoury",
  "Pasta",
] as const;

const NUTRITION_FIELDS = [
  ["calories", "Calories", "e.g. 320"],
  ["fat", "Total Fat", "e.g. 5.8g"],
  ["cholesterol", "Cholesterol", "e.g. 25mg"],
  ["sodium", "Sodium", "e.g. 615mg"],
  ["carbs", "Carbs", "e.g. 38g"],
  ["protein", "Protein", "e.g. 10g"],
] as const;

const STEP_LABELS = [
  "Recipe Overview",
  "Timing & Servings",
  "Nutrition",
  "Ingredients",
  "Instructions",
] as const;

const TOTAL_STEPS = STEP_LABELS.length;

type Draft = {
  name: string;
  categories: RecipeCategory[];
  description: string;
  thumbnailUrl: string;
  prepTime: string;
  cookTime: string;
  totalTime: string;
  servings: string;
  nutrition: Required<RecipeNutrition>;
  ingredientGroups: RecipeIngredientGroup[];
  instructions: RecipeStep[];
};

function emptyNutritionDraft(): Required<RecipeNutrition> {
  return {
    calories: "",
    protein: "",
    fat: "",
    cholesterol: "",
    sodium: "",
    carbs: "",
  };
}

function nutritionDraftFrom(nutrition: RecipeNutrition): Required<RecipeNutrition> {
  const empty = emptyNutritionDraft();
  return {
    calories: nutrition.calories ?? empty.calories,
    protein: nutrition.protein ?? empty.protein,
    fat: nutrition.fat ?? empty.fat,
    cholesterol: nutrition.cholesterol ?? empty.cholesterol,
    sodium: nutrition.sodium ?? empty.sodium,
    carbs: nutrition.carbs ?? empty.carbs,
  };
}

function minutesFieldValue(stored: string): string {
  if (!stored || stored === "—") return "";
  const n = parseMinutes(stored);
  return n == null ? "" : String(n);
}

function draftFromRecipe(recipe: Recipe): Draft {
  return {
    name: recipe.name,
    categories: [...recipe.categories],
    description: recipe.description,
    thumbnailUrl: recipe.thumbnailUrl ?? "",
    prepTime: minutesFieldValue(recipe.prepTime),
    cookTime: minutesFieldValue(recipe.cookTime),
    totalTime: minutesFieldValue(recipe.totalTime),
    servings: String(recipe.servings || 4),
    nutrition: nutritionDraftFrom(recipe.nutrition),
    ingredientGroups:
      recipe.ingredientGroups.length > 0
        ? recipe.ingredientGroups.map((g) => ({
            title: g.title,
            items: g.items.map((item) => ({ ...item })),
          }))
        : [{ title: "Ingredients", items: [] as IngredientLine[] }],
    instructions:
      recipe.instructions.length > 0
        ? recipe.instructions.map((s) => ({ ...s }))
        : [{ n: "1.0", text: "" }],
  };
}

function emptyDraft(): Draft {
  return {
    name: "",
    categories: [],
    description: "",
    thumbnailUrl: "",
    prepTime: "",
    cookTime: "",
    totalTime: "",
    servings: "4",
    nutrition: emptyNutritionDraft(),
    ingredientGroups: [{ title: "Ingredients", items: [] }],
    instructions: [{ n: "1.0", text: "" }],
  };
}

function toInput(draft: Draft): RecipeInput | null {
  if (!draft.name.trim() || draft.categories.length === 0) return null;
  const prep = parseMinutes(draft.prepTime);
  const cook = parseMinutes(draft.cookTime);
  const total =
    parseMinutes(draft.totalTime) ??
    (prep != null || cook != null ? (prep ?? 0) + (cook ?? 0) : null);
  const ingredients = flatIngredientsFromGroups(draft.ingredientGroups);
  const tags = resolveRecipeTags({
    ingredients,
    ingredientGroups: draft.ingredientGroups,
  });
  return {
    name: draft.name,
    categories: draft.categories,
    description: draft.description,
    thumbnailUrl: draft.thumbnailUrl || undefined,
    prepTime: prep == null ? undefined : formatMinutes(prep),
    cookTime: cook == null ? undefined : formatMinutes(cook),
    totalTime: total == null ? undefined : formatMinutes(total),
    servings: Number(draft.servings) || 1,
    nutrition: normalizeNutrition(draft.nutrition),
    tags,
    ingredientGroups: draft.ingredientGroups,
    instructions: draft.instructions,
    preview: draft.description.trim() || undefined,
  };
}

const fieldClass = "field-sm";

export default function RecipeEditorScreen({
  recipeId,
}: {
  /** When set, editor runs in edit mode and prefills from resolveRecipe. */
  recipeId?: string;
}) {
  const router = useRouter();
  const { publishRecipe, updateRecipe, resolveRecipe } = useCreatedContent();
  const isEdit = Boolean(recipeId);
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [ready, setReady] = useState(!isEdit);
  const [missing, setMissing] = useState(false);
  const [storageReady, setStorageReady] = useState(!isEdit);
  const stepImageInputRef = useRef<HTMLInputElement>(null);
  const [stepImageTarget, setStepImageTarget] = useState<number | null>(null);
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);

  useEffect(() => {
    if (!isEdit) return;
    // Allow CreatedContentProvider to hydrate from localStorage first.
    const t = window.setTimeout(() => setStorageReady(true), 0);
    return () => window.clearTimeout(t);
  }, [isEdit]);

  useEffect(() => {
    if (!recipeId) {
      setDraft(emptyDraft());
      setReady(true);
      setMissing(false);
      return;
    }
    if (!storageReady) return;
    const recipe = resolveRecipe(recipeId);
    if (!recipe) {
      setMissing(true);
      setReady(true);
      return;
    }
    setDraft(draftFromRecipe(recipe));
    setMissing(false);
    setReady(true);
  }, [recipeId, resolveRecipe, storageReady]);

  function updateDraft(patch: Partial<Draft>) {
    setDraft((prev) => ({ ...prev, ...patch }));
  }

  const inferredTags = resolveRecipeTags({
    ingredients: flatIngredientsFromGroups(draft.ingredientGroups),
    ingredientGroups: draft.ingredientGroups,
  });

  function canAdvance(): boolean {
    if (step === 0) return Boolean(draft.name.trim() && draft.categories.length > 0);
    return true;
  }

  function toggleCategory(slug: RecipeCategory) {
    setDraft((prev) => {
      const has = prev.categories.includes(slug);
      const categories = has
        ? prev.categories.filter((c) => c !== slug)
        : [...prev.categories, slug];
      return { ...prev, categories };
    });
  }

  function onBack() {
    if (step === 0) {
      router.back();
      return;
    }
    setStep((s) => s - 1);
  }

  function onNextOrPublish() {
    if (step < TOTAL_STEPS - 1) {
      if (!canAdvance()) return;
      setStep((s) => s + 1);
      return;
    }
    const input = toInput(draft);
    if (!input) {
      setStep(0);
      return;
    }
    const recipe = isEdit && recipeId
      ? updateRecipe(recipeId, input)
      : publishRecipe(input);
    router.push(`/recipe/${recipe.id}`);
  }

  async function onStepImageChange(file: File | undefined) {
    if (stepImageTarget === null || !file) return;
    const result = await loadImageAsDataUrl(file);
    if (!result.ok) return;
    setDraft((prev) => {
      const instructions = prev.instructions.map((s, i) =>
        i === stepImageTarget ? { ...s, imageUrl: result.dataUrl } : s,
      );
      return { ...prev, instructions };
    });
    setStepImageTarget(null);
  }

  if (!ready) {
    return (
      <div className="page flex items-center justify-center p-6 text-muted">
        Loading…
      </div>
    );
  }

  if (missing) {
    return (
      <div className="page flex flex-col items-center justify-center gap-3 p-6">
        <p className="text-base text-muted">This recipe could not be found.</p>
        <button
          type="button"
          onClick={() => router.push("/user/recipes")}
          className="btn-primary"
        >
          Back to My Recipes
        </button>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="list-stack flex-1 py-2">
        <div className="feed-card flex items-center justify-between">
          <span className="section-title">{STEP_LABELS[step]}</span>
          <span className="text-sm font-bold text-ink-secondary">
            Step {step + 1} of {TOTAL_STEPS}
          </span>
        </div>

        {step === 0 ? (
          <>
            <div className="feed-card flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <label htmlFor="recipe-title" className="section-title">
                  Recipe Title <span className="font-bold">*</span>
                </label>
              </div>
              <input
                id="recipe-title"
                name="title"
                required
                value={draft.name}
                onChange={(e) => updateDraft({ name: e.target.value })}
                placeholder="Traditional Garlic Bread"
                className={fieldClass}
              />
            </div>

            <div className="feed-card flex flex-col gap-2.5">
              <span className="section-title">
                Categories <span className="font-bold">*</span>
              </span>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Categories">
                {categories.map((c) => {
                  const slug = c.toLowerCase() as RecipeCategory;
                  const selected = draft.categories.includes(slug);
                  return (
                    <button
                      key={slug}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleCategory(slug)}
                      className={`rounded border-2 px-3 py-1.5 text-sm font-bold transition-colors ${
                        selected
                          ? "border-brand bg-brand/10 text-brand"
                          : "border-line bg-app text-ink-secondary hover:border-brand hover:text-brand"
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs italic text-muted">
                Select one or more. The first selected sets the default thumbnail.
              </p>
            </div>

            <div className="feed-card flex flex-col gap-2.5">
              <label htmlFor="recipe-description" className="section-title">
                Description
              </label>
              <textarea
                id="recipe-description"
                name="description"
                rows={3}
                value={draft.description}
                onChange={(e) => updateDraft({ description: e.target.value })}
                placeholder="A short intro for your recipe…"
                className={`${fieldClass} resize-none`}
              />
            </div>

            <div className="feed-card flex flex-col gap-2.5">
              <span className="section-title">Thumbnail</span>
              <ThumbnailUploadField
                id="recipe-thumbnail"
                value={draft.thumbnailUrl || undefined}
                onChange={(dataUrl) =>
                  updateDraft({ thumbnailUrl: dataUrl ?? "" })
                }
              />
            </div>
          </>
        ) : null}

        {step === 1 ? (
          <div className="feed-card flex flex-col gap-2.5">
            {(
              [
                ["prepTime", "Preparation Time"],
                ["cookTime", "Cook Time"],
              ] as const
            ).map(([key, label]) => (
              <label
                key={key}
                className="flex flex-col gap-1.5"
                htmlFor={`recipe-${key}`}
              >
                <span className="text-sm font-bold text-ink">{label}</span>
                <div className="flex items-center gap-2">
                  <input
                    id={`recipe-${key}`}
                    name={key}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1}
                    value={draft[key]}
                    onChange={(e) => {
                      const next = e.target.value.replace(/[^\d]/g, "");
                      const prep =
                        key === "prepTime"
                          ? parseMinutes(next)
                          : parseMinutes(draft.prepTime);
                      const cook =
                        key === "cookTime"
                          ? parseMinutes(next)
                          : parseMinutes(draft.cookTime);
                      const total =
                        (prep ?? 0) + (cook ?? 0);
                      updateDraft({
                        [key]: next,
                        totalTime:
                          prep == null && cook == null ? "" : String(total),
                      });
                    }}
                    placeholder="0"
                    className={fieldClass}
                  />
                  <span className="shrink-0 text-sm text-muted">minutes</span>
                </div>
              </label>
            ))}
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-bold text-ink">Total Time</span>
              <p className="rounded border border-line bg-app/60 px-2 py-1.5 text-base text-ink">
                {draft.totalTime
                  ? formatMinutes(Number(draft.totalTime) || 0)
                  : "—"}
              </p>
              <p className="text-xs italic text-muted">
                Automatically calculated from prep + cook time.
              </p>
            </div>
            <label className="flex flex-col gap-1.5" htmlFor="recipe-servings">
              <span className="text-sm font-bold text-ink">Servings</span>
              <input
                id="recipe-servings"
                name="servings"
                type="number"
                min={1}
                value={draft.servings}
                onChange={(e) => updateDraft({ servings: e.target.value })}
                className={fieldClass}
              />
            </label>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="feed-card flex flex-col gap-2.5">
            <div>
              <p className="text-sm font-bold text-ink">Per serving</p>
              <p className="mt-1 text-xs italic text-muted">
                Leave a field blank to hide it on the recipe page. If all are
                blank, the Nutrition section is hidden.
              </p>
            </div>
            {NUTRITION_FIELDS.map(([key, label, placeholder]) => (
              <label
                key={key}
                className="flex flex-col gap-1.5"
                htmlFor={`recipe-nutrition-${key}`}
              >
                <span className="text-sm font-bold text-ink">{label}</span>
                <input
                  id={`recipe-nutrition-${key}`}
                  name={`nutrition-${key}`}
                  value={draft.nutrition[key]}
                  onChange={(e) =>
                    updateDraft({
                      nutrition: { ...draft.nutrition, [key]: e.target.value },
                    })
                  }
                  placeholder={placeholder}
                  className={fieldClass}
                />
              </label>
            ))}
            <div className="mt-1 flex flex-col gap-2 border-t border-line pt-3">
              <p className="text-sm font-bold text-ink">Dietary tags</p>
              <p className="text-xs italic text-muted">
                Tags update automatically from ingredients.
              </p>
              {inferredTags.length === 0 ? (
                <p className="text-xs text-muted">
                  Add ingredients to see vegetarian, vegan, gluten free,
                  lactose free, and egg free tags.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {inferredTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md border border-brand/30 bg-brand/10 px-2 py-0.5 text-xs font-bold text-brand"
                    >
                      {RECIPE_TAG_LABELS[tag]}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <>
            {draft.ingredientGroups.map((group, gi) => (
              <div key={gi} className="feed-card flex flex-col gap-2.5">
                <div className="flex items-center justify-between gap-2">
                  <input
                    id={`ingredient-group-title-${gi}`}
                    name={`ingredient-group-title-${gi}`}
                    value={group.title}
                    onChange={(e) => {
                      const ingredientGroups = draft.ingredientGroups.map(
                        (g, i) =>
                          i === gi ? { ...g, title: e.target.value } : g,
                      );
                      updateDraft({ ingredientGroups });
                    }}
                    placeholder="Group title"
                    className={fieldClass}
                  />
                  {draft.ingredientGroups.length > 1 ? (
                    <button
                      type="button"
                      className="shrink-0 text-sm font-bold text-brand"
                      onClick={() => {
                        const next = draft.ingredientGroups.filter(
                          (_, i) => i !== gi,
                        );
                        updateDraft({ ingredientGroups: next });
                        setActiveGroupIndex((prev) => {
                          if (prev === gi) return Math.max(0, gi - 1);
                          if (prev > gi) return prev - 1;
                          return Math.min(prev, Math.max(0, next.length - 1));
                        });
                      }}
                    >
                      Remove
                    </button>
                  ) : null}
                </div>

                <div className="flex shrink-0 items-center gap-2 text-xs font-bold text-ink-secondary">
                  <span className="min-w-0 flex-1">Ingredient</span>
                  <span className="w-16 text-center">Amount</span>
                  <span className="w-18 text-center">Unit</span>
                  <span className="w-8" />
                </div>

                {group.items.length === 0 ? (
                  <p className="text-xs italic text-muted">
                    No ingredients in this group yet.
                  </p>
                ) : (
                  group.items.map((item, ii) => (
                    <IngredientLineRow
                      key={`${item.name}-${ii}`}
                      item={item}
                      idPrefix={`recipe-${gi}-${ii}`}
                      onChangeAmount={(value) => {
                        const ingredientGroups = draft.ingredientGroups.map(
                          (g, i) => {
                            if (i !== gi) return g;
                            return {
                              ...g,
                              items: g.items.map((it, j) =>
                                j === ii ? { ...it, amount: value } : it,
                              ),
                            };
                          },
                        );
                        updateDraft({ ingredientGroups });
                      }}
                      onChangeUnit={(value) => {
                        const ingredientGroups = draft.ingredientGroups.map(
                          (g, i) => {
                            if (i !== gi) return g;
                            return {
                              ...g,
                              items: g.items.map((it, j) =>
                                j === ii ? { ...it, unit: value } : it,
                              ),
                            };
                          },
                        );
                        updateDraft({ ingredientGroups });
                      }}
                      onRemove={() => {
                        const ingredientGroups = draft.ingredientGroups.map(
                          (g, i) => {
                            if (i !== gi) return g;
                            return {
                              ...g,
                              items: g.items.filter((_, j) => j !== ii),
                            };
                          },
                        );
                        updateDraft({ ingredientGroups });
                      }}
                    />
                  ))
                )}
              </div>
            ))}

            <div className="feed-card">
              <button
                type="button"
                className="text-sm font-bold text-brand"
                onClick={() => {
                  const ingredientGroups = [
                    ...draft.ingredientGroups,
                    { title: "More ingredients", items: [] as IngredientLine[] },
                  ];
                  updateDraft({ ingredientGroups });
                  setActiveGroupIndex(ingredientGroups.length - 1);
                }}
              >
                + Add ingredient group
              </button>
            </div>

            <div className="feed-card flex flex-col gap-2">
              <label
                className="flex flex-col gap-1.5"
                htmlFor="ingredient-target-group"
              >
                <span className="text-sm font-bold text-ink">
                  Add ingredients to
                </span>
                <select
                  id="ingredient-target-group"
                  name="ingredient-target-group"
                  className={fieldClass}
                  value={Math.min(
                    activeGroupIndex,
                    Math.max(0, draft.ingredientGroups.length - 1),
                  )}
                  onChange={(e) =>
                    setActiveGroupIndex(Number(e.target.value) || 0)
                  }
                >
                  {draft.ingredientGroups.map((group, gi) => (
                    <option key={gi} value={gi}>
                      {group.title.trim() || `Group ${gi + 1}`}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <IngredientCatalogPicker
              className="max-h-64 shrink-0 rounded-lg"
              title="Add Ingredients"
              addedNames={
                draft.ingredientGroups[
                  Math.min(
                    activeGroupIndex,
                    Math.max(0, draft.ingredientGroups.length - 1),
                  )
                ]?.items.map((i) => i.name) ?? []
              }
              onAdd={(name) => {
                const gi = Math.min(
                  activeGroupIndex,
                  Math.max(0, draft.ingredientGroups.length - 1),
                );
                const ingredientGroups = draft.ingredientGroups.map((g, i) => {
                  if (i !== gi) return g;
                  if (
                    g.items.some(
                      (it) => it.name.toLowerCase() === name.toLowerCase(),
                    )
                  ) {
                    return g;
                  }
                  return {
                    ...g,
                    items: [...g.items, { name, amount: "1", unit: "" }],
                  };
                });
                updateDraft({ ingredientGroups });
              }}
              onRemove={(name) => {
                const gi = Math.min(
                  activeGroupIndex,
                  Math.max(0, draft.ingredientGroups.length - 1),
                );
                const ingredientGroups = draft.ingredientGroups.map((g, i) => {
                  if (i !== gi) return g;
                  return {
                    ...g,
                    items: g.items.filter(
                      (it) => it.name.toLowerCase() !== name.toLowerCase(),
                    ),
                  };
                });
                updateDraft({ ingredientGroups });
              }}
            />

            <div className="feed-card flex flex-col gap-2">
              <p className="text-sm font-bold text-ink">Dietary tags</p>
              <p className="text-xs italic text-muted">
                Tags update automatically from ingredients.
              </p>
              {inferredTags.length === 0 ? (
                <p className="text-xs text-muted">
                  No tags yet — add ingredient lines above.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {inferredTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md border border-brand/30 bg-brand/10 px-2 py-0.5 text-xs font-bold text-brand"
                    >
                      {RECIPE_TAG_LABELS[tag]}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : null}

        {step === 4 ? (
          <>
            <input
              ref={stepImageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(e) => void onStepImageChange(e.target.files?.[0])}
            />
            {draft.instructions.map((instruction, si) => (
              <div key={si} className="feed-card flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <input
                    id={`step-n-${si}`}
                    name={`step-n-${si}`}
                    value={instruction.n}
                    onChange={(e) => {
                      const instructions = draft.instructions.map((s, i) =>
                        i === si ? { ...s, n: e.target.value } : s,
                      );
                      updateDraft({ instructions });
                    }}
                    placeholder="1.0"
                    className={`${fieldClass} w-20 shrink-0`}
                  />
                  {draft.instructions.length > 1 ? (
                    <button
                      type="button"
                      className="ms-auto text-sm font-bold text-brand"
                      onClick={() =>
                        updateDraft({
                          instructions: draft.instructions.filter(
                            (_, i) => i !== si,
                          ),
                        })
                      }
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
                <textarea
                  id={`step-text-${si}`}
                  name={`step-text-${si}`}
                  rows={3}
                  value={instruction.text}
                  onChange={(e) => {
                    const instructions = draft.instructions.map((s, i) =>
                      i === si ? { ...s, text: e.target.value } : s,
                    );
                    updateDraft({ instructions });
                  }}
                  placeholder="Describe this step…"
                  className={`${fieldClass} resize-none`}
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="text-sm font-bold text-brand"
                    onClick={() => {
                      setStepImageTarget(si);
                      stepImageInputRef.current?.click();
                    }}
                  >
                    {instruction.imageUrl ? "Replace step image" : "Add step image"}
                  </button>
                  {instruction.imageUrl ? (
                    <button
                      type="button"
                      className="text-sm text-muted"
                      onClick={() => {
                        const instructions = draft.instructions.map((s, i) => {
                          if (i !== si) return s;
                          return { n: s.n, text: s.text };
                        });
                        updateDraft({ instructions });
                      }}
                    >
                      Clear image
                    </button>
                  ) : null}
                </div>
                {instruction.imageUrl ? (
                  <RecipeThumbnail
                    className="h-28 w-full rounded"
                    src={instruction.imageUrl}
                    alt=""
                  />
                ) : null}
              </div>
            ))}
            <div className="feed-card">
              <button
                type="button"
                className="text-sm font-bold text-brand"
                onClick={() => {
                  const nextN = `${draft.instructions.length + 1}.0`;
                  updateDraft({
                    instructions: [
                      ...draft.instructions,
                      { n: nextN, text: "" },
                    ],
                  });
                }}
              >
                + Add step
              </button>
            </div>
          </>
        ) : null}
      </div>

      <div className="surface-block flex items-center justify-between border-t border-line p-2.5">
        <button type="button" onClick={onBack} className="btn-primary w-[114px]">
          Back
        </button>
        <button
          type="button"
          onClick={onNextOrPublish}
          disabled={step === 0 && !canAdvance()}
          className="btn-primary w-[114px] disabled:opacity-50"
        >
          {step < TOTAL_STEPS - 1 ? "Next" : isEdit ? "Save" : "Publish"}
        </button>
      </div>
    </div>
  );
}
