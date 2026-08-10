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
  type PantryIngredient,
} from "@/components/ingredients/ingredientCatalog";

export type PantryItem = PantryIngredient;

export { DEFAULT_PANTRY, COMMON_INGREDIENTS, INGREDIENT_CATALOG };

const STORAGE_KEY = "icook.pantry";

type PantryContextValue = {
  items: PantryItem[];
  addItem: (name: string) => void;
  removeItem: (index: number) => void;
  removeItemByName: (name: string) => void;
};

const PantryContext = createContext<PantryContextValue | null>(null);

function readPantry(): PantryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PANTRY;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_PANTRY;
    const seen = new Set<string>();
    const items: PantryItem[] = [];
    for (const item of parsed) {
      const name =
        typeof item === "string"
          ? item.trim()
          : item && typeof item === "object" && typeof item.name === "string"
            ? String(item.name).trim()
            : "";
      if (!name) continue;
      const key = name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      items.push({ name });
    }
    return items.length > 0 ? items : DEFAULT_PANTRY;
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
        : [...prev, { name }],
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

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      removeItemByName,
    }),
    [items, addItem, removeItem, removeItemByName],
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
