"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BackIcon } from "@/components/app/icons";

type Option = { id: string; label: string };
type Group = { title: string; options: Option[] };

const groups: Group[] = [
  {
    title: "Recipe Updates",
    options: [
      { id: "new-recipes", label: "New recipes from followed creators." },
      { id: "trending", label: "Trending or popular recipes." },
      { id: "recommendations", label: "Recommendations based on user preferences." },
    ],
  },
  {
    title: "Reminders",
    options: [
      { id: "cooking", label: "Cooking reminders (e.g., timer alerts, planned meals)." },
      { id: "saved", label: "Notifications for saved or favorited recipes." },
    ],
  },
  {
    title: "Community Activity",
    options: [
      { id: "comments", label: "Comments on your posts." },
      { id: "likes", label: "Likes or reactions on your recipes or posts." },
      { id: "replies", label: "Replies to your comments." },
    ],
  },
  {
    title: "App Announcements",
    options: [
      { id: "features", label: "New features or updates." },
      { id: "promotions", label: "Seasonal or special promotions." },
    ],
  },
];

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative h-5 w-9 shrink-0 rounded-full border-2 border-[#1a1a1a] transition-colors ${
        checked ? "bg-brand" : "bg-[#f2f2f2]"
      }`}
    >
      <span
        className={`absolute top-1/2 size-3 -translate-y-1/2 rounded-full transition-all ${
          checked ? "left-[18px] bg-white" : "left-[2px] bg-[#1a1a1a]"
        }`}
      />
    </button>
  );
}

export default function SettingsNotificationsScreen() {
  const router = useRouter();
  const [state, setState] = useState<Record<string, boolean>>({});
  const [allOff, setAllOff] = useState(true);

  const toggle = (id: string) =>
    setState((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="flex min-h-full flex-col bg-[#f6f7fa]">
      <div className="flex items-center gap-4 bg-white px-4 py-2 shadow-sm">
        <button type="button" onClick={() => router.back()} aria-label="Back">
          <BackIcon className="size-6 text-[#1a1a1a]" />
        </button>
        <span className="text-base font-bold text-[#1a1a1a]">Notifications</span>
      </div>

      <form
        className="flex flex-col gap-6 bg-white p-2.5"
        onSubmit={(e) => e.preventDefault()}
      >
        {groups.map((group) => (
          <section
            key={group.title}
            className="flex flex-col gap-4 border-b border-[#e5e5e5] pb-5"
          >
            <h2 className="text-base font-bold text-black">{group.title}</h2>
            {group.options.map((option) => (
              <div key={option.id} className="flex items-start gap-5">
                <p className="flex-1 text-base italic text-black">
                  {option.label}
                </p>
                <Toggle
                  checked={!!state[option.id]}
                  onChange={() => toggle(option.id)}
                  label={option.label}
                />
              </div>
            ))}
          </section>
        ))}

        <div className="flex items-start gap-5">
          <p className="flex-1 text-base italic text-black">
            Turn-Off all Notifications.
          </p>
          <Toggle
            checked={allOff}
            onChange={() => setAllOff((v) => !v)}
            label="Turn off all notifications"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-[5px] bg-brand px-5 py-1.5 text-xl font-bold text-white shadow-md transition-colors hover:bg-[#e85557]"
        >
          Save Notifications
        </button>
      </form>
    </div>
  );
}
