"use client";

import { MinusCircleIcon } from "@/components/app/icons";
import {
  COMMON_UNITS,
  type IngredientLine,
} from "@/components/ingredients/ingredientCatalog";

type IngredientLineRowProps = {
  item: IngredientLine;
  idPrefix: string;
  onChangeAmount: (value: string) => void;
  onChangeUnit: (value: string) => void;
  onRemove: () => void;
};

export default function IngredientLineRow({
  item,
  idPrefix,
  onChangeAmount,
  onChangeUnit,
  onRemove,
}: IngredientLineRowProps) {
  return (
    <div className="feed-card flex items-center gap-2">
      <span className="min-w-0 flex-1 truncate px-1 text-sm text-ink">
        {item.name}
      </span>
      <input
        id={`${idPrefix}-amount`}
        name={`${idPrefix}-amount`}
        aria-label={`${item.name} amount`}
        className="field w-16 shrink-0 px-2! py-2! text-center text-sm font-bold"
        value={item.amount}
        onChange={(e) => onChangeAmount(e.target.value)}
        placeholder="0"
      />
      <select
        id={`${idPrefix}-unit`}
        name={`${idPrefix}-unit`}
        aria-label={`${item.name} unit`}
        className="field w-18 shrink-0 px-1! py-2! text-center text-sm font-bold"
        value={item.unit}
        onChange={(e) => onChangeUnit(e.target.value)}
      >
        {COMMON_UNITS.map((u) => (
          <option key={u || "none"} value={u}>
            {u || "—"}
          </option>
        ))}
      </select>
      <button
        type="button"
        aria-label={`Remove ${item.name}`}
        onClick={onRemove}
        className="shrink-0 text-brand"
      >
        <MinusCircleIcon className="size-6" />
      </button>
    </div>
  );
}
