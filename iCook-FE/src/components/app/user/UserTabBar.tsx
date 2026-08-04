import { TAB_META } from "./data";
import type { MeTab } from "./types";

export default function UserTabBar({
  tab,
  counts,
  onSelect,
}: {
  tab: MeTab;
  counts: Record<MeTab, number>;
  onSelect: (next: MeTab) => void;
}) {
  return (
    <div className="grid grid-cols-5 border-t border-line" role="tablist">
      {(Object.keys(TAB_META) as MeTab[]).map((id) => {
        const meta = TAB_META[id];
        const active = tab === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(id)}
            className={`flex flex-col items-center justify-center gap-0.5 px-0.5 py-2.5 ${
              active ? "tab-underline" : "tab-underline-idle"
            }`}
          >
            <span className="text-base font-bold text-brand">{counts[id]}</span>
            <span
              className={`text-center text-[10px] leading-tight ${
                active ? "font-bold text-brand" : "text-muted"
              }`}
            >
              {meta.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
