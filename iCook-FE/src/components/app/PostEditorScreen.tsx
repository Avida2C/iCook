"use client";

import { useEffect, useMemo, useState } from "react";
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
import ThumbnailUploadField from "@/components/app/ThumbnailUploadField";
import RecipeThumbnail from "@/components/app/RecipeThumbnail";
import { MY_RECIPES } from "@/components/app/UserCollectionScreens";
import { isProfileSeedEnabled } from "@/lib/accountData";
import {
  primaryCategory,
  type Recipe,
} from "@/components/recipes/recipesData";

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

export default function PostEditorScreen({
  postId,
}: {
  /** When set, editor runs in edit mode and prefills from getPost. */
  postId?: string;
}) {
  const router = useRouter();
  const {
    publishPost,
    updatePost,
    getPost,
    recipes: createdRecipes,
  } = useCreatedContent();
  const isEdit = Boolean(postId);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [body, setBody] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState<string | undefined>();
  const [linkedRecipeId, setLinkedRecipeId] = useState("");
  const [customThumbnail, setCustomThumbnail] = useState(false);
  const [includeSeeded, setIncludeSeeded] = useState(true);
  const [ready, setReady] = useState(!isEdit);
  const [missing, setMissing] = useState(false);
  const [storageReady, setStorageReady] = useState(!isEdit);

  useEffect(() => {
    setIncludeSeeded(isProfileSeedEnabled());
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    const t = window.setTimeout(() => setStorageReady(true), 0);
    return () => window.clearTimeout(t);
  }, [isEdit]);

  useEffect(() => {
    if (!postId) {
      setTitle("");
      setCategory("");
      setBody("");
      setThumbnailUrl(undefined);
      setLinkedRecipeId("");
      setCustomThumbnail(false);
      setReady(true);
      setMissing(false);
      return;
    }
    if (!storageReady) return;
    const post = getPost(postId);
    if (!post) {
      setMissing(true);
      setReady(true);
      return;
    }
    setTitle(post.title);
    setCategory(post.category ?? "");
    setBody(post.body);
    setThumbnailUrl(post.thumbnailUrl);
    setLinkedRecipeId(post.linkedRecipeId ?? "");
    setCustomThumbnail(Boolean(post.thumbnailUrl && !post.linkedRecipeId));
    setMissing(false);
    setReady(true);
  }, [postId, getPost, storageReady]);

  const ownRecipes = useMemo(() => {
    const createdIds = new Set(createdRecipes.map((r) => r.id));
    const seeded = includeSeeded
      ? MY_RECIPES.filter((r) => !createdIds.has(r.id))
      : [];
    return [...createdRecipes, ...seeded] as Recipe[];
  }, [createdRecipes, includeSeeded]);

  const linkedRecipe = useMemo(
    () => ownRecipes.find((r) => r.id === linkedRecipeId),
    [ownRecipes, linkedRecipeId],
  );

  function onLinkRecipe(id: string) {
    setLinkedRecipeId(id);
    setCustomThumbnail(false);
    if (!id) return;
    const recipe = ownRecipes.find((r) => r.id === id);
    if (recipe) {
      setThumbnailUrl(recipe.thumbnailUrl);
    }
  }

  function onThumbnailChange(dataUrl: string | undefined) {
    if (!dataUrl && linkedRecipe) {
      setCustomThumbnail(false);
      setThumbnailUrl(linkedRecipe.thumbnailUrl);
      return;
    }
    setCustomThumbnail(Boolean(dataUrl));
    setThumbnailUrl(dataUrl);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const nextTitle = title.trim();
    const nextBody = body.trim();
    const nextCategory = category.trim();
    if (!nextTitle || !nextBody || !nextCategory) return;

    const linked = linkedRecipeId
      ? ownRecipes.find((r) => r.id === linkedRecipeId)
      : undefined;

    const input = {
      title: nextTitle,
      body: nextBody,
      category: nextCategory || undefined,
      linkedRecipeId: linked?.id,
      thumbnailUrl:
        thumbnailUrl ||
        (linked && !customThumbnail ? linked.thumbnailUrl : undefined),
    };

    const post =
      isEdit && postId
        ? updatePost(postId, input)
        : publishPost(input);
    if (!post) return;
    router.push(`/post/${post.id}`);
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
        <p className="text-base text-muted">This post could not be found.</p>
        <button
          type="button"
          onClick={() => router.push("/user")}
          className="btn-primary"
        >
          Back to Activity
        </button>
      </div>
    );
  }

  return (
    <form className="page" onSubmit={onSubmit}>
      <div className="list-stack flex-1 py-2">
        <div className="feed-card flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <label htmlFor="post-title" className="section-title">
              Post Title <span className="font-bold">*</span>
            </label>
          </div>
          <input
            id="post-title"
            name="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="5 Tips for Baking Perfect Cakes"
            className="field-sm"
          />
        </div>

        <div className="feed-card flex flex-col gap-2.5">
          <label htmlFor="post-category" className="section-title">
            Category <span className="font-bold">*</span>
          </label>
          <select
            id="post-category"
            name="category"
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="field-sm"
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

        <div className="feed-card flex flex-col gap-2.5">
          <label htmlFor="post-linked-recipe" className="section-title">
            Link a Recipe
          </label>
          <select
            id="post-linked-recipe"
            name="linkedRecipeId"
            value={linkedRecipeId}
            onChange={(e) => onLinkRecipe(e.target.value)}
            className="field-sm"
          >
            <option value="">No linked recipe</option>
            {ownRecipes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          {ownRecipes.length === 0 ? (
            <p className="text-xs italic text-muted">
              Create a recipe first to link it here.
            </p>
          ) : (
            <p className="text-xs italic text-muted">
              Linking your recipe uses its thumbnail for this post.
            </p>
          )}
          {linkedRecipe ? (
            <div className="flex items-center gap-3 rounded border border-line bg-app/60 p-2">
              <RecipeThumbnail
                className="size-14 shrink-0 rounded"
                iconClassName="h-7 w-8"
                src={linkedRecipe.thumbnailUrl}
                category={primaryCategory(linkedRecipe)}
                alt={linkedRecipe.name}
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-ink">
                  {linkedRecipe.name}
                </p>
                <p className="text-xs text-muted">
                  Thumbnail synced from recipe
                  {customThumbnail ? " · overridden by upload" : ""}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="feed-card flex flex-col gap-2.5">
          <span className="section-title">Thumbnail</span>
          <ThumbnailUploadField
            id="post-thumbnail"
            value={thumbnailUrl}
            onChange={onThumbnailChange}
            emptyHint={
              linkedRecipe
                ? "Using linked recipe thumbnail — upload to replace."
                : undefined
            }
            readyHint={
              linkedRecipe && !customThumbnail
                ? "Linked recipe thumbnail — tap above to replace."
                : undefined
            }
          />
        </div>

        <div className="feed-card flex flex-1 flex-col gap-2.5">
          <label htmlFor="post-content" className="section-title">
            Post Content <span className="font-bold">*</span>
          </label>
          <div className="flex flex-col overflow-hidden rounded border border-line">
            <div className="flex items-center justify-between border-b border-line bg-app p-2.5 text-ink-secondary">
              {toolbar.map(({ label, Icon }) => (
                <button
                  key={label}
                  type="button"
                  aria-label={label}
                  className="grid size-6 place-items-center transition-colors hover:text-brand"
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
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Content must be at least 100 words."
              className="resize-none bg-surface p-2.5 text-base text-ink outline-none placeholder:italic placeholder:text-muted"
            />
          </div>
          <p className="text-xs font-semibold text-muted">
            Review your post to ensure clarity and engagement!
          </p>
          <button type="submit" className="btn-primary w-full text-xl">
            {isEdit ? "Save" : "Publish"}
          </button>
        </div>
      </div>
    </form>
  );
}
