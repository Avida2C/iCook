"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SearchIcon } from "@/components/app/icons";
import UserAvatar from "@/components/app/UserAvatar";
import { useMessages } from "@/components/app/MessagesProvider";
import { messageFriends, messagePath } from "@/components/app/messagesData";

export default function MessagesScreen() {
  const { inbox } = useMessages();
  const [query, setQuery] = useState("");
  const friends = messageFriends();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return inbox;
    return inbox.filter((c) => {
      const hay = `${c.user.name} ${c.handle} ${c.last}`.toLowerCase();
      return hay.includes(q);
    });
  }, [inbox, query]);

  return (
    <div className="page">
      <div className="flex flex-col gap-2 py-2">
        <div className="px-3">
          <div className="search-field">
            <SearchIcon className="size-5 shrink-0 text-brand" />
            <input
              id="messages-search"
              name="messages-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:italic placeholder:text-muted"
              placeholder="Search messages"
              aria-label="Search messages"
            />
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto px-3 pb-1">
          {friends.map(({ user, online }) => (
            <Link
              key={user.handle}
              href={messagePath(user.handle)}
              className="flex w-20 shrink-0 flex-col items-center gap-1.5"
            >
              <div className="relative">
                <UserAvatar
                  initials={user.initials}
                  handle={user.handle}
                  src={user.avatarUrl}
                  size="lg"
                />
                {online ? (
                  <span className="absolute right-0 bottom-0 size-2.5 rounded-full border-2 border-surface bg-success" />
                ) : null}
              </div>
              <span className="w-full truncate text-center text-xs text-ink">
                {user.name.split(" ")[0]}
              </span>
            </Link>
          ))}
        </div>

        <div className="flex items-center justify-between px-3">
          <h2 className="section-title">Messages</h2>
        </div>

        <ul className="list-stack">
          {filtered.length === 0 ? (
            <li className="feed-card px-3 py-8 text-center text-sm text-muted">
              No conversations match that search.
            </li>
          ) : (
            filtered.map((c) => (
              <li key={c.handle}>
                <Link
                  href={messagePath(c.handle)}
                  className="feed-card flex items-start gap-3"
                >
                  <div className="relative shrink-0">
                    <UserAvatar
                      initials={c.user.initials}
                      handle={c.handle}
                      src={c.user.avatarUrl}
                    />
                    {c.online ? (
                      <span className="absolute right-0 bottom-0 size-2.5 rounded-full border-2 border-surface bg-success" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      <p className="min-w-0 flex-1 truncate text-sm font-bold text-brand">
                        {c.user.name}
                      </p>
                      <span
                        className={`shrink-0 text-xs ${
                          c.unread ? "font-bold text-ink" : "text-muted"
                        }`}
                      >
                        {c.time}
                      </span>
                    </div>
                    <p className="mt-0.5 flex items-center gap-0.5 text-xs leading-[14px]">
                      <span className="text-brand-soft">@</span>
                      <span className="truncate text-placeholder">
                        {c.handle}
                      </span>
                    </p>
                    <p
                      className={`mt-1 line-clamp-2 text-xs leading-4 ${
                        c.unread
                          ? "font-bold text-accent-soft"
                          : "text-muted"
                      }`}
                    >
                      {c.lastFrom === "you" ? `You: ${c.last}` : c.last}
                    </p>
                  </div>
                  {c.unread ? (
                    <span
                      className="mt-1.5 size-2 shrink-0 rounded-full bg-brand"
                      aria-label="Unread"
                    />
                  ) : null}
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
