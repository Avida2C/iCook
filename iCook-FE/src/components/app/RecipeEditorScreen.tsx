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
} from "@/components/recipes/recipesData";
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
  category: RecipeCategory | "";
  description: string;
  thumbnailUrl: string;
  prepTime: string;
  cookTime: string;
  totalTime: string;
  servings: string;
  nutrition: RecipeNutrition;
  ingredientGroups: RecipeIngredientGroup[];
  instructions: RecipeStep[];
};

function draftFromRecipe(recipe: Recipe): Draft {
  return {
    name: recipe.name,
    category: recipe.category,
    description: recipe.description,
    thumbnailUrl: recipe.thumbnailUrl ?? "",
    prepTime: recipe.prepTime === "—" ? "" : recipe.prepTime,
    cookTime: recipe.cookTime === "—" ? "" : recipe.cookTime,
    totalTime: recipe.totalTime === "—" ? "" : recipe.totalTime,
    servings: String(recipe.servings || 4),
    nutrition: { ...recipe.nutrition },
    ingredientGroups:
      recipe.ingredientGroups.length > 0
        ? recipe.ingredientGroups.map((g) => ({
            title: g.title,
            items: g.items.length > 0 ? [...g.items] : [""],
          }))
        : [{ title: "Ingredients", items: [""] }],
    instructions:
      recipe.instructions.length > 0
        ? recipe.instructions.map((s) => ({ ...s }))
        : [{ n: "1.0", text: "" }],
  };
}

function emptyDraft(): Draft {
  return {
    name: "",
    category: "",
    description: "",
    thumbnailUrl: "",
    prepTime: "",
    cookTime: "",
    totalTime: "",
    servings: "4",
    nutrition: { fat: "", carbs: "", protein: "", sodium: "" },
    ingredientGroups: [{ title: "Ingredients", items: [""] }],
    instructions: [{ n: "1.0", text: "" }],
  };
}

function toInput(draft: Draft): RecipeInput | null {
  if (!draft.name.trim() || !draft.category) return null;
  return {
    name: draft.name,
    category: draft.category,
    description: draft.description,
    thumbnailUrl: draft.thumbnailUrl || undefined,
    prepTime: draft.prepTime,
    cookTime: draft.cookTime,
    totalTime: draft.totalTime,
    servings: Number(draft.servings) || 1,
    nutrition: {
      fat: draft.nutrition.fat.trim() || "0g",
      carbs: draft.nutrition.carbs.trim() || "0g",
      protein: draft.nutrition.protein.trim() || "0g",
      sodium: draft.nutrition.sodium.trim() || "0",
    },
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

  function canAdvance(): boolean {
    if (step === 0) return Boolean(draft.name.trim() && draft.category);
    return true;
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
                <button type="button" className="text-base italic text-brand">
                  Auto-Fill
                </button>
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
              <label htmlFor="recipe-category" className="section-title">
                Category <span className="font-bold">*</span>
              </label>
              <select
                id="recipe-category"
                name="category"
                required
                value={draft.category}
                onChange={(e) =>
                  updateDraft({
                    category: e.target.value as RecipeCategory | "",
                  })
                }
                className={fieldClass}
              >
                <option value="" disabled>
                  Select a Category
                </option>
                {categories.map((c) => (
                  <option key={c} value={c.toLowerCase()}>
                    {c}
                  </option>
                ))}
              </select>
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
                ["prepTime", "Preparation Time", "e.g. 20 minutes"],
                ["cookTime", "Cook Time", "e.g. 35 minutes"],
                ["totalTime", "Total Time", "e.g. 55 minutes"],
              ] as const
            ).map(([key, label, placeholder]) => (
              <label key={key} className="flex flex-col gap-1.5" htmlFor={`recipe-${key}`}>
                <span className="text-sm font-bold text-ink">{label}</span>
                <input
                  id={`recipe-${key}`}
                  name={key}
                  value={draft[key]}
                  onChange={(e) => updateDraft({ [key]: e.target.value })}
                  placeholder={placeholder}
                  className={fieldClass}
                />
              </label>
            ))}
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
            {(
              [
                ["fat", "Fat", "e.g. 5.8g"],
                ["carbs", "Carbs", "e.g. 38g"],
                ["protein", "Protein", "e.g. 10g"],
                ["sodium", "Sodium", "e.g. 615"],
              ] as const
            ).map(([key, label, placeholder]) => (
              <label key={key} className="flex flex-col gap-1.5" htmlFor={`recipe-nutrition-${key}`}>
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
                      onClick={() =>
                        updateDraft({
                          ingredientGroups: draft.ingredientGroups.filter(
                            (_, i) => i !== gi,
                          ),
                        })
                      }
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
                {group.items.map((item, ii) => (
                  <div key={ii} className="flex items-center gap-2">
                    <input
                      id={`ingredient-${gi}-${ii}`}
                      name={`ingredient-${gi}-${ii}`}
                      value={item}
                      onChange={(e) => {
                        const ingredientGroups = draft.ingredientGroups.map(
                          (g, i) => {
                            if (i !== gi) return g;
                            const items = g.items.map((it, j) =>
                              j === ii ? e.target.value : it,
                            );
                            return { ...g, items };
                          },
                        );
                        updateDraft({ ingredientGroups });
                      }}
                      placeholder="e.g. 300g Flour"
                      className={fieldClass}
                    />
                    {group.items.length > 1 ? (
                      <button
                        type="button"
                        aria-label="Remove ingredient"
                        className="shrink-0 text-sm font-bold text-brand"
                        onClick={() => {
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
                      >
                        ×
                      </button>
                    ) : null}
                  </div>
                ))}
                <button
                  type="button"
                  className="self-start text-sm font-bold text-brand"
                  onClick={() => {
                    const ingredientGroups = draft.ingredientGroups.map(
                      (g, i) =>
                        i === gi ? { ...g, items: [...g.items, ""] } : g,
                    );
                    updateDraft({ ingredientGroups });
                  }}
                >
                  + Add ingredient
                </button>
              </div>
            ))}
            <div className="feed-card">
              <button
                type="button"
                className="text-sm font-bold text-brand"
                onClick={() =>
                  updateDraft({
                    ingredientGroups: [
                      ...draft.ingredientGroups,
                      { title: "More ingredients", items: [""] },
                    ],
                  })
                }
              >
                + Add ingredient group
              </button>
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
