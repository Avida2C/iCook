import type { Metadata } from "next";
import UserListScreen from "@/components/app/UserListScreen";
import { INITIAL_FOLLOWERS } from "@/components/app/user/data";

export const metadata: Metadata = {
  title: "Followers · iCook",
};

const followers = INITIAL_FOLLOWERS.map((name) => ({
  name,
  following: false,
}));

export default function FollowersPage() {
  return <UserListScreen title="Followers" people={followers} />;
}
