"use client";

import { useRouter } from "next/navigation";
import { UploadIcon, ImageIcon } from "@/components/app/icons";

const categories = ["Breakfast", "Lunch", "Snacks", "Dinner", "Desserts"];

export default function CreateRecipeScreen() {
  const router = useRouter();

  return (
    <form
      className="flex min-h-full flex-col justify-between bg-[#f6f7fa] pt-[5px]"
      onSubmit={(e) => e.preventDefault()}
    >
      <div className="flex flex-col gap-[5px]">
        {/* Step indicator */}
        <div className="flex items-center justify-between bg-white px-2.5 py-1.5 text-base font-bold text-brand">
          <span>Recipe Overview</span>
          <span>Step 1 of 5</span>
        </div>

        {/* Title */}
        <div className="flex flex-col gap-2.5 bg-white p-2.5">
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
            placeholder="Traditional Garlic Bread"
            className="w-full rounded-[4px] border border-[#d0d6e8] bg-[#f6f7fa] px-2 py-1.5 text-base text-[#292929] outline-none placeholder:italic placeholder:text-[#d0d6e8] focus:border-brand"
          />
        </div>

        {/* Category */}
        <div className="flex flex-col gap-2.5 bg-white p-2.5">
          <span className="text-base text-black">
            Category <span className="font-bold text-brand">*</span>
          </span>
          <select
            name="category"
            defaultValue=""
            className="w-full rounded-[4px] border border-[#d0d6e8] bg-[#f6f7fa] px-2 py-1.5 text-base text-[#292929] outline-none focus:border-brand"
          >
            <option value="" disabled>
              Select a Category
            </option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Upload */}
        <div className="flex flex-col gap-2.5 bg-white p-2.5">
          <button
            type="button"
            className="flex flex-col items-center gap-2.5 rounded border-2 border-dashed border-[#d0d6e8] py-5"
          >
            <UploadIcon className="size-24 text-[#d0d6e8]" />
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
      <div className="flex items-center justify-between bg-white p-2.5">
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
          NEXT
        </button>
      </div>
    </form>
  );
}
