import Link from "next/link";
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
  return (
    <Link href={userProfilePath(handle)} className={className}>
      {name}
    </Link>
  );
}
