"use client";

import { useRouter } from "next/navigation";
import { UploadIcon, ImageIcon } from "@/components/app/icons";
import { useCreatedContent } from "@/components/app/CreatedContentProvider";
import type { RecipeCategorySlug } from "@/components/recipes/SavedRecipesProvider";

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

export default function CreateRecipeScreen() {
  const router = useRouter();
  const { publishRecipe } = useCreatedContent();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("title") ?? "").trim();
    const category = String(data.get("category") ?? "").trim() as Exclude<
      RecipeCategorySlug,
      "all" | "loved"
    >;
    if (!name || !category) return;

    const recipe = publishRecipe({ name, category });
    router.push(`/recipe/${recipe.id}`);
  }

  return (
    <form
      className="flex min-h-full flex-col justify-between bg-app pt-[5px]"
      onSubmit={onSubmit}
    >
      <div className="flex flex-col gap-[5px]">
        {/* Step indicator */}
        <div className="flex items-center justify-between bg-surface px-2.5 py-1.5 text-base font-bold text-brand">
          <span>Recipe Overview</span>
          <span>Step 1 of 5</span>
        </div>

        {/* Title */}
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
            name="title"
            required
            placeholder="Traditional Garlic Bread"
            className="w-full rounded-[4px] border border-line bg-app px-2 py-1.5 text-base text-ink outline-none placeholder:italic placeholder:text-line focus:border-brand"
          />
        </div>

        {/* Category */}
        <div className="flex flex-col gap-2.5 bg-surface p-2.5">
          <span className="text-base text-black">
            Category <span className="font-bold text-brand">*</span>
          </span>
          <select
            name="category"
            defaultValue=""
            required
            className="w-full rounded-[4px] border border-line bg-app px-2 py-1.5 text-base text-ink outline-none focus:border-brand"
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

        {/* Upload */}
        <div className="flex flex-col gap-2.5 bg-surface p-2.5">
          <button
            type="button"
            className="flex flex-col items-center gap-2.5 rounded border-2 border-dashed border-line py-5"
          >
            <UploadIcon className="size-24 text-line" />
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
              No thumbnail has been updated yet!
            </p>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-between bg-surface p-2.5">
        <button
          type="button"
          onClick={() => router.back()}
          className="w-[114px] rounded-[5px] bg-brand px-5 py-1.5 text-xl font-bold text-white shadow-md"
        >
          Back
        </button>
        <button
          type="submit"
          className="w-[114px] rounded-[5px] bg-brand px-5 py-1.5 text-xl font-bold text-white shadow-md"
        >
          Publish
        </button>
      </div>
    </form>
  );
}
