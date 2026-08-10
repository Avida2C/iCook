"use client";

import { useMemo } from "react";
import IngredientCatalogPicker from "@/components/ingredients/IngredientCatalogPicker";
import IngredientLineRow from "@/components/ingredients/IngredientLineRow";
import { usePantry } from "@/components/pantry/PantryProvider";

export default function HubScreen() {
  const { items, addItem, removeItem, removeItemByName, updateItem } =
    usePantry();

  const addedNames = useMemo(() => items.map((i) => i.name), [items]);

  return (
    <div className="page-fill">
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden py-2">
        <section className="flex min-h-0 flex-1 flex-col gap-2">
          <div className="flex items-center justify-between px-3">
            <h2 className="section-title">My Ingredients</h2>
            <span className="text-xs text-muted">{items.length} items</span>
          </div>

          <div className="flex shrink-0 items-center gap-2 px-3 text-xs font-bold text-ink-secondary">
            <span className="min-w-0 flex-1">Ingredient</span>
            <span className="w-16 text-center">Amount</span>
            <span className="w-18 text-center">Unit</span>
            <span className="w-8" />
          </div>

          <div className="list-stack min-h-0 flex-1 overflow-y-auto overscroll-contain px-0">
            {items.length === 0 ? (
              <p className="feed-card text-center text-sm text-muted">
                No ingredients yet — add some below.
              </p>
            ) : (
              items.map((item, i) => (
                <IngredientLineRow
                  key={`${item.name}-${i}`}
                  item={item}
                  idPrefix={`pantry-${i}`}
                  onChangeAmount={(value) => updateItem(i, "amount", value)}
                  onChangeUnit={(value) => updateItem(i, "unit", value)}
                  onRemove={() => removeItem(i)}
                />
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
