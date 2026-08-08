"use client";

import { useRouter } from "next/navigation";
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
import { useCreatedContent } from "@/components/app/CreatedContentProvider";

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
  const router = useRouter();
  const { publishPost } = useCreatedContent();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const title = String(data.get("title") ?? "").trim();
    const body = String(data.get("content") ?? "").trim();
    const category = String(data.get("category") ?? "").trim();
    if (!title || !body) return;

    const post = publishPost({
      title,
      body,
      category: category || undefined,
    });
    router.push(`/post/${post.id}`);
  }

  return (
    <form
      className="flex min-h-full flex-col gap-[5px] pt-[5px]"
      onSubmit={onSubmit}
    >
      {/* Title */}
      <div className="flex flex-col gap-2.5 bg-surface p-2.5">
        <div className="flex items-center justify-between">
          <span className="text-base text-black">
            Post Title <span className="text-brand">*</span>
          </span>
          <button type="button" className="text-base italic text-brand">
            Auto-Fill
          </button>
        </div>
        <input
          id="post-title"
          name="title"
          required
          placeholder="5 Tips for Baking Perfect Cakes"
          className="w-full rounded-[4px] border border-line bg-app px-2 py-1.5 text-base text-ink outline-none placeholder:italic placeholder:text-line focus:border-brand"
        />
      </div>

      {/* Category */}
      <div className="flex flex-col gap-2.5 bg-surface p-2.5">
        <span className="text-base text-black">
          Category <span className="text-brand">*</span>
        </span>
        <select
          id="post-category"
          name="category"
          defaultValue=""
          required
          className="w-full rounded-[4px] border border-line bg-app px-2 py-1.5 text-base text-ink outline-none focus:border-brand"
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
      <div className="flex flex-1 flex-col gap-2.5 bg-surface p-2.5">
        <span className="text-base text-black">
          Post Content <span className="text-brand">*</span>
        </span>
        <div className="flex flex-col overflow-hidden rounded-[5px] border border-line">
          <div className="flex items-center justify-between border-b border-line bg-app p-2.5 text-ink">
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
            id="post-content"
            name="content"
            rows={10}
            required
            placeholder="Content must be at least 100 words."
            className="resize-none bg-surface p-2 text-base text-ink outline-none placeholder:italic placeholder:text-line"
          />
        </div>
        <p className="text-xs font-semibold text-line">
          Review your post to ensure clarity and engagement!
        </p>
        <button
          type="submit"
          className="w-full rounded-[5px] bg-brand px-5 py-1.5 text-xl font-bold text-white shadow-md transition-colors hover:bg-[#e85557]"
        >
          Publish
        </button>
      </div>
    </form>
  );
}
