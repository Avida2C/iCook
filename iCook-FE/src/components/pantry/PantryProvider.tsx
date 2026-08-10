"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_PANTRY,
  COMMON_INGREDIENTS,
  INGREDIENT_CATALOG,
  type IngredientLine,
} from "@/components/ingredients/ingredientCatalog";

export type PantryItem = IngredientLine;

export { DEFAULT_PANTRY, COMMON_INGREDIENTS, INGREDIENT_CATALOG };

const STORAGE_KEY = "icook.pantry";

type PantryContextValue = {
  items: PantryItem[];
  addItem: (name: string) => void;
  removeItem: (index: number) => void;
  removeItemByName: (name: string) => void;
  updateItem: (index: number, key: keyof PantryItem, value: string) => void;
};

const PantryContext = createContext<PantryContextValue | null>(null);

function readPantry(): PantryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PANTRY;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_PANTRY;
    return parsed.filter(
      (item): item is PantryItem =>
        item &&
        typeof item === "object" &&
        typeof item.name === "string" &&
        typeof item.amount === "string" &&
        typeof item.unit === "string",
    );
  } catch {
    return DEFAULT_PANTRY;
  }
}

export function PantryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<PantryItem[]>(DEFAULT_PANTRY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(readPantry());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items, hydrated]);

  const addItem = useCallback((name: string) => {
    setItems((prev) =>
      prev.some((i) => i.name.toLowerCase() === name.toLowerCase())
        ? prev
        : [...prev, { name, amount: "1", unit: "" }],
    );
  }, []);

  const removeItem = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const removeItemByName = useCallback((name: string) => {
    setItems((prev) =>
      prev.filter((i) => i.name.toLowerCase() !== name.toLowerCase()),
    );
  }, []);

  const updateItem = useCallback(
    (index: number, key: keyof PantryItem, value: string) => {
      // Names are catalog-locked; only amount/unit are editable.
      if (key === "name") return;
      setItems((prev) =>
        prev.map((it, i) => (i === index ? { ...it, [key]: value } : it)),
      );
    },
    [],
  );

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      removeItemByName,
      updateItem,
    }),
    [items, addItem, removeItem, removeItemByName, updateItem],
  );

  return (
    <PantryContext.Provider value={value}>{children}</PantryContext.Provider>
  );
}

export function usePantry() {
  const ctx = useContext(PantryContext);
  if (!ctx) {
    throw new Error("usePantry must be used within a PantryProvider");
  }
  return ctx;
}
