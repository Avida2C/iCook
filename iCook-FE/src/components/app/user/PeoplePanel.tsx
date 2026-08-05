import Link from "next/link";
import UserAvatar from "@/components/app/UserAvatar";
import UserNameLink from "@/components/app/UserNameLink";
import { userProfilePath } from "@/lib/userProfile";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);
}

function handleFromName(name: string) {
  return name.replace(/\s+/g, "").toLowerCase();
}

export default function PeoplePanel({
  names,
  followingSet,
  onToggleFollow,
}: {
  names: string[];
  followingSet: Set<string>;
  onToggleFollow: (name: string) => void;
}) {
  return (
    <ul className="list-stack">
      {names.length === 0 ? (
        <li className="feed-card px-3 py-8 text-center text-base text-muted">
          No one here yet.
        </li>
      ) : (
        names.map((name) => {
          const isFollowing = followingSet.has(name);
          const handle = handleFromName(name);
          return (
            <li key={name} className="feed-card flex items-center gap-3">
              <Link href={userProfilePath(handle)} aria-label={name}>
                <UserAvatar initials={initials(name)} handle={handle} />
              </Link>
              <div className="min-w-0 flex-1">
                <UserNameLink
                  name={name}
                  handle={handle}
                  className="block truncate text-sm font-bold text-brand"
                />
                <p className="flex items-center gap-0.5 text-xs leading-[14px]">
                  <span className="text-brand-soft">@</span>
                  <Link
                    href={userProfilePath(handle)}
                    className="truncate text-placeholder"
                  >
                    {handle}
                  </Link>
                </p>
              </div>
              <Link
                href="/messages/1"
                aria-label={`Message ${name}`}
                className="shrink-0 rounded border border-line px-2.5 py-1.5 text-xs font-bold text-ink-secondary"
              >
                Message
              </Link>
              <button
                type="button"
                onClick={() => onToggleFollow(name)}
                aria-label={
                  isFollowing ? `Unfollow ${name}` : `Follow ${name}`
                }
                aria-pressed={isFollowing}
                className={
                  isFollowing
                    ? "shrink-0 rounded border-2 border-brand bg-surface px-2.5 py-1.5 text-xs font-bold text-brand"
                    : "shrink-0 rounded bg-brand px-2.5 py-1.5 text-xs font-bold text-white hover:bg-brand-hover"
                }
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            </li>
          );
        })
      )}
    </ul>
  );
}
