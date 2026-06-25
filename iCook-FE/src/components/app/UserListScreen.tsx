"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MessageIcon,
  BackIcon,
  HeartIcon,
  HeartFillIcon,
} from "@/components/app/icons";

type Person = { name: string; following: boolean };

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);
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
    <div className="flex min-h-full flex-col bg-[#f6f7fa]">
      {/* Sub header */}
      <div className="flex items-center gap-4 bg-white px-4 py-2 shadow-sm">
        <button type="button" onClick={() => router.back()} aria-label="Back">
          <BackIcon className="size-6 text-[#1a1a1a]" />
        </button>
        <span className="text-base font-bold text-[#1a1a1a]">{title}</span>
      </div>

      {/* List */}
      <ul className="flex flex-col gap-[5px] py-[5px]">
        {list.map((person) => (
          <li
            key={person.name}
            className="flex items-center gap-2.5 bg-white p-2.5 shadow-sm"
          >
            <Link
              href="/user"
              className="grid size-[30px] shrink-0 place-items-center rounded-full bg-brand/15 text-xs font-bold text-brand"
            >
              {initials(person.name)}
            </Link>
            <Link href="/user" className="flex-1 text-xl font-bold text-[#292929]">
              {person.name}
            </Link>
            <Link
              href="/messages/1"
              aria-label={`Message ${person.name}`}
              className="text-brand"
            >
              <MessageIcon className="size-7" />
            </Link>
            <button
              type="button"
              onClick={() => toggle(person.name)}
              aria-label={person.following ? `Unfollow ${person.name}` : `Follow ${person.name}`}
              aria-pressed={person.following}
              className="text-brand"
            >
              {person.following ? (
                <HeartFillIcon className="size-7" />
              ) : (
                <HeartIcon className="size-7" />
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
