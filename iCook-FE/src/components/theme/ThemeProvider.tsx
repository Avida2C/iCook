"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  ACCENT_PALETTES,
  DEFAULT_ACCENT,
  applyAccentPalette,
  getAccentPalette,
  type AccentId,
  type AccentPalette,
} from "@/components/theme/accents";

export type Theme = "light" | "dark";

const THEME_KEY = "icook.theme";
const ACCENT_KEY = "icook.accent";

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  accent: AccentId;
  accents: AccentPalette[];
  setAccent: (accent: AccentId) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // ignore
  }
  if (typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return "light";
}

function readStoredAccent(): AccentId {
  try {
    const stored = localStorage.getItem(ACCENT_KEY);
    if (stored && ACCENT_PALETTES.some((p) => p.id === stored)) {
      return stored as AccentId;
    }
  } catch {
    // ignore
  }
  return DEFAULT_ACCENT;
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [accent, setAccentState] = useState<AccentId>(DEFAULT_ACCENT);

  useEffect(() => {
    const nextTheme = readStoredTheme();
    const nextAccent = readStoredAccent();
    setThemeState(nextTheme);
    setAccentState(nextAccent);
    applyTheme(nextTheme);
    applyAccentPalette(getAccentPalette(nextAccent));
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    applyTheme(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      applyTheme(next);
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const setAccent = useCallback((next: AccentId) => {
    setAccentState(next);
    applyAccentPalette(getAccentPalette(next));
    try {
      localStorage.setItem(ACCENT_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,
        accent,
        accents: ACCENT_PALETTES,
        setAccent,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
