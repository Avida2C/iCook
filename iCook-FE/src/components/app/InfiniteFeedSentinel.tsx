import type { Ref } from "react";

/** Bottom-of-feed marker that triggers infinite loading. */
export default function InfiniteFeedSentinel({
  sentinelRef,
  loadingMore,
  hasMore,
}: {
  sentinelRef: Ref<HTMLDivElement>;
  loadingMore: boolean;
  hasMore: boolean;
}) {
  if (!hasMore && !loadingMore) return null;

  return (
    <div
      ref={sentinelRef}
      className="flex min-h-10 items-center justify-center px-3 py-3"
      aria-hidden={!loadingMore}
    >
      <span
        className={`text-xs text-muted transition-opacity duration-200 ${
          loadingMore ? "opacity-100" : "opacity-0"
        }`}
      >
        Loading more&hellip;
      </span>
    </div>
  );
}
