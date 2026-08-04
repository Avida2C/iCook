import Link from "next/link";

/** Shared NOTIFICATIONS / MESSAGES tab header. */
export default function InboxTabs({
  active,
}: {
  active: "notifications" | "messages";
}) {
  const tabClass = (isActive: boolean) =>
    `flex-1 bg-surface py-3.5 text-center text-sm font-bold ${
      isActive ? "tab-underline text-ink" : "tab-underline-idle text-muted"
    }`;

  return (
    <div className="flex shrink-0 shadow-bar">
      <Link
        href="/notifications"
        className={tabClass(active === "notifications")}
      >
        Notifications
      </Link>
      <Link href="/messages" className={tabClass(active === "messages")}>
        Messages
      </Link>
    </div>
  );
}
