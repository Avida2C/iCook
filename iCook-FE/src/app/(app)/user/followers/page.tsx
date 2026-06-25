import type { Metadata } from "next";
import UserListScreen from "@/components/app/UserListScreen";

export const metadata: Metadata = {
  title: "Followers · iCook",
};

const followers = ["Jacob Jones", "Darlene Robertson", "Theresa Webb"].map(
  (name) => ({ name, following: false }),
);

export default function FollowersPage() {
  return <UserListScreen title="Followers" people={followers} />;
}
