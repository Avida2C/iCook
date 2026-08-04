"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BackIcon } from "@/components/app/icons";

type Person = { name: string; following: boolean };

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);
}

function handleFromName(name: string) {
  return name.replace(/\s+/g, "").toLowerCase();
}

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
          <li className="feed-card px-3 py-8 text-center text-base text-muted">
            No one here yet.
          </li>
        ) : (
          list.map((person) => (
            <li
              key={person.name}
              className="feed-card flex items-center gap-3"
            >
              <Link href="/user" className="avatar" aria-label={person.name}>
                {initials(person.name)}
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  href="/user"
                  className="block truncate text-sm font-bold text-brand"
                >
                  {person.name}
                </Link>
                <p className="flex items-center gap-0.5 text-xs leading-[14px]">
                  <span className="text-brand-soft">@</span>
                  <span className="truncate text-placeholder">
                    {handleFromName(person.name)}
                  </span>
                </p>
              </div>
              <Link
                href="/messages/1"
                aria-label={`Message ${person.name}`}
                className="shrink-0 rounded border border-line px-2.5 py-1.5 text-xs font-bold text-ink-secondary"
              >
                Message
              </Link>
              <button
                type="button"
                onClick={() => toggle(person.name)}
                aria-label={
                  person.following
                    ? `Unfollow ${person.name}`
                    : `Follow ${person.name}`
                }
                aria-pressed={person.following}
                className={
                  person.following
                    ? "shrink-0 rounded border-2 border-brand bg-surface px-2.5 py-1.5 text-xs font-bold text-brand"
                    : "shrink-0 rounded bg-brand px-2.5 py-1.5 text-xs font-bold text-white hover:bg-brand-hover"
                }
              >
                {person.following ? "Following" : "Follow"}
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
