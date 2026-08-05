"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { CURRENT_USER } from "@/components/app/user/data";

type AvatarSize = "xs" | "sm" | "md" | "lg";

const SIZE_CLASS: Record<AvatarSize, string> = {
  xs: "avatar-xs",
  sm: "avatar-sm",
  md: "avatar",
  lg: "avatar-lg",
};

export default function UserAvatar({
  initials,
  handle,
  src,
  size = "md",
  me,
  className = "",
}: {
  initials: string;
  handle?: string;
  /** Optional profile image URL / data URL. */
  src?: string | null;
  size?: AvatarSize;
  /** Force logged-in styling; otherwise inferred from handle. */
  me?: boolean;
  className?: string;
}) {
  const { user } = useAuth();
  const myHandle = user?.username ?? CURRENT_USER.handle;
  const self = me ?? (handle ? handle === myHandle : false);
  const classes = `${SIZE_CLASS[size]}${self ? " avatar-me" : ""}${className ? ` ${className}` : ""}`;

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        className={`${classes} object-cover p-0`}
      />
    );
  }

  return <span className={classes}>{initials}</span>;
}
