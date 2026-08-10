"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { UploadIcon, ImageIcon } from "@/components/app/icons";
import {
  useCreatedContent,
  type RecipeInput,
} from "@/components/app/CreatedContentProvider";
import RecipeThumbnail from "@/components/app/RecipeThumbnail";
import {
  type Recipe,
  type RecipeCategory,
  type RecipeIngredientGroup,
  type RecipeNutrition,
  type RecipeStep,
} from "@/components/recipes/recipesData";

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

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

const fieldClass =
  "w-full rounded-[4px] border border-line bg-app px-2 py-1.5 text-base text-ink outline-none placeholder:italic placeholder:text-line focus:border-brand";

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
  const thumbInputRef = useRef<HTMLInputElement>(null);
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

  async function onThumbnailChange(file: File | undefined) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return;
    const dataUrl = await readFileAsDataUrl(file);
    updateDraft({ thumbnailUrl: dataUrl });
  }

  async function onStepImageChange(file: File | undefined) {
    if (stepImageTarget === null || !file) return;
    if (file.size > 5 * 1024 * 1024) return;
    const dataUrl = await readFileAsDataUrl(file);
    setDraft((prev) => {
      const instructions = prev.instructions.map((s, i) =>
        i === stepImageTarget ? { ...s, imageUrl: dataUrl } : s,
      );
      return { ...prev, instructions };
    });
    setStepImageTarget(null);
  }

  if (!ready) {
    return (
      <div className="flex min-h-full items-center justify-center bg-app p-6 text-muted">
        Loading…
      </div>
    );
  }

  if (missing) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-3 bg-app p-6">
        <p className="text-base text-muted">This recipe could not be found.</p>
        <button
          type="button"
          onClick={() => router.push("/user/recipes")}
          className="rounded-[5px] bg-brand px-5 py-1.5 text-base font-bold text-white"
        >
          Back to My Recipes
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col justify-between bg-app pt-[5px]">
      <div className="flex flex-col gap-[5px]">
        <div className="flex items-center justify-between bg-surface px-2.5 py-1.5 text-base font-bold text-brand">
          <span>{STEP_LABELS[step]}</span>
          <span>
            Step {step + 1} of {TOTAL_STEPS}
          </span>
        </div>

        {step === 0 ? (
          <>
            <div className="flex flex-col gap-2.5 bg-surface p-2.5">
              <div className="flex items-center justify-between">
                <span className="text-base text-black">
                  Recipe Title <span className="font-bold text-brand">*</span>
                </span>
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

            <div className="flex flex-col gap-2.5 bg-surface p-2.5">
              <span className="text-base text-black">
                Category <span className="font-bold text-brand">*</span>
              </span>
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

            <div className="flex flex-col gap-2.5 bg-surface p-2.5">
              <span className="text-base text-black">Description</span>
              <textarea
                id="recipe-description"
                name="description"
                rows={3}
                value={draft.description}
                onChange={(e) => updateDraft({ description: e.target.value })}
                placeholder="A short intro for your recipe…"
                className={fieldClass}
              />
            </div>

            <div className="flex flex-col gap-2.5 bg-surface p-2.5">
              <input
                ref={thumbInputRef}
                id="recipe-thumbnail"
                name="thumbnail"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(e) => void onThumbnailChange(e.target.files?.[0])}
              />
              <button
                type="button"
                onClick={() => thumbInputRef.current?.click()}
                className="flex flex-col items-center gap-2.5 rounded border-2 border-dashed border-line py-5"
              >
                {draft.thumbnailUrl ? (
                  <RecipeThumbnail
                    className="h-32 w-32 rounded"
                    src={draft.thumbnailUrl}
                    alt="Thumbnail preview"
                  />
                ) : (
                  <UploadIcon className="size-24 text-line" />
                )}
                <div className="text-center">
                  <p className="text-base font-bold text-brand">
                    Click to Upload Thumbnail
                  </p>
                  <p className="text-base italic text-muted">
                    Supports JPG, PNG, up to 5MB
                  </p>
                </div>
              </button>
              <div className="flex items-center gap-2.5 px-5">
                <ImageIcon className="size-6 text-brand" />
                <p className="flex-1 text-base italic text-muted">
                  {draft.thumbnailUrl
                    ? "Thumbnail ready — tap above to replace."
                    : "No thumbnail has been updated yet!"}
                </p>
              </div>
            </div>
          </>
        ) : null}

        {step === 1 ? (
          <div className="flex flex-col gap-2.5 bg-surface p-2.5">
            {(
              [
                ["prepTime", "Preparation Time", "e.g. 20 minutes"],
                ["cookTime", "Cook Time", "e.g. 35 minutes"],
                ["totalTime", "Total Time", "e.g. 55 minutes"],
              ] as const
            ).map(([key, label, placeholder]) => (
              <label key={key} className="flex flex-col gap-1.5" htmlFor={`recipe-${key}`}>
                <span className="text-base text-black">{label}</span>
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
              <span className="text-base text-black">Servings</span>
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
          <div className="flex flex-col gap-2.5 bg-surface p-2.5">
            {(
              [
                ["fat", "Fat", "e.g. 5.8g"],
                ["carbs", "Carbs", "e.g. 38g"],
                ["protein", "Protein", "e.g. 10g"],
                ["sodium", "Sodium", "e.g. 615"],
              ] as const
            ).map(([key, label, placeholder]) => (
              <label key={key} className="flex flex-col gap-1.5" htmlFor={`recipe-nutrition-${key}`}>
                <span className="text-base text-black">{label}</span>
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
          <div className="flex flex-col gap-2.5">
            {draft.ingredientGroups.map((group, gi) => (
              <div key={gi} className="flex flex-col gap-2.5 bg-surface p-2.5">
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
                      className="shrink-0 text-sm text-brand"
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
                        className="shrink-0 text-sm text-brand"
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
            <div className="bg-surface p-2.5">
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
          </div>
        ) : null}

        {step === 4 ? (
          <div className="flex flex-col gap-2.5">
            <input
              ref={stepImageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(e) => void onStepImageChange(e.target.files?.[0])}
            />
            {draft.instructions.map((instruction, si) => (
              <div key={si} className="flex flex-col gap-2 bg-surface p-2.5">
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
                      className="ms-auto text-sm text-brand"
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
                  className={fieldClass}
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
            <div className="bg-surface p-2.5">
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
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between bg-surface p-2.5">
        <button
          type="button"
          onClick={onBack}
          className="w-[114px] rounded-[5px] bg-brand px-5 py-1.5 text-xl font-bold text-white shadow-md"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNextOrPublish}
          disabled={step === 0 && !canAdvance()}
          className="w-[114px] rounded-[5px] bg-brand px-5 py-1.5 text-xl font-bold text-white shadow-md disabled:opacity-50"
        >
          {step < TOTAL_STEPS - 1 ? "Next" : isEdit ? "Save" : "Publish"}
        </button>
      </div>
    </div>
  );
}
