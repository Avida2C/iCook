import { CURRENT_USER } from "@/components/app/user/data";

/** Profile URL for a user handle. Own profile uses `/user`. */
export function userProfilePath(
  handle: string,
  selfHandle: string = CURRENT_USER.handle,
): string {
  if (handle === selfHandle) return "/user";
  return `/user/${encodeURIComponent(handle)}`;
}
