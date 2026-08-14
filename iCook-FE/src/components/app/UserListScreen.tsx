"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BackIcon } from "@/components/app/icons";
import UserAvatar from "@/components/app/UserAvatar";
import UserNameLink from "@/components/app/UserNameLink";
import { resolveAuthor } from "@/components/app/user/authors";
import { messagePath } from "@/components/app/messagesData";
import { userProfilePath } from "@/lib/userProfile";

type Person = { name: string; following: boolean };

export default function UserListScreen({
  title,
  people,
}: {
  title: string;
  people: Person[];
}) {
  const router = useRouter();
  const [list, setList] = useState(people);

  const toggle = (name: string) =>
    setList((prev) =>
      prev.map((p) => (p.name === name ? { ...p, following: !p.following } : p)),
    );

  return (
    <div className="page">
      <div className="subhead">
        <button type="button" onClick={() => router.back()} aria-label="Back">
          <BackIcon className="size-6 text-ink" />
        </button>
        <span className="section-title">{title}</span>
      </div>

      <ul className="list-stack py-2">
        {list.length === 0 ? (
          <li className="feed-card px-3 py-8 text-center text-sm text-muted">
            No one here yet.
          </li>
        ) : (
          list.map((row) => {
            const person = resolveAuthor(row.name);
            return (
            <li
              key={row.name}
              className="feed-card flex items-center gap-3"
            >
              <Link href={userProfilePath(person.handle)} aria-label={person.name}>
                <UserAvatar
                  initials={person.initials}
                  handle={person.handle}
                  src={person.avatarUrl}
                />
              </Link>
              <div className="min-w-0 flex-1">
                <UserNameLink
                  name={person.name}
                  handle={person.handle}
                  className="block truncate text-sm font-bold text-brand"
                />
                <p className="flex items-center gap-0.5 text-xs leading-[14px]">
                  <span className="text-brand-soft">@</span>
                  <Link
                    href={userProfilePath(person.handle)}
                    className="truncate text-placeholder"
                  >
                    {person.handle}
                  </Link>
                </p>
              </div>
              <Link
                href={messagePath(person.handle)}
                aria-label={`Message ${person.name}`}
                className="shrink-0 rounded border border-line px-2.5 py-1.5 text-xs font-bold text-ink-secondary"
              >
                Message
              </Link>
              <button
                type="button"
                onClick={() => toggle(row.name)}
                aria-label={
                  row.following
                    ? `Unfollow ${person.name}`
                    : `Follow ${person.name}`
                }
                aria-pressed={row.following}
                className={
                  row.following
                    ? "shrink-0 rounded border-2 border-brand bg-surface px-2.5 py-1.5 text-xs font-bold text-brand"
                    : "shrink-0 rounded bg-brand px-2.5 py-1.5 text-xs font-bold text-white hover:bg-brand-hover"
                }
              >
                {row.following ? "Following" : "Follow"}
              </button>
            </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
