export type AccentId =
  | "coral"
  | "yellow"
  | "green"
  | "blue"
  | "violet"
  | "teal";

export type AccentPalette = {
  id: AccentId;
  label: string;
  brand: string;
  brandSoft: string;
  brandHover: string;
  accentSoft: string;
};

export const ACCENT_PALETTES: AccentPalette[] = [
  {
    id: "coral",
    label: "Coral",
    brand: "#f76365",
    brandSoft: "#fda676",
    brandHover: "#e85557",
    accentSoft: "#f79863",
  },
  {
    id: "yellow",
    label: "Yellow",
    brand: "#e5a800",
    brandSoft: "#f0c94d",
    brandHover: "#c99200",
    accentSoft: "#f2c94a",
  },
  {
    id: "green",
    label: "Green",
    brand: "#2f9e6b",
    brandSoft: "#7bc49a",
    brandHover: "#268557",
    accentSoft: "#6dbf8c",
  },
  {
    id: "blue",
    label: "Blue",
    brand: "#3b7ddd",
    brandSoft: "#7aa7eb",
    brandHover: "#2f68c0",
    accentSoft: "#6b9ae6",
  },
  {
    id: "violet",
    label: "Violet",
    brand: "#8b5cf6",
    brandSoft: "#b794f6",
    brandHover: "#7c49e8",
    accentSoft: "#a78bfa",
  },
  {
    id: "teal",
    label: "Teal",
    brand: "#0d9488",
    brandSoft: "#5ec4b8",
    brandHover: "#0b7c72",
    accentSoft: "#4db8ab",
  },
];

export const DEFAULT_ACCENT: AccentId = "coral";

export function getAccentPalette(id: string | null | undefined): AccentPalette {
  return (
    ACCENT_PALETTES.find((p) => p.id === id) ??
    ACCENT_PALETTES.find((p) => p.id === DEFAULT_ACCENT)!
  );
}

export function applyAccentPalette(palette: AccentPalette) {
  const root = document.documentElement;
  root.style.setProperty("--brand", palette.brand);
  root.style.setProperty("--brand-soft", palette.brandSoft);
  root.style.setProperty("--brand-hover", palette.brandHover);
  root.style.setProperty("--accent-soft", palette.accentSoft);
  root.dataset.accent = palette.id;
}
