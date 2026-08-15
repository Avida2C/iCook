import Link from "next/link";
import UserAvatar from "@/components/app/UserAvatar";
import UserNameLink from "@/components/app/UserNameLink";
import { resolveAuthor } from "@/components/app/user/authors";
import { messagePath } from "@/components/app/messagesData";
import { userProfilePath } from "@/lib/userProfile";

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
    <ul className="list-stack w-full min-w-0">
      {names.length === 0 ? (
        <li className="feed-card px-3 py-8 text-center text-sm text-muted">
          No one here yet.
        </li>
      ) : (
        names.map((name) => {
          const isFollowing = followingSet.has(name);
          const person = resolveAuthor(name);
          return (
            <li key={name} className="feed-card flex items-center gap-3">
              <Link href={userProfilePath(person.handle)} aria-label={person.name}>
                <UserAvatar
                  initials={person.initials}
                  handle={person.handle}
                  src={person.avatarUrl}
                />
              </Link>
              <div className="min-w-0 flex-1">
                <UserNameLink
                  name={person.name}
                  handle={person.handle}
                  className="block truncate text-sm font-bold text-brand"
                />
                <p className="flex items-center gap-0.5 text-xs leading-[14px]">
                  <span className="text-brand-soft">@</span>
                  <Link
                    href={userProfilePath(person.handle)}
                    className="truncate text-placeholder"
                  >
                    {person.handle}
                  </Link>
                </p>
              </div>
              <Link
                href={messagePath(person.handle)}
                aria-label={`Message ${person.name}`}
                className="shrink-0 rounded border border-line px-2.5 py-1.5 text-xs font-bold text-ink-secondary"
              >
                Message
              </Link>
              <button
                type="button"
                onClick={() => onToggleFollow(name)}
                aria-label={
                  isFollowing ? `Unfollow ${person.name}` : `Follow ${person.name}`
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
