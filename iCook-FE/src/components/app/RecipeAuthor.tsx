"use client";

import Link from "next/link";
import { userProfilePath } from "@/lib/userProfile";
import { resolveAuthor } from "@/components/app/user/authors";
import { useCurrentFeedUser } from "@/components/app/user/useCurrentFeedUser";

/** Compact author row for recipe cards: linked @handle only. */
export default function RecipeAuthor({
  author,
  className = "",
}: {
  /** Catalog author string, handle, or `"you"`. */
  author: string;
  className?: string;
}) {
  const me = useCurrentFeedUser();
  const user = resolveAuthor(author, me);

  return (
    <Link
      href={userProfilePath(user.handle, me.handle)}
      className={`flex min-w-0 items-center gap-0.5 py-0.5 text-xs leading-3.5 ${className}`}
      aria-label={`${user.name} (@${user.handle})`}
    >
      <span className="text-brand-soft">@</span>
      <span className="truncate text-placeholder">{user.handle}</span>
    </Link>
  );
}
