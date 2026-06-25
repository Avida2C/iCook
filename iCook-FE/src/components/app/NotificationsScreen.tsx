import type { ReactNode } from "react";
import InboxTabs from "@/components/app/InboxTabs";
import {
  CommentIcon,
  UserAddIcon,
  ApproveIcon,
  CommentEditIcon,
} from "@/components/app/icons";

type Item = {
  icon: ReactNode;
  title: ReactNode;
  time: string;
  unread: boolean;
};

const items: Item[] = [
  {
    icon: <CommentIcon className="size-7 text-brand" />,
    title: "New Message",
    time: "13:51 - 11/12/2024",
    unread: true,
  },
  {
    icon: <UserAddIcon className="size-7 text-brand" />,
    title: "You gained a new Follower!",
    time: "22:10 - 09/12/2024",
    unread: true,
  },
  {
    icon: <ApproveIcon className="size-7 text-[#34C759]" />,
    title: (
      <>
        Your recipe &lsquo;<span className="italic">Traditional Ravioli</span>
        &rsquo; has been Approved!
      </>
    ),
    time: "10:30AM - 27/11/2024",
    unread: false,
  },
  {
    icon: <CommentEditIcon className="size-7 text-brand" />,
    title: "Someone left you a comment!",
    time: "10:30AM - 27/11/2024",
    unread: false,
  },
];

export default function NotificationsScreen() {
  return (
    <div className="flex min-h-full flex-col">
      <InboxTabs active="notifications" />
      <ul className="flex flex-col gap-[5px] py-[5px]">
        {items.map((item, i) => (
          <li key={i}>
            <button
              type="button"
              className="flex w-full items-start gap-2.5 bg-white px-2.5 py-4 text-left"
            >
              <span className="shrink-0">{item.icon}</span>
              <div className="flex flex-1 flex-col gap-[5px]">
                <div className="flex items-center gap-4">
                  <p
                    className={`flex-1 text-base font-bold ${
                      item.unread ? "text-[#292929]" : "text-muted"
                    }`}
                  >
                    {item.title}
                  </p>
                  <span
                    className={`size-2.5 shrink-0 rounded-full ${
                      item.unread ? "bg-[#34C759]" : "bg-brand"
                    }`}
                  />
                </div>
                <p className="text-base italic text-muted">{item.time}</p>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
