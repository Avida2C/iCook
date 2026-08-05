"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SendIcon, BackIcon } from "@/components/app/icons";
import UserAvatar from "@/components/app/UserAvatar";
import UserNameLink from "@/components/app/UserNameLink";
import { CURRENT_USER } from "@/components/app/user/data";
import { userProfilePath } from "@/lib/userProfile";

type Message = { from: "you" | "them"; text: string; time?: string };

const initialMessages: Message[] = [
  {
    from: "you",
    text: "Hey there! Quick question for you—do you have a good recipe for lasagna? I'm hosting dinner tomorrow, and I want to impress.",
  },
  {
    from: "them",
    time: "09:19",
    text: "Oh, absolutely! My go-to recipe is a classic. Do you want a meat or vegetarian version?",
  },
  { from: "you", text: "Definitely meat. Something hearty." },
  {
    from: "them",
    time: "09:21",
    text: "Perfect. Here's what you do—start with a rich meat sauce. Use ground beef and Italian sausage, simmer it with crushed tomatoes, garlic, onion, and a splash of red wine.",
  },
  { from: "you", text: "Sounds amazing already. What about the layers?" },
  {
    from: "them",
    time: "09:23",
    text: "Keep it simple—no-boil lasagna sheets, ricotta mixed with egg and parsley, mozzarella, and Parmesan. Just alternate the layers and finish with a generous amount of cheese on top.",
  },
  { from: "you", text: "Got it. How long do I bake it?" },
  {
    from: "them",
    time: "09:25",
    text: "About 45 minutes at 375°F, covered with foil. Then uncover and let it brown for another 10-15 minutes. Let it rest before slicing.",
  },
  { from: "you", text: "This is perfect. Thank you so much!" },
  {
    from: "them",
    time: "09:31",
    text: "Anytime! Let me know how it turns out—I might have to come over for a taste!",
  },
];

export default function ChatboxScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");

  function send(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { from: "you", text }]);
    setDraft("");
  }

  return (
    <div className="page-fill">
      <div className="subhead gap-3">
        <button type="button" onClick={() => router.back()} aria-label="Back">
          <BackIcon className="size-6 text-ink" />
        </button>
        <Link href={userProfilePath("eleanorpena")} aria-label="Eleanor Pena">
          <UserAvatar initials="EP" handle="eleanorpena" />
        </Link>
        <div className="min-w-0 flex-1 leading-tight">
          <UserNameLink
            name="Eleanor Pena"
            handle="eleanorpena"
            className="truncate text-sm font-bold text-brand"
          />
          <p className="flex items-center gap-0.5 text-xs leading-[14px]">
            <span className="text-brand-soft">@</span>
            <Link
              href={userProfilePath("eleanorpena")}
              className="truncate text-placeholder"
            >
              eleanorpena
            </Link>
            <span className="text-muted"> · </span>
            <span className="italic text-online">Online</span>
          </p>
        </div>
      </div>

      <div className="list-stack min-h-0 flex-1 overflow-y-auto overscroll-contain py-2">
        {messages.map((message, i) => (
          <div key={i} className="feed-card flex items-start gap-3">
            {message.from === "them" ? (
              <UserAvatar initials="EP" size="sm" />
            ) : (
              <UserAvatar
                initials={CURRENT_USER.initials}
                handle={CURRENT_USER.handle}
                size="sm"
                me
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm font-bold text-brand">
                  {message.from === "them" ? "Eleanor Pena" : "You"}
                </p>
                {message.time ? (
                  <p className="shrink-0 text-xs text-muted">{message.time}</p>
                ) : null}
              </div>
              <p className="mt-1 text-sm leading-5 text-ink-secondary">
                {message.text}
              </p>
            </div>
          </div>
        ))}
      </div>

      <form
        className="flex shrink-0 items-center gap-2 border-t border-line bg-surface px-3 py-2"
        onSubmit={send}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="field flex-1 !py-2 text-sm"
          placeholder="Write a message…"
          aria-label="Message"
        />
        <button type="submit" aria-label="Send" className="shrink-0 text-brand">
          <SendIcon className="size-6" />
        </button>
      </form>
    </div>
  );
}
