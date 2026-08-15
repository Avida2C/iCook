import { CURRENT_USER } from "@/components/app/user/data";
import { normalizeAuthorKey } from "@/components/app/user/authors";

/** Hub URL for the signed-in user (`/user`). */
export function userProfilePath(
  handle: string,
  selfHandle: string = CURRENT_USER.handle,
): string {
  if (normalizeAuthorKey(handle) === normalizeAuthorKey(selfHandle)) {
    return "/user";
  }
  return publicProfilePath(handle);
}

/** Always the public profile route (`/user/[handle]`), including for yourself. */
export function publicProfilePath(handle: string): string {
  return `/user/${encodeURIComponent(handle)}`;
}
