import type { Metadata } from "next";
import UserListScreen from "@/components/app/UserListScreen";
import { INITIAL_FOLLOWING } from "@/components/app/user/data";

export const metadata: Metadata = {
  title: "Following · iCook",
};

const following = INITIAL_FOLLOWING.map((name) => ({ name, following: true }));

export default function FollowingPage() {
  return <UserListScreen title="Following" people={following} />;
}
