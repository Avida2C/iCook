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
  "Almonds", "Black Pepper", "Basil", "Boneless Chicken", "Carrots",
  "Cinnamon", "Dill", "Dried Thyme", "Dried Rosemary", "Eggs", "Flour",
  "Garlic Cloves", "Honey", "Iceberg Lettuce", "Jalapeños", "Kale", "Lemon",
  "Milk", "Nutmeg", "Olive Oil", "Parsley", "Quinoa", "Rosemary", "Salt",
  "Sugar", "Thyme", "Ugli Fruit", "Vanilla Extract", "Walnuts", "Xanthan Gum",
  "Yogurt", "Zucchini",
];

export default function HubScreen() {
  const [tab, setTab] = useState<"pantry" | "tools">("pantry");
  const [items, setItems] = useState<Item[]>(initialItems);
  const [query, setQuery] = useState("");

  const fieldClass =
    "rounded-[2px] border border-[#d0d6e8] bg-[#f6f7fa] px-2.5 py-[5px] text-base text-[#292929] outline-none focus:border-brand";

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
  function updateItem(index: number, key: keyof Item, value: string) {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, [key]: value } : it)),
    );
  }

  return (
    <div className="flex min-h-full flex-col bg-white">
      {/* Tabs */}
      <div className="flex shadow-sm">
        {(["pantry", "tools"] as const).map((t) => {
          const active = tab === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 py-4 text-center text-base font-bold ${
                active
                  ? "text-[#1a1a1a] shadow-[inset_0_-2px_0_0_#f76365]"
                  : "text-[#666]"
              }`}
            >
              {t === "pantry" ? "PANTRY" : "COOKING TOOLS"}
            </button>
          );
        })}
      </div>

      {tab === "tools" ? (
        <div className="grid flex-1 place-items-center p-10 text-center text-muted">
          Cooking tools coming soon.
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 px-2.5 py-3">
          {/* Selected ingredients */}
          <div className="flex flex-col border-b-2 border-brand pb-2.5">
            <div className="flex gap-[15px] p-[5px] text-base font-bold text-brand">
              <span className="flex-1">Ingredient</span>
              <span className="w-[59px]">Amount</span>
              <span className="w-[78px]">Unit</span>
              <span className="w-8" />
            </div>
            <div className="flex max-h-[220px] flex-col gap-2.5 overflow-y-auto py-2.5">
              {items.map((item, i) => (
                <div key={`${item.name}-${i}`} className="flex items-center gap-2.5">
                  <input
                    aria-label="Ingredient"
                    className={`min-w-0 flex-1 ${fieldClass}`}
                    value={item.name}
                    onChange={(e) => updateItem(i, "name", e.target.value)}
                  />
                  <input
                    aria-label="Amount"
                    className={`w-[59px] font-bold ${fieldClass}`}
                    value={item.amount}
                    onChange={(e) => updateItem(i, "amount", e.target.value)}
                  />
                  <input
                    aria-label="Unit"
                    className={`w-[78px] font-bold ${fieldClass}`}
                    value={item.unit}
                    onChange={(e) => updateItem(i, "unit", e.target.value)}
                  />
                  <button
                    type="button"
                    aria-label={`Remove ${item.name}`}
                    onClick={() => removeItem(i)}
                    className="shrink-0 text-brand"
                  >
                    <MinusCircleIcon className="size-7" />
                  </button>
                </div>
              ))}
              {items.length === 0 ? (
                <p className="px-1 text-base text-muted">
                  No ingredients yet — add some below.
                </p>
              ) : null}
            </div>
          </div>

          {/* Search */}
          <div className="flex items-center justify-between gap-2 rounded-[4px] border border-[#d0d6e8] bg-[#f6f7fa] px-2.5 py-[5px]">
            <input
              className="flex-1 bg-transparent text-base italic text-[#292929] outline-none placeholder:text-[#d0d6e8]"
              placeholder="Search Ingredients"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search ingredients"
            />
            <SearchIcon className="size-5 text-brand" />
          </div>

          {/* Common ingredients */}
          <ul className="flex max-h-[260px] flex-col overflow-y-auto">
            {filtered.map((name) => (
              <li key={name}>
                <button
                  type="button"
                  onClick={() => addItem(name)}
                  className="w-full border-b border-[#d0d6e8] px-[15px] py-1 text-left text-base text-[#292929] hover:bg-[#f6f7fa]"
                >
                  {name}
                </button>
              </li>
            ))}
            {filtered.length === 0 ? (
              <li className="px-[15px] py-2 text-base text-muted">
                No matches for &ldquo;{query}&rdquo;.
              </li>
            ) : null}
          </ul>
        </div>
      )}
    </div>
  );
}
