import type { ReactNode } from "react";
import Link from "next/link";
import InboxTabs from "@/components/app/InboxTabs";
import {
  CommentIcon,
  UserAddIcon,
  ApproveIcon,
  CommentEditIcon,
  HeartIcon,
} from "@/components/app/icons";

type Item = {
  id: string;
  icon: ReactNode;
  title: ReactNode;
  time: string;
  unread: boolean;
  href?: string;
};

const items: Item[] = [
  {
    id: "1",
    icon: <CommentIcon className="size-6 text-brand" />,
    title: (
      <>
        <span className="font-bold text-brand">Eleanor Pena</span> sent you a
        message
      </>
    ),
    time: "13:51 · 11/12/2024",
    unread: true,
    href: "/messages/1",
  },
  {
    id: "2",
    icon: <UserAddIcon className="size-6 text-brand" />,
    title: (
      <>
        <span className="font-bold text-brand">Chef Amy</span> started following
        you
      </>
    ),
    time: "22:10 · 09/12/2024",
    unread: true,
    href: "/user",
  },
  {
    id: "3",
    icon: <ApproveIcon className="size-6 text-success" />,
    title: (
      <>
        Your recipe{" "}
        <span className="font-bold italic text-ink-secondary">
          Traditional Ravioli
        </span>{" "}
        was approved
      </>
    ),
    time: "10:30AM · 27/11/2024",
    unread: false,
    href: "/recipe/7",
  },
  {
    id: "4",
    icon: <CommentEditIcon className="size-6 text-brand" />,
    title: (
      <>
        <span className="font-bold text-brand">Grill Guy</span> left a comment on{" "}
        <span className="font-bold italic text-ink-secondary">
          Ricotta Ravioli
        </span>
      </>
    ),
    time: "10:30AM · 27/11/2024",
    unread: false,
    href: "/recipe/1",
  },
  {
    id: "5",
    icon: <HeartIcon className="size-6 text-brand" />,
    title: (
      <>
        <span className="font-bold text-brand">Sweet Sue</span> liked your recipe{" "}
        <span className="font-bold italic text-ink-secondary">Pasta Salad</span>
      </>
    ),
    time: "Yesterday",
    unread: false,
    href: "/recipe/4",
  },
];

export default function NotificationsScreen() {
  return (
    <div className="page">
      <InboxTabs active="notifications" />

      <ul className="list-stack py-2">
        {items.map((item) => {
          const body = (
            <>
              <span className="mt-0.5 shrink-0">{item.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-2">
                  <p
                    className={`min-w-0 flex-1 text-sm leading-5 ${
                      item.unread ? "text-ink" : "text-ink-secondary"
                    }`}
                  >
                    {item.title}
                  </p>
                  {item.unread ? (
                    <span
                      className="mt-1.5 size-2 shrink-0 rounded-full bg-brand"
                      aria-label="Unread"
                    />
                  ) : null}
                </div>
                <p className="mt-1 text-xs text-muted">{item.time}</p>
              </div>
            </>
          );

          return (
            <li key={item.id}>
              {item.href ? (
                <Link
                  href={item.href}
                  className="feed-card flex items-start gap-3"
                >
                  {body}
                </Link>
              ) : (
                <div className="feed-card flex items-start gap-3">{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
