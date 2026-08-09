"use client";

import {
  ACTIVITY_FILTER_LABELS,
  groupEnabled,
  MY_ACTIVITY_KEYS,
  OTHERS_ACTIVITY_KEYS,
  type ActivityFilterPrefs,
} from "./activityFilters";
import { useActivityFilters } from "./ActivityFiltersProvider";
import Switch from "@/components/Switch";

function FilterOption({
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

const MY_HINTS: Partial<Record<keyof ActivityFilterPrefs, string>> = {
  myLikes: "When you like a post or recipe",
  myPosts: "Posts you published",
  myRecipes: "Recipes you published",
};

const OTHERS_HINTS: Partial<Record<keyof ActivityFilterPrefs, string>> = {
  othersFollows: "Someone started following you",
  othersLikes: "Someone liked your recipe or post",
  othersComments: "Someone commented on your content",
  othersPosts: "Posts shared by people you follow",
  othersRecipes: "Recipes posted by people you follow",
};

type Preset = "all" | "mine" | "others";

function activePreset(prefs: ActivityFilterPrefs): Preset | "custom" {
  const mineOn = groupEnabled(prefs, MY_ACTIVITY_KEYS);
  const othersOn = groupEnabled(prefs, OTHERS_ACTIVITY_KEYS);
  const mineAny = MY_ACTIVITY_KEYS.some((k) => prefs[k]);
  const othersAny = OTHERS_ACTIVITY_KEYS.some((k) => prefs[k]);

  if (mineOn && othersOn) return "all";
  if (mineOn && !othersAny) return "mine";
  if (othersOn && !mineAny) return "others";
  return "custom";
}

export default function ActivityFilterPanel({
  onClose,
}: {
  onClose?: () => void;
}) {
  const { prefs, setPref, setGroup, reset } = useActivityFilters();
  const preset = activePreset(prefs);

  const applyPreset = (next: Preset) => {
    if (next === "all") {
      reset();
      return;
    }
    if (next === "mine") {
      setGroup(MY_ACTIVITY_KEYS, true);
      setGroup(OTHERS_ACTIVITY_KEYS, false);
      return;
    }
    setGroup(MY_ACTIVITY_KEYS, false);
    setGroup(OTHERS_ACTIVITY_KEYS, true);
  };

  return (
    <div className="feed-card flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-ink">Filter activity</p>
          <p className="mt-0.5 text-xs text-muted">
            Pick what shows in this feed. Saved on this device.
          </p>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 text-xs font-bold text-muted"
          >
            Done
          </button>
        ) : null}
      </div>

      <div>
        <p className="mb-2 text-xs font-bold tracking-wide text-muted uppercase">
          Quick view
        </p>
        <div className="grid grid-cols-3 gap-1.5">
          {(
            [
              ["all", "Everything"],
              ["mine", "Only mine"],
              ["others", "Only others"],
            ] as const
          ).map(([id, label]) => {
            const active = preset === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => applyPreset(id)}
                className={`rounded px-2 py-2 text-center text-xs font-bold transition-colors ${
                  active
                    ? "bg-brand text-white"
                    : "bg-app text-ink-secondary"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
        {preset === "custom" ? (
          <p className="mt-1.5 text-xs text-muted">Custom mix selected below</p>
        ) : null}
      </div>

      <section>
        <div className="mb-1 flex items-center justify-between gap-2 border-b border-line pb-2">
          <div>
            <p className="text-sm font-bold text-ink">My activity</p>
            <p className="text-xs text-muted">Things you did</p>
          </div>
          <button
            type="button"
            onClick={() =>
              setGroup(MY_ACTIVITY_KEYS, !groupEnabled(prefs, MY_ACTIVITY_KEYS))
            }
            className="text-xs font-bold text-brand"
          >
            {groupEnabled(prefs, MY_ACTIVITY_KEYS) ? "Hide all" : "Show all"}
          </button>
        </div>
        <div className="divide-y divide-line">
          {MY_ACTIVITY_KEYS.map((key) => (
            <FilterOption
              key={key}
              label={ACTIVITY_FILTER_LABELS[key]}
              hint={MY_HINTS[key]}
              checked={prefs[key]}
              onChange={() => setPref(key, !prefs[key])}
            />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-1 flex items-center justify-between gap-2 border-b border-line pb-2">
          <div>
            <p className="text-sm font-bold text-ink">Others&apos; activity</p>
            <p className="text-xs text-muted">Things people did with you</p>
          </div>
          <button
            type="button"
            onClick={() =>
              setGroup(
                OTHERS_ACTIVITY_KEYS,
                !groupEnabled(prefs, OTHERS_ACTIVITY_KEYS),
              )
            }
            className="text-xs font-bold text-brand"
          >
            {groupEnabled(prefs, OTHERS_ACTIVITY_KEYS) ? "Hide all" : "Show all"}
          </button>
        </div>
        <div className="divide-y divide-line">
          {OTHERS_ACTIVITY_KEYS.map((key) => (
            <FilterOption
              key={key}
              label={ACTIVITY_FILTER_LABELS[key]}
              hint={OTHERS_HINTS[key]}
              checked={prefs[key]}
              onChange={() => setPref(key, !prefs[key])}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
