import Link from "next/link";
import { SearchIcon } from "@/components/app/icons";
import { CONVERSATIONS } from "@/components/app/messagesData";

const friends = [
  { name: "Eleanor Pena", online: true },
  { name: "Robert Fox", online: false },
  { name: "Bessie Cooper", online: false },
  { name: "Guy Hawkins", online: false },
  { name: "Savannah Nguyen", online: false },
];

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

export default function MessagesScreen() {
  return (
    <div className="page">
      <div className="flex flex-col gap-2 py-2">
        <div className="px-3">
          <div className="search-field">
            <SearchIcon className="size-5 shrink-0 text-brand" />
            <input
              className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:italic placeholder:text-muted"
              placeholder="Search messages"
              aria-label="Search messages"
            />
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto px-3 pb-1">
          {friends.map((friend) => (
            <Link
              key={friend.name}
              href="/messages/1"
              className="flex w-20 shrink-0 flex-col items-center gap-1.5"
            >
              <div className="relative">
                <span className="grid size-14 place-items-center rounded-full bg-brand/15 text-sm font-bold text-brand">
                  {initials(friend.name)}
                </span>
                {friend.online ? (
                  <span className="absolute right-0 bottom-0 size-2.5 rounded-full border-2 border-surface bg-success" />
                ) : null}
              </div>
              <span className="w-full truncate text-center text-xs text-ink">
                {friend.name.split(" ")[0]}
              </span>
            </Link>
          ))}
        </div>

        <div className="flex items-center justify-between px-3">
          <h2 className="section-title">Messages</h2>
        </div>

        <ul className="list-stack">
          {CONVERSATIONS.map((c) => (
            <li key={c.name}>
              <Link
                href="/messages/1"
                className="feed-card flex items-start gap-3"
              >
                <span className="avatar">{initials(c.name)}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-2">
                    <p className="min-w-0 flex-1 truncate text-sm font-bold text-brand">
                      {c.name}
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
                      {c.handle ?? handleFromName(c.name)}
                    </span>
                  </p>
                  <p
                    className={`mt-1 line-clamp-2 text-xs leading-4 ${
                      c.unread
                        ? "font-bold text-accent-soft"
                        : "text-muted"
                    }`}
                  >
                    {c.last}
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
          ))}
        </ul>
      </div>
    </div>
  );
}
