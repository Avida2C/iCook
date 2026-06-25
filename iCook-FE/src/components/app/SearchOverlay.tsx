"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { SearchIcon, CloseIcon } from "@/components/app/icons";

const recentSearches = ["Ravioli", "Pancakes", "Courtney Henry", "Quick dinners"];

const searchable = [
  { type: "Recipe", name: "Traditional Ravioli", href: "/recipe/1", emoji: "🥟" },
  { type: "Recipe", name: "Blueberry Pancakes", href: "/recipe/1", emoji: "🥞" },
  { type: "Recipe", name: "Raspberry Cheesecake", href: "/recipe/1", emoji: "🍰" },
  { type: "Recipe", name: "Pasta Salad", href: "/recipe/1", emoji: "🥗" },
  { type: "Recipe", name: "Pork Roast", href: "/recipe/1", emoji: "🍖" },
  { type: "Creator", name: "Courtney Henry", href: "/user", emoji: "👩‍🍳" },
  { type: "Creator", name: "Eleanor Pena", href: "/user", emoji: "🧑‍🍳" },
];

export default function SearchOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 200);
      return () => clearTimeout(t);
    }
    setQuery("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return searchable.filter((s) => s.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <div
      className={`absolute inset-0 z-30 ${open ? "" : "pointer-events-none"}`}
      role="dialog"
      aria-modal="true"
      aria-label="Search"
      aria-hidden={!open}
    >
      {/* Backdrop — tap outside to close */}
      <button
        type="button"
        aria-label="Close search"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Sheet — ~40% of the screen, slides from the top */}
      <div
        className={`absolute inset-x-0 top-0 flex h-[42%] flex-col rounded-b-2xl bg-[#f6f7fa] shadow-xl transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="flex shrink-0 items-center rounded-t-2xl bg-white px-3 py-2.5 shadow-sm">
          <div className="flex flex-1 items-center gap-2 rounded-[4px] border border-[#d0d6e8] bg-[#f6f7fa] px-3 py-2">
            <SearchIcon className="size-5 text-brand" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search recipes, creators, posts"
              aria-label="Search"
              className="flex-1 bg-transparent text-base text-[#292929] outline-none placeholder:italic placeholder:text-[#d0d6e8]"
            />
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                aria-label="Clear search"
                className="text-muted"
              >
                <CloseIcon className="size-5" aria-hidden />
              </button>
            ) : null}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {query ? (
            results.length ? (
              <ul className="flex flex-col gap-1">
                {results.map((r) => (
                  <li key={`${r.type}-${r.name}`}>
                    <Link
                      href={r.href}
                      onClick={onClose}
                      className="flex items-center gap-3 rounded-[5px] bg-white p-2.5"
                    >
                      <span className="grid size-10 shrink-0 place-items-center rounded-[5px] bg-[#e9ecf2] text-xl">
                        {r.emoji}
                      </span>
                      <span className="flex flex-col">
                        <span className="text-base font-bold text-[#292929]">
                          {r.name}
                        </span>
                        <span className="text-sm text-muted">{r.type}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="pt-4 text-center text-base text-muted">
                No results for &ldquo;{query}&rdquo;.
              </p>
            )
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-base font-bold text-[#292929]">Recent searches</p>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setQuery(term)}
                    className="rounded-full border border-[#d0d6e8] bg-white px-3 py-1.5 text-sm text-[#292929]"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
