"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SendIcon, BackIcon } from "@/components/app/icons";

type Message = { from: "you" | "them"; text: string; time?: string };

const initialMessages: Message[] = [
  { from: "you", text: "Hey there! Quick question for you—do you have a good recipe for lasagna? I’m hosting dinner tomorrow, and I want to impress." },
  { from: "them", time: "09:19", text: "Oh, absolutely! My go-to recipe is a classic. Do you want a meat or vegetarian version?" },
  { from: "you", text: "Definitely meat. Something hearty." },
  { from: "them", time: "09:21", text: "Perfect. Here’s what you do—start with a rich meat sauce. Use ground beef and Italian sausage, simmer it with crushed tomatoes, garlic, onion, and a splash of red wine." },
  { from: "you", text: "Sounds amazing already. What about the layers?" },
  { from: "them", time: "09:23", text: "Keep it simple—no-boil lasagna sheets, ricotta mixed with egg and parsley, mozzarella, and Parmesan. Just alternate the layers and finish with a generous amount of cheese on top." },
  { from: "you", text: "Got it. How long do I bake it?" },
  { from: "them", time: "09:25", text: "About 45 minutes at 375°F, covered with foil. Then uncover and let it brown for another 10-15 minutes. Let it rest before slicing." },
  { from: "you", text: "This is perfect. Thank you so much!" },
  { from: "them", time: "09:31", text: "Anytime! Let me know how it turns out—I might have to come over for a taste!" },
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
    <div className="flex h-full flex-col">
      {/* Conversation header */}
      <div className="flex items-center gap-4 bg-white px-4 py-2.5 shadow-sm">
        <button type="button" onClick={() => router.back()} aria-label="Back">
          <BackIcon className="size-6 text-[#1a1a1a]" />
        </button>
        <span className="grid size-[45px] place-items-center rounded-full bg-brand/15 text-base font-bold text-brand">
          EP
        </span>
        <div className="leading-tight">
          <p className="text-base font-bold text-[#292929]">Eleanor Pena</p>
          <p className="text-base italic text-[#00a023]">Online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex min-h-0 flex-1 flex-col gap-[5px] overflow-y-auto pt-[5px]">
        {messages.map((message, i) => (
          <div
            key={i}
            className="flex items-start gap-2.5 border-b-2 border-brand bg-white px-2.5 py-4"
          >
            {message.from === "them" ? (
              <span className="grid size-[30px] shrink-0 place-items-center rounded-full bg-brand/15 text-xs font-bold text-brand">
                EP
              </span>
            ) : null}
            <div
              className={`flex flex-1 flex-col gap-[5px] ${
                message.from === "you" ? "text-right" : ""
              }`}
            >
              {message.from === "them" ? (
                <div className="flex justify-between text-[#292929]">
                  <p className="font-bold">Eleanor Pena</p>
                  <p className="italic">{message.time}</p>
                </div>
              ) : (
                <p className="font-bold text-[#292929]">You</p>
              )}
              <p className="italic text-muted">{message.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <form className="flex items-center bg-white p-[5px]" onSubmit={send}>
        <div className="flex flex-1 items-center gap-1.5 rounded-[5px] bg-[#f6f7fa] px-2.5 py-1.5">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="flex-1 bg-transparent py-1.5 text-base font-bold text-[#292929] outline-none placeholder:text-muted"
            placeholder="Write a comment!"
            aria-label="Message"
          />
          <button type="submit" aria-label="Send" className="text-brand">
            <SendIcon className="size-6" />
          </button>
        </div>
      </form>
    </div>
  );
}
