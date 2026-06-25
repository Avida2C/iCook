"use client";

import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  LinkIcon,
  ImageIcon,
} from "@/components/app/icons";

const categories = ["Tips", "Recipes", "Cooking Techniques"];

const toolbar = [
  { label: "Bold", Icon: BoldIcon },
  { label: "Italic", Icon: ItalicIcon },
  { label: "Underline", Icon: UnderlineIcon },
  { label: "Align left", Icon: AlignLeftIcon },
  { label: "Align center", Icon: AlignCenterIcon },
  { label: "Align right", Icon: AlignRightIcon },
  { label: "Insert link", Icon: LinkIcon },
  { label: "Insert image", Icon: ImageIcon },
];

export default function CreatePostScreen() {
  return (
    <form
      className="flex min-h-full flex-col gap-[5px] pt-[5px]"
      onSubmit={(e) => e.preventDefault()}
    >
      {/* Title */}
      <div className="flex flex-col gap-2.5 bg-white p-2.5">
        <div className="flex items-center justify-between">
          <span className="text-base text-black">
            Post Title <span className="text-brand">*</span>
          </span>
          <button type="button" className="text-base italic text-brand">
            Auto-Fill
          </button>
        </div>
        <input
          name="title"
          placeholder="5 Tips for Baking Perfect Cakes"
          className="w-full rounded-[4px] border border-[#d0d6e8] bg-[#f6f7fa] px-2 py-1.5 text-base text-[#292929] outline-none placeholder:italic placeholder:text-[#d0d6e8] focus:border-brand"
        />
      </div>

      {/* Category */}
      <div className="flex flex-col gap-2.5 bg-white p-2.5">
        <span className="text-base text-black">
          Category <span className="text-brand">*</span>
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

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2.5 bg-white p-2.5">
        <span className="text-base text-black">
          Post Content <span className="text-brand">*</span>
        </span>
        <div className="flex flex-col overflow-hidden rounded-[5px] border border-[#d0d6e8]">
          <div className="flex items-center justify-between border-b border-[#d0d6e8] bg-[#f6f7fa] p-2.5 text-[#292929]">
            {toolbar.map(({ label, Icon }) => (
              <button
                key={label}
                type="button"
                aria-label={label}
                className="grid size-6 place-items-center hover:text-brand"
              >
                <Icon className="size-4" />
              </button>
            ))}
          </div>
          <textarea
            name="content"
            rows={10}
            placeholder="Content must be at least 100 words."
            className="resize-none bg-white p-2 text-base text-[#292929] outline-none placeholder:italic placeholder:text-[#d0d6e8]"
          />
        </div>
        <p className="text-xs font-semibold text-[#d0d6e8]">
          Review your post to ensure clarity and engagement!
        </p>
        <button
          type="submit"
          className="w-full rounded-[5px] bg-brand px-5 py-1.5 text-xl font-bold text-white shadow-md transition-colors hover:bg-[#e85557]"
        >
          Next
        </button>
      </div>
    </form>
  );
}
