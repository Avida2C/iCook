"use client";

import { useMemo, useState } from "react";
import Switch from "@/components/Switch";

type Option = { id: string; label: string; hint?: string };
type Group = { title: string; options: Option[] };

const groups: Group[] = [
  {
    title: "Recipe Updates",
    options: [
      {
        id: "new-recipes",
        label: "New recipes",
        hint: "From creators you follow",
      },
      {
        id: "trending",
        label: "Trending recipes",
        hint: "Popular picks across the community",
      },
      {
        id: "recommendations",
        label: "Recommendations",
        hint: "Suggestions based on your preferences",
      },
    ],
  },
  {
    title: "Reminders",
    options: [
      {
        id: "cooking",
        label: "Cooking reminders",
        hint: "Timers and planned meals",
      },
      {
        id: "saved",
        label: "Saved recipes",
        hint: "Updates for favorites and saved items",
      },
    ],
  },
  {
    title: "Community Activity",
    options: [
      {
        id: "comments",
        label: "Comments",
        hint: "On your posts and recipes",
      },
      {
        id: "likes",
        label: "Likes & reactions",
        hint: "On your recipes or posts",
      },
      {
        id: "replies",
        label: "Replies",
        hint: "When someone replies to your comments",
      },
    ],
  },
  {
    title: "App Announcements",
    options: [
      {
        id: "features",
        label: "New features",
        hint: "Product updates and improvements",
      },
      {
        id: "promotions",
        label: "Promotions",
        hint: "Seasonal or special offers",
      },
    ],
  },
];

const ALL_IDS = groups.flatMap((group) => group.options.map((o) => o.id));

function NotificationOption({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-5 text-ink">{label}</p>
        {hint ? (
          <p className="mt-0.5 text-xs leading-4 text-muted">{hint}</p>
        ) : null}
      </div>
      <Switch checked={checked} onChange={onChange} label={label} />
    </div>
  );
}

export default function SettingsNotificationsScreen() {
  const [state, setState] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(ALL_IDS.map((id) => [id, true])),
  );
  const [message, setMessage] = useState<string | null>(null);

  const allEnabled = useMemo(
    () => ALL_IDS.every((id) => state[id]),
    [state],
  );

  const toggle = (id: string) =>
    setState((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleAll = () => {
    const next = !allEnabled;
    setState(Object.fromEntries(ALL_IDS.map((id) => [id, next])));
  };

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Notification preferences saved.");
  }

  return (
    <div className="page">
      <form className="list-stack py-2" onSubmit={handleSubmit}>
        {groups.map((group) => (
          <section key={group.title} className="feed-card flex flex-col">
            <h2 className="section-title border-b border-line pb-2">
              {group.title}
            </h2>
            <div className="divide-y divide-line">
              {group.options.map((option) => (
                <NotificationOption
                  key={option.id}
                  label={option.label}
                  hint={option.hint}
                  checked={!!state[option.id]}
                  onChange={() => toggle(option.id)}
                />
              ))}
            </div>
          </section>
        ))}

        <section className="feed-card flex flex-col gap-2.5">
          <NotificationOption
            label="All notifications"
            hint="Turn every notification category on or off"
            checked={allEnabled}
            onChange={toggleAll}
          />
          {message ? (
            <p role="status" className="text-sm font-bold text-ink-secondary">
              {message}
            </p>
          ) : null}
          <button type="submit" className="btn-primary w-full">
            Save notifications
          </button>
        </section>
      </form>
    </div>
  );
}
