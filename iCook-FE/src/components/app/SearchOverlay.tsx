"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { SearchIcon, CloseIcon } from "@/components/app/icons";
import RecipeThumbnail from "@/components/app/RecipeThumbnail";
import { usePantry } from "@/components/pantry/PantryProvider";
import { COMMUNITY_AUTHORS } from "@/components/app/user/authors";
import { CURRENT_USER } from "@/components/app/user/data";
import { CATALOG_RECIPES } from "@/components/recipes/SavedRecipesProvider";
import { CATALOG_POSTS } from "@/components/app/postsData";
import { useCreatedContent } from "@/components/app/CreatedContentProvider";
import { rankRecipesByPantry } from "@/lib/pantryMatch";
import { userProfilePath } from "@/lib/userProfile";

const recentSearches = ["Ravioli", "Pancakes", "Courtney Henry", "Quick dinners"];

type SearchHit =
  | {
      kind: "recipe";
      id: string;
      name: string;
      href: string;
      subtitle: string;
      thumbnailUrl?: string;
      category?: (typeof CATALOG_RECIPES)[number]["category"];
    }
  | {
      kind: "post";
      id: string;
      name: string;
      href: string;
      subtitle: string;
      thumbnailUrl?: string;
    }
  | {
      kind: "creator";
      id: string;
      name: string;
      href: string;
      subtitle: string;
    };

const creators: SearchHit[] = [
  {
    kind: "creator",
    id: CURRENT_USER.handle,
    name: CURRENT_USER.name,
    href: userProfilePath(CURRENT_USER.handle),
    subtitle: "Creator",
  },
  ...Object.values(COMMUNITY_AUTHORS).map((user) => ({
    kind: "creator" as const,
    id: user.handle,
    name: user.name,
    href: userProfilePath(user.handle),
    subtitle: "Creator",
  })),
];

export default function SearchOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const { items: pantryItems } = usePantry();
  const { posts: createdPosts } = useCreatedContent();
  const pantryNames = useMemo(
    () => pantryItems.map((i) => i.name).filter((n) => n.trim()),
    [pantryItems],
  );
  const pantryMatchCount = useMemo(
    () => rankRecipesByPantry(CATALOG_RECIPES, pantryNames).length,
    [pantryNames],
  );
  const showPantryOption = pantryMatchCount > 0;

  const handleClose = () => {
    setQuery("");
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 200);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setQuery("");
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const recipes: SearchHit[] = CATALOG_RECIPES.filter((r) =>
      r.name.toLowerCase().includes(q),
    ).map((r) => ({
      kind: "recipe" as const,
      id: r.id,
      name: r.name,
      href: `/recipe/${r.id}`,
      subtitle: "Recipe",
      thumbnailUrl: r.thumbnailUrl,
      category: r.category,
    }));

    const catalogPostHits: SearchHit[] = Object.entries(CATALOG_POSTS)
      .filter(([, p]) => p.title.toLowerCase().includes(q))
      .map(([id, p]) => ({
        kind: "post" as const,
        id,
        name: p.title,
        href: `/post/${id}`,
        subtitle: "Post",
        thumbnailUrl: p.thumbnailUrl,
      }));

    const createdPostHits: SearchHit[] = createdPosts
      .filter((p) => p.title.toLowerCase().includes(q))
      .map((p) => ({
        kind: "post" as const,
        id: p.id,
        name: p.title,
        href: `/post/${p.id}`,
        subtitle: "Post",
        thumbnailUrl: p.thumbnailUrl,
      }));

    const people = creators.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q),
    );

    return [...recipes, ...createdPostHits, ...catalogPostHits, ...people];
  }, [query, createdPosts]);

  return (
    <div
      className={`absolute inset-0 z-30 ${open ? "" : "pointer-events-none"}`}
      role="dialog"
      aria-modal="true"
      aria-label="Search"
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close search"
        tabIndex={open ? 0 : -1}
        onClick={handleClose}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        className={`absolute inset-x-0 top-0 flex h-[42%] flex-col bg-app shadow-xl transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="flex shrink-0 flex-col gap-2 bg-surface px-3 py-2.5 shadow-sm">
          <div className="flex flex-1 items-center gap-2 rounded-sm border border-line bg-app px-3 py-2">
            <SearchIcon className="size-5 text-brand" />
            <input
              ref={inputRef}
              id="global-search"
              name="global-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search recipes, creators, posts"
              aria-label="Search"
              className="flex-1 bg-transparent text-base text-ink outline-none placeholder:italic placeholder:text-line"
            />
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                aria-label="Clear search"
                className="text-muted"
              >
                <CloseIcon className="size-5" aria-hidden />
              </button>
            ) : null}
          </div>

          {showPantryOption ? (
            <Link
              href="/recipes/more?sort=pantry"
              onClick={handleClose}
              tabIndex={open ? 0 : -1}
              className="flex w-full items-center justify-between gap-2 rounded border border-line bg-app px-3 py-2 text-left text-sm text-ink-secondary transition-colors hover:border-brand hover:bg-brand/10 hover:text-brand"
            >
              <span className="min-w-0 flex-1 font-bold">
                Use my pantry ingredients
              </span>
              <span className="shrink-0 text-xs">
                {pantryMatchCount} recipe{pantryMatchCount === 1 ? "" : "s"}
              </span>
            </Link>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {query ? (
            results.length ? (
              <ul className="flex flex-col gap-1">
                {results.map((r) => (
                  <li key={`${r.kind}-${r.id}`}>
                    <Link
                      href={r.href}
                      onClick={handleClose}
                      className="flex items-center gap-3 rounded bg-surface p-2.5"
                    >
                      <RecipeThumbnail
                        className="size-10 shrink-0 rounded"
                        iconClassName="h-5 w-6"
                        src={
                          r.kind === "recipe" || r.kind === "post"
                            ? r.thumbnailUrl
                            : undefined
                        }
                        category={r.kind === "recipe" ? r.category : undefined}
                        alt={r.name}
                      />
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate text-base font-bold text-ink">
                          {r.name}
                        </span>
                        <span className="truncate text-sm text-muted">
                          {r.subtitle}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="pt-4 text-center text-base text-muted">
                No results for &ldquo;{query}&rdquo;.
              </p>
            )
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-base font-bold text-ink">Recent searches</p>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setQuery(term)}
                    className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm text-ink"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
