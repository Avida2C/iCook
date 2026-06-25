import Link from "next/link";
import InboxTabs from "@/components/app/InboxTabs";
import { SearchIcon, MicIcon } from "@/components/app/icons";

const friends = [
  { name: "Eleanor Pena", online: true },
  { name: "Robert Fox", online: false },
  { name: "Bessie Cooper", online: false },
  { name: "Guy Hawkins", online: false },
  { name: "Savannah Nguyen", online: false },
];

const conversations = [
  {
    name: "Eleanor Pena",
    last: "Anytime! Let me know how it turns out—I might have to come over for a taste!",
    time: "NOW",
    unread: true,
  },
  { name: "Bessie Cooper", last: "Alright! Talk Soon!", time: "Dec 01", unread: false },
  {
    name: "Guy Hawkins",
    last: "Curry Chicken and White rice is the best, Absolutely Love it!",
    time: "Nov 25",
    unread: false,
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);
}

export default function MessagesScreen() {
  return (
    <div className="flex min-h-full flex-col">
      <InboxTabs active="messages" />

      {/* Search */}
      <div className="p-2.5">
        <div className="flex items-center gap-3 rounded-[4px] border border-[#d0d6e8] bg-white px-3 py-2">
          <SearchIcon className="size-6 text-brand" />
          <input
            className="flex-1 bg-transparent text-base italic text-[#292929] outline-none placeholder:text-[#d0d6e8]"
            placeholder="Search"
            aria-label="Search messages"
          />
          <MicIcon className="size-6 text-brand" />
        </div>
      </div>

      {/* Friends */}
      <div className="flex gap-0 overflow-x-auto px-2.5 pb-2">
        {friends.map((friend) => (
          <Link
            key={friend.name}
            href="/messages/1"
            className="flex w-[90px] shrink-0 flex-col items-center gap-[5px]"
          >
            <div className="relative">
              <span className="grid size-[50px] place-items-center rounded-full bg-brand/15 text-base font-bold text-brand">
                {initials(friend.name)}
              </span>
              {friend.online ? (
                <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-white bg-[#34C759]" />
              ) : null}
            </div>
            <span className="w-20 text-center text-base text-[#292929]">
              {friend.name}
            </span>
          </Link>
        ))}
      </div>

      {/* Messages list */}
      <div className="flex flex-1 flex-col gap-[5px]">
        <div className="bg-white px-2.5 py-[5px]">
          <p className="text-base font-bold text-[#292929]">Messages</p>
        </div>
        {conversations.map((c, i) => (
          <Link
            key={i}
            href="/messages/1"
            className="flex items-start gap-[5px] bg-white p-2.5"
          >
            <span className="grid size-[30px] shrink-0 place-items-center rounded-full bg-brand/15 text-xs font-bold text-brand">
              {initials(c.name)}
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <p className="text-base font-bold text-[#292929]">{c.name}</p>
              <p
                className={`truncate text-base italic ${
                  c.unread ? "font-bold text-[#f79863]" : "text-muted"
                }`}
              >
                {c.last}
              </p>
            </div>
            <span
              className={`shrink-0 text-base italic ${
                c.unread ? "font-bold text-[#292929]" : "text-[#292929]"
              }`}
            >
              {c.time}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
