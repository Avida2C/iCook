"use client";

import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const DEFAULT_DELAY_MS = 160;
const DEFAULT_ROOT_MARGIN = "280px 0px";

export type InfiniteFeedEntry<T> = {
  key: string;
  item: T;
};

function resolveScrollRoot(sentinel: HTMLElement): Element | null {
  return (
    sentinel.closest(".feed-stack") ??
    sentinel.closest("main")
  );
}

/** Progressive / looping feed window driven by a bottom sentinel. */
export function useInfiniteFeed<T extends { id: string }>({
  items,
  pageSize,
  resetKey = "",
  cycle = true,
  delayMs = DEFAULT_DELAY_MS,
  rootMargin = DEFAULT_ROOT_MARGIN,
}: {
  items: T[];
  pageSize: number;
  /** Change this to jump back to the first page (filters, search, category). */
  resetKey?: string | number;
  cycle?: boolean;
  delayMs?: number;
  rootMargin?: string;
}) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    setVisibleCount(pageSize);
    loadingRef.current = false;
    setLoadingMore(false);
  }, [resetKey, pageSize]);

  const hasMore = items.length > 0 && (cycle || visibleCount < items.length);

  const loadMore = useCallback(() => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setLoadingMore(true);
    window.setTimeout(() => {
      startTransition(() => {
        setVisibleCount((count) =>
          cycle ? count + pageSize : Math.min(count + pageSize, items.length),
        );
        setLoadingMore(false);
        loadingRef.current = false;
      });
    }, delayMs);
  }, [cycle, delayMs, hasMore, items.length, pageSize]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const root = resolveScrollRoot(sentinel);
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) loadMore();
      },
      { root, rootMargin, threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMore, rootMargin, visibleCount]);

  const entries = useMemo((): InfiniteFeedEntry<T>[] => {
    if (items.length === 0) return [];
    if (!cycle) {
      return items.slice(0, visibleCount).map((item) => ({
        key: item.id,
        item,
      }));
    }
    const count = visibleCount;
    return Array.from({ length: count }, (_, index) => {
      const item = items[index % items.length]!;
      const loop = Math.floor(index / items.length);
      return {
        key: loop === 0 ? item.id : `${item.id}-r${loop}`,
        item,
      };
    });
  }, [cycle, items, visibleCount]);

  return {
    entries,
    loadingMore,
    hasMore,
    sentinelRef,
  };
}
