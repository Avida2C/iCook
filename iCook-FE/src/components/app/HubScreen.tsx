"use client";

import { useMemo, useState } from "react";
import { SearchIcon, MinusCircleIcon } from "@/components/app/icons";

type Item = { name: string; amount: string; unit: string };

const initialItems: Item[] = [
  { name: "Lemon", amount: "5", unit: "Whole" },
  { name: "Garlic Cloves", amount: "2", unit: "Whole" },
  { name: "Olive Oil", amount: "2", unit: "L" },
  { name: "Dried Thyme", amount: "100", unit: "g" },
  { name: "Dried Rosemary", amount: "100", unit: "g" },
  { name: "Salt", amount: "1/4", unit: "tsp" },
  { name: "Black Pepper", amount: "1/4", unit: "tsp" },
];

const commonIngredients = [
  "Almonds",
  "Black Pepper",
  "Basil",
  "Boneless Chicken",
  "Carrots",
  "Cinnamon",
  "Dill",
  "Dried Thyme",
  "Dried Rosemary",
  "Eggs",
  "Flour",
  "Garlic Cloves",
  "Honey",
  "Iceberg Lettuce",
  "Jalapeños",
  "Kale",
  "Lemon",
  "Milk",
  "Nutmeg",
  "Olive Oil",
  "Parsley",
  "Quinoa",
  "Rosemary",
  "Salt",
  "Sugar",
  "Thyme",
  "Ugli Fruit",
  "Vanilla Extract",
  "Walnuts",
  "Xanthan Gum",
  "Yogurt",
  "Zucchini",
];

export default function HubScreen() {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      commonIngredients.filter((i) =>
        i.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [query],
  );

  function addItem(name: string) {
    setItems((prev) =>
      prev.some((i) => i.name === name)
        ? prev
        : [...prev, { name, amount: "1", unit: "" }],
    );
  }
  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }
  function removeItemByName(name: string) {
    setItems((prev) => prev.filter((i) => i.name !== name));
  }
  function updateItem(index: number, key: keyof Item, value: string) {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, [key]: value } : it)),
    );
  }

  const addedNames = useMemo(
    () => new Set(items.map((i) => i.name.toLowerCase())),
    [items],
  );

  return (
    <div className="page-fill">
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden py-2">
        {/* My ingredients */}
        <section className="flex min-h-0 flex-1 flex-col gap-2">
          <div className="flex items-center justify-between px-3">
            <h2 className="section-title">My Ingredients</h2>
            <span className="text-xs text-muted">{items.length} items</span>
          </div>

          <div className="flex shrink-0 items-center gap-2 px-3 text-xs font-bold text-ink-secondary">
            <span className="min-w-0 flex-1">Ingredient</span>
            <span className="w-16 text-center">Amount</span>
            <span className="w-[4.5rem] text-center">Unit</span>
            <span className="w-8" />
          </div>

          <div className="list-stack min-h-0 flex-1 overflow-y-auto overscroll-contain px-0">
            {items.length === 0 ? (
              <p className="feed-card text-center text-sm text-muted">
                No ingredients yet — add some below.
              </p>
            ) : (
              items.map((item, i) => (
                <div
                  key={`${item.name}-${i}`}
                  className="feed-card flex items-center gap-2"
                >
                  <input
                    aria-label="Ingredient"
                    className="field min-w-0 flex-1 !px-2.5 !py-2 text-sm"
                    value={item.name}
                    onChange={(e) => updateItem(i, "name", e.target.value)}
                    placeholder="Ingredient"
                  />
                  <input
                    aria-label="Amount"
                    className="field w-16 shrink-0 !px-2 !py-2 text-center text-sm font-bold"
                    value={item.amount}
                    onChange={(e) => updateItem(i, "amount", e.target.value)}
                    placeholder="0"
                  />
                  <input
                    aria-label="Unit"
                    className="field w-[4.5rem] shrink-0 !px-2 !py-2 text-center text-sm font-bold"
                    value={item.unit}
                    onChange={(e) => updateItem(i, "unit", e.target.value)}
                    placeholder="unit"
                  />
                  <button
                    type="button"
                    aria-label={`Remove ${item.name}`}
                    onClick={() => removeItem(i)}
                    className="shrink-0 text-brand"
                  >
                    <MinusCircleIcon className="size-6" />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Add ingredients */}
        <section className="flex max-h-[42%] min-h-0 shrink-0 flex-col gap-2 border-t border-line bg-surface pt-3">
          <h2 className="section-title px-3">Add Ingredients</h2>

          <div className="px-3">
            <div className="search-field">
              <SearchIcon className="size-5 shrink-0 text-brand" />
              <input
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
              const added = addedNames.has(name.toLowerCase());
              return (
                <li key={name}>
                  <button
                    type="button"
                    onClick={() =>
                      added ? removeItemByName(name) : addItem(name)
                    }
                    aria-pressed={added}
                    className="flex w-full items-center gap-2 border-b border-line px-3 py-2.5 text-left transition-colors hover:bg-app"
                  >
                    <span className="min-w-0 flex-1 truncate text-sm text-ink">
                      {name}
                    </span>
                    <span
                      className={`shrink-0 text-xs font-bold ${
                        added ? "text-brand" : "text-muted"
                      }`}
                    >
                      {added ? "Added" : "Add"}
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
      </div>
    </div>
  );
}
