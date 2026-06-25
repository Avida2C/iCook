import Link from "next/link";

/** Shared NOTIFICATIONS / MESSAGES tab header. */
export default function InboxTabs({
  active,
}: {
  active: "notifications" | "messages";
}) {
  const tabClass = (isActive: boolean) =>
    `flex-1 bg-white py-4 text-center text-base font-bold ${
      isActive
        ? "text-[#1a1a1a] shadow-[inset_0_-2px_0_0_#f76365]"
        : "text-[#666]"
    }`;

  return (
    <div className="flex shadow-sm">
      <Link href="/notifications" className={tabClass(active === "notifications")}>
        NOTIFICATIONS
      </Link>
      <Link href="/messages" className={tabClass(active === "messages")}>
        MESSAGES
      </Link>
    </div>
  );
}
