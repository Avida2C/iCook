"use client";

import Link from "next/link";
import { EditIcon, ListIcon, PostIcon } from "@/components/app/icons";

const actions = [
  {
    href: "/create/recipe",
    label: "Create Recipe",
    Icon: EditIcon,
  },
  {
    href: "/create/post",
    label: "Write Post",
    Icon: PostIcon,
  },
  {
    href: "/create/library",
    label: "View Creations",
    Icon: ListIcon,
  },
] as const;

/** Equal-weight create actions used on Me and Create. */
export default function CreateActionBar() {
  return (
    <div className="grid grid-cols-3 overflow-hidden rounded-lg border-2 border-brand bg-surface">
      {actions.map(({ href, label, Icon }, index) => (
        <Link
          key={href}
          href={href}
          className={`flex flex-col items-center justify-center gap-1 px-1 py-2.5 text-center text-brand transition-colors hover:bg-brand/10 ${
            index < actions.length - 1 ? "border-e-2 border-brand" : ""
          }`}
        >
          <Icon className="size-5" />
          <span className="whitespace-nowrap text-[11px] leading-tight font-bold">
            {label}
          </span>
        </Link>
      ))}
    </div>
  );
}
