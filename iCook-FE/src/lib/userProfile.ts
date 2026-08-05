import { CURRENT_USER } from "@/components/app/user/data";

/** Profile URL for a user handle. Own profile uses `/user`. */
export function userProfilePath(handle: string): string {
  if (handle === CURRENT_USER.handle) return "/user";
  return `/user/${encodeURIComponent(handle)}`;
}
