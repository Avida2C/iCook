"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { SearchIcon, MessageIcon } from "@/components/app/icons";
import { useMessages } from "@/components/app/MessagesProvider";

/** Top app bar shared across logged-in screens: logo + search/messages. */
export default function AppBar({
  onSearchClick,
}: {
  onSearchClick: () => void;
}) {
  const { unreadCount } = useMessages();
  const prevUnread = useRef(unreadCount);
  const [badgePop, setBadgePop] = useState(false);

  useEffect(() => {
    if (unreadCount > prevUnread.current) {
      setBadgePop(true);
      const t = window.setTimeout(() => setBadgePop(false), 900);
      prevUnread.current = unreadCount;
      return () => window.clearTimeout(t);
    }
    prevUnread.current = unreadCount;
  }, [unreadCount]);

  return (
    <header className="relative z-10 flex shrink-0 items-center justify-between bg-surface px-3 pt-4 pb-1 shadow-bar sm:-mt-11 sm:pt-[3.25rem]">
      <Link href="/recipes" aria-label="iCook home">
        <Logo className="text-3xl" />
      </Link>
      <nav className="flex items-center gap-5 text-brand">
        <button type="button" onClick={onSearchClick} aria-label="Search">
          <SearchIcon className="size-7" />
        </button>
        <Link
          href="/messages"
          aria-label={
            unreadCount === 0
              ? "Messages"
              : unreadCount === 1
                ? "Messages, 1 unread"
                : `Messages, ${unreadCount} unread conversations`
          }
          className="relative"
        >
          <MessageIcon className="size-7" />
          {unreadCount === 1 ? (
            <span
              className={`absolute -top-1 -right-1.5 grid min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] leading-4 font-bold text-white ${
                badgePop ? "msg-badge-pop" : ""
              }`}
            >
              1
            </span>
          ) : unreadCount > 1 ? (
            <span
              className={`absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-brand ${
                badgePop ? "msg-badge-pop" : ""
              }`}
              aria-hidden
            />
          ) : null}
        </Link>
      </nav>
    </header>
  );
}
