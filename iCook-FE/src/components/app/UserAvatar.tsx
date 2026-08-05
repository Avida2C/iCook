import { CURRENT_USER } from "@/components/app/user/data";

type AvatarSize = "xs" | "sm" | "md" | "lg";

const SIZE_CLASS: Record<AvatarSize, string> = {
  xs: "avatar-xs",
  sm: "avatar-sm",
  md: "avatar",
  lg: "avatar-lg",
};

export function isCurrentUser(user: {
  handle?: string;
  initials?: string;
}): boolean {
  if (user.handle) return user.handle === CURRENT_USER.handle;
  if (user.initials) return user.initials === CURRENT_USER.initials;
  return false;
}

export default function UserAvatar({
  initials,
  handle,
  size = "md",
  me,
  className = "",
}: {
  initials: string;
  handle?: string;
  size?: AvatarSize;
  /** Force logged-in styling; otherwise inferred from handle/initials. */
  me?: boolean;
  className?: string;
}) {
  const self = me ?? isCurrentUser({ handle, initials });
  return (
    <span
      className={`${SIZE_CLASS[size]}${self ? " avatar-me" : ""}${className ? ` ${className}` : ""}`}
    >
      {initials}
    </span>
  );
}
