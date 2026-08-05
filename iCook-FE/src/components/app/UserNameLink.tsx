"use client";

import Link from "next/link";
import { useCurrentFeedUser } from "@/components/app/user/useCurrentFeedUser";
import { userProfilePath } from "@/lib/userProfile";

export default function UserNameLink({
  name,
  handle,
  className = "font-bold text-brand",
}: {
  name: string;
  handle: string;
  className?: string;
}) {
  const me = useCurrentFeedUser();
  return (
    <Link href={userProfilePath(handle, me.handle)} className={className}>
      {name}
    </Link>
  );
}
