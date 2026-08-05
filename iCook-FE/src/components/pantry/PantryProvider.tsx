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

export type PantryItem = { name: string; amount: string; unit: string };

const STORAGE_KEY = "icook.pantry";

export const DEFAULT_PANTRY: PantryItem[] = [
  { name: "Lemon", amount: "5", unit: "Whole" },
  { name: "Garlic Cloves", amount: "2", unit: "Whole" },
  { name: "Olive Oil", amount: "2", unit: "L" },
  { name: "Dried Thyme", amount: "100", unit: "g" },
  { name: "Dried Rosemary", amount: "100", unit: "g" },
  { name: "Salt", amount: "1/4", unit: "tsp" },
  { name: "Black Pepper", amount: "1/4", unit: "tsp" },
];

export const COMMON_INGREDIENTS = [
  "Almonds",
  "Black Pepper",
  "Basil",
  "Blueberries",
  "Boneless Chicken",
  "Butter",
  "Carrots",
  "Chocolate",
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
  "Pasta",
  "Pork",
  "Potatoes",
  "Quinoa",
  "Raspberries",
  "Ricotta",
  "Rosemary",
  "Salmon",
  "Salt",
  "Spinach",
  "Steak",
  "Sugar",
  "Thyme",
  "Tomatoes",
  "Ugli Fruit",
  "Vanilla Extract",
  "Walnuts",
  "Xanthan Gum",
  "Yogurt",
  "Zucchini",
] as const;

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
