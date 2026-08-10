"use client";

import { useMemo } from "react";
import { MinusCircleIcon } from "@/components/app/icons";
import IngredientCatalogPicker from "@/components/ingredients/IngredientCatalogPicker";
import { usePantry } from "@/components/pantry/PantryProvider";

export default function HubScreen() {
  const { items, addItem, removeItem, removeItemByName } = usePantry();

  const addedNames = useMemo(() => items.map((i) => i.name), [items]);

  return (
    <div className="page-fill">
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden py-2">
        <section className="flex min-h-0 flex-1 flex-col gap-2">
          <div className="flex items-center justify-between px-3">
            <h2 className="section-title">My Ingredients</h2>
            <span className="text-xs text-muted">{items.length} items</span>
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
                  <span className="min-w-0 flex-1 truncate px-1 text-sm text-ink">
                    {item.name}
                  </span>
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

        <IngredientCatalogPicker
          className="max-h-[42%] shrink-0"
          addedNames={addedNames}
          onAdd={addItem}
          onRemove={removeItemByName}
        />
      </div>
    </div>
  );
}
