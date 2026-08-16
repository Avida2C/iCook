"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EditIcon, EyeIcon, TrashIcon } from "@/components/app/icons";
import RecipeThumbnail from "@/components/app/RecipeThumbnail";
import {
  useCreatedContent,
  type CreatedPost,
  type CreatedRecipe,
} from "@/components/app/CreatedContentProvider";
import { isOwnAuthor } from "@/components/app/user/authors";
import { useCurrentFeedUser } from "@/components/app/user/useCurrentFeedUser";
import {
  formatRecipeCreatedDate,
  primaryCategory,
} from "@/components/recipes/recipesData";
import Switch from "@/components/Switch";
import {
  DEFAULT_FEATURED_RECIPE_PREFS,
  readFeaturedRecipePrefs,
  writeFeaturedRecipePrefs,
  type FeaturedRecipePrefs,
} from "@/lib/featuredRecipePrefs";
import { plainTextFromHtml } from "@/lib/postRichText";

type Filter = "all" | "recipes" | "posts";

type LibraryItem =
  | { kind: "recipe"; createdAt: number; recipe: CreatedRecipe }
  | { kind: "post"; createdAt: number; post: CreatedPost };

export default function CreatedLibraryScreen() {
  const router = useRouter();
  const me = useCurrentFeedUser();
  const {
    posts,
    recipes,
    deletePost,
    deleteRecipe,
    setPostPrivate,
    setRecipePrivate,
  } = useCreatedContent();
  const [filter, setFilter] = useState<Filter>("all");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [featuredPrefs, setFeaturedPrefs] = useState<FeaturedRecipePrefs>(
    DEFAULT_FEATURED_RECIPE_PREFS,
  );

  useEffect(() => {
    setFeaturedPrefs(readFeaturedRecipePrefs(me.handle));
  }, [me.handle]);

  const persistFeatured = (next: FeaturedRecipePrefs) => {
    const prefs = { ...next, layout: "hero" as const };
    setFeaturedPrefs(prefs);
    writeFeaturedRecipePrefs(me.handle, prefs);
  };

  const items = useMemo(() => {
    const ownRecipes = recipes.filter((r) => isOwnAuthor(r.author, me));
    const ownPosts = posts.filter((p) => isOwnAuthor(p.author, me));
    const list: LibraryItem[] = [
      ...ownRecipes.map((recipe) => ({
        kind: "recipe" as const,
        createdAt: recipe.createdAt,
        recipe,
      })),
      ...ownPosts.map((post) => ({
        kind: "post" as const,
        createdAt: post.createdAt,
        post,
      })),
    ];
    return list.sort((a, b) => b.createdAt - a.createdAt);
  }, [recipes, posts, me]);

  const featureableRecipes = useMemo(
    () =>
      items
        .filter(
          (item): item is Extract<LibraryItem, { kind: "recipe" }> =>
            item.kind === "recipe" && !item.recipe.isPrivate,
        )
        .map((item) => item.recipe),
    [items],
  );

  const featuredValue =
    featuredPrefs.recipeId &&
    featureableRecipes.some((recipe) => recipe.id === featuredPrefs.recipeId)
      ? featuredPrefs.recipeId
      : "";

  const tabCounts: Record<Filter, number> = {
    all: items.length,
    recipes: items.filter((item) => item.kind === "recipe").length,
    posts: items.filter((item) => item.kind === "post").length,
  };

  const visible = items.filter((item) => {
    if (filter === "all") return true;
    if (filter === "recipes") return item.kind === "recipe";
    return item.kind === "post";
  });

  const panelTitle =
    filter === "recipes" ? "Recipes" : filter === "posts" ? "Posts" : "All";

  const onDelete = (kind: "recipe" | "post", id: string) => {
    if (confirmId !== id) {
      setConfirmId(id);
      return;
    }
    if (kind === "recipe") {
      deleteRecipe(id);
      if (featuredPrefs.recipeId === id) {
        persistFeatured({ ...featuredPrefs, recipeId: null });
      }
    } else {
      deletePost(id);
    }
    setConfirmId(null);
  };

  const onToggleRecipePrivate = (id: string, isPrivate: boolean) => {
    setRecipePrivate(id, isPrivate);
    if (isPrivate && featuredPrefs.recipeId === id) {
      persistFeatured({ ...featuredPrefs, recipeId: null });
    }
  };

  const libraryTabs = [
    ["all", "All"],
    ["recipes", "Recipes"],
    ["posts", "Posts"],
  ] as const;

  return (
    <div className="page-fill w-full min-w-0">
      <div className="surface-block shrink-0">
        <div className="flex flex-col gap-3 px-4 pt-4 pb-3">
          <div>
            <h1 className="section-title">My Creations</h1>
            <p className="mt-1 text-sm text-ink-secondary">
              You can preview, edit, delete, or privatize your recipes and posts, and feature your favorite public recipe on your profile. New items remain hidden from others until the public timer expires, giving you time to make any final changes.
            </p>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-ink-secondary">
              Featured on profile
            </span>
            <select
              id="featured-recipe"
              className="field-sm"
              value={featuredValue}
              disabled={featureableRecipes.length === 0}
              onChange={(e) =>
                persistFeatured({
                  ...featuredPrefs,
                  recipeId: e.target.value || null,
                })
              }
            >
              <option value="">None</option>
              {featureableRecipes.map((recipe) => (
                <option key={recipe.id} value={recipe.id}>
                  {recipe.name}
                </option>
              ))}
            </select>
          </label>

        </div>

        <div
          className="grid grid-cols-3 border-t border-line"
          role="tablist"
          aria-label="Filter your content"
        >
          {libraryTabs.map(([id, label]) => {
            const active = filter === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(id)}
                className={`flex flex-col items-center justify-center gap-0.5 px-0.5 py-2.5 ${
                  active ? "tab-underline" : "tab-underline-idle"
                }`}
              >
                <span className="text-base font-bold text-brand">
                  {tabCounts[id]}
                </span>
                <span
                  className={`text-center text-[10px] leading-tight ${
                    active ? "font-bold text-brand" : "text-muted"
                  }`}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="feed-stack w-full min-w-0 touch-pan-y">
        <div className="px-3">
          <h2 className="section-title">{panelTitle}</h2>
        </div>

        {visible.length === 0 ? (
          <section className="feed-card flex flex-col items-center gap-3 py-10">
            <p className="text-center text-base text-muted">
              {filter === "posts"
                ? "You have not written any posts yet."
                : filter === "recipes"
                  ? "You have not created any recipes yet."
                  : "Nothing here yet — create a recipe or write a post."}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {filter !== "posts" ? (
                <Link href="/create/recipe" className="btn-primary text-sm">
                  Create a Recipe
                </Link>
              ) : null}
              {filter !== "recipes" ? (
                <Link href="/create/post" className="btn-secondary text-sm">
                  Write a Post
                </Link>
              ) : null}
            </div>
          </section>
        ) : (
          visible.map((item) =>
            item.kind === "recipe" ? (
              <article key={item.recipe.id} className="feed-card flex flex-col gap-2">
                <p className="text-xs font-bold text-muted">Recipe</p>
                <div className="flex gap-3">
                  <Link
                    href={`/recipe/${item.recipe.id}`}
                    className="relative size-20 shrink-0 overflow-hidden rounded border border-line"
                  >
                    <RecipeThumbnail
                      className="size-full"
                      iconClassName="h-8 w-9"
                      src={item.recipe.thumbnailUrl}
                      category={primaryCategory(item.recipe)}
                      alt={item.recipe.name}
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/recipe/${item.recipe.id}`}
                      className="block truncate text-sm font-bold text-ink"
                    >
                      {item.recipe.name}
                    </Link>
                    <p className="text-xs text-muted">
                      {formatRecipeCreatedDate(item.recipe.createdAt)}
                      {featuredPrefs.recipeId === item.recipe.id
                        ? " · Featured"
                        : ""}
                    </p>
                    {item.recipe.preview ? (
                      <p className="mt-0.5 line-clamp-2 text-xs leading-4 text-ink-secondary">
                        {item.recipe.preview}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-line pt-2">
                  <label className="flex min-w-0 items-center gap-2 text-xs font-bold text-ink-secondary">
                    <Switch
                      checked={Boolean(item.recipe.isPrivate)}
                      onChange={() =>
                        onToggleRecipePrivate(
                          item.recipe.id,
                          !item.recipe.isPrivate,
                        )
                      }
                      label={`Make ${item.recipe.name} private`}
                    />
                    <span>Private</span>
                  </label>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      aria-label={`Preview ${item.recipe.name}`}
                      onClick={() => router.push(`/recipe/${item.recipe.id}`)}
                      className="rounded p-1.5 text-brand hover:bg-brand/10"
                    >
                      <EyeIcon className="size-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Edit ${item.recipe.name}`}
                      onClick={() =>
                        router.push(`/recipe/${item.recipe.id}/edit`)
                      }
                      className="rounded p-1.5 text-brand hover:bg-brand/10"
                    >
                      <EditIcon className="size-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={
                        confirmId === item.recipe.id
                          ? `Confirm delete ${item.recipe.name}`
                          : `Delete ${item.recipe.name}`
                      }
                      onClick={() => onDelete("recipe", item.recipe.id)}
                      className="rounded p-1.5 text-brand hover:bg-brand/10"
                    >
                      <TrashIcon className="size-4" />
                    </button>
                  </div>
                </div>
                {confirmId === item.recipe.id ? (
                  <p className="text-xs text-muted">Tap delete again to confirm.</p>
                ) : null}
              </article>
            ) : (
              <article key={item.post.id} className="feed-card flex flex-col gap-2">
                <p className="text-xs font-bold text-muted">Post</p>
                <div className="flex gap-3">
                  <Link
                    href={`/post/${item.post.id}`}
                    className="relative size-20 shrink-0 overflow-hidden rounded border border-line"
                  >
                    <RecipeThumbnail
                      className="size-full"
                      iconClassName="h-8 w-9"
                      src={item.post.thumbnailUrl}
                      alt={item.post.title}
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/post/${item.post.id}`}
                      className="block truncate text-sm font-bold text-ink"
                    >
                      {item.post.title}
                    </Link>
                    <p className="text-xs text-muted">
                      {formatRecipeCreatedDate(item.post.createdAt)}
                    </p>
                    {item.post.body ? (
                      <p className="mt-0.5 line-clamp-2 text-xs leading-4 text-ink-secondary">
                        {plainTextFromHtml(item.post.body)}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-line pt-2">
                  <label className="flex min-w-0 items-center gap-2 text-xs font-bold text-ink-secondary">
                    <Switch
                      checked={Boolean(item.post.isPrivate)}
                      onChange={() =>
                        setPostPrivate(item.post.id, !item.post.isPrivate)
                      }
                      label={`Make ${item.post.title} private`}
                    />
                    <span>Private</span>
                  </label>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      aria-label={`Preview ${item.post.title}`}
                      onClick={() => router.push(`/post/${item.post.id}`)}
                      className="rounded p-1.5 text-brand hover:bg-brand/10"
                    >
                      <EyeIcon className="size-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Edit ${item.post.title}`}
                      onClick={() => router.push(`/post/${item.post.id}/edit`)}
                      className="rounded p-1.5 text-brand hover:bg-brand/10"
                    >
                      <EditIcon className="size-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={
                        confirmId === item.post.id
                          ? `Confirm delete ${item.post.title}`
                          : `Delete ${item.post.title}`
                      }
                      onClick={() => onDelete("post", item.post.id)}
                      className="rounded p-1.5 text-brand hover:bg-brand/10"
                    >
                      <TrashIcon className="size-4" />
                    </button>
                  </div>
                </div>
                {confirmId === item.post.id ? (
                  <p className="text-xs text-muted">Tap delete again to confirm.</p>
                ) : null}
              </article>
            ),
          )
        )}
      </div>
    </div>
  );
}
