"use client";

import { useMemo, useState } from "react";
import { SearchIcon } from "@/components/app/icons";
import { INGREDIENT_CATALOG } from "@/components/ingredients/ingredientCatalog";

type IngredientCatalogPickerProps = {
  /** Names already added (case-insensitive). */
  addedNames: Iterable<string>;
  onAdd: (name: string) => void;
  onRemove: (name: string) => void;
  title?: string;
  className?: string;
};

export default function IngredientCatalogPicker({
  addedNames,
  onAdd,
  onRemove,
  title = "Add Ingredients",
  className = "",
}: IngredientCatalogPickerProps) {
  const [query, setQuery] = useState("");

  const added = useMemo(() => {
    const set = new Set<string>();
    for (const n of addedNames) set.add(n.toLowerCase());
    return set;
  }, [addedNames]);

  const filtered = useMemo(
    () =>
      INGREDIENT_CATALOG.filter((i) =>
        i.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [query],
  );

  return (
    <section
      className={`flex min-h-0 flex-col gap-2 border-t border-line bg-surface pt-3 ${className}`}
    >
      <h2 className="section-title px-3">{title}</h2>

      <div className="px-3">
        <div className="search-field">
          <SearchIcon className="size-5 shrink-0 text-brand" />
          <input
            id="ingredient-catalog-search"
            name="ingredient-catalog-search"
            className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:italic placeholder:text-muted"
            placeholder="Search ingredients"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search ingredients"
          />
        </div>
      </div>

      <ul className="min-h-0 flex-1 overflow-y-auto">
        {filtered.map((name) => {
          const isAdded = added.has(name.toLowerCase());
          return (
            <li key={name}>
              <button
                type="button"
                onClick={() => (isAdded ? onRemove(name) : onAdd(name))}
                aria-pressed={isAdded}
                className="flex w-full items-center gap-2 border-b border-line px-3 py-2.5 text-left transition-colors hover:bg-app"
              >
                <span className="min-w-0 flex-1 truncate text-sm text-ink">
                  {name}
                </span>
                <span
                  className={`shrink-0 text-xs font-bold ${
                    isAdded ? "text-brand" : "text-muted"
                  }`}
                >
                  {isAdded ? "Added" : "Add"}
                </span>
              </button>
            </li>
          );
        })}
        {filtered.length === 0 ? (
          <li className="px-3 py-3 text-sm text-muted">
            No matches for &ldquo;{query}&rdquo;.
          </li>
        ) : null}
      </ul>
    </section>
  );
}
