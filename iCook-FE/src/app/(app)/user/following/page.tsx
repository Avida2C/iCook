import type { Metadata } from "next";
import UserListScreen from "@/components/app/UserListScreen";

export const metadata: Metadata = {
  title: "Following · iCook",
};

const following = [
  "Guy Hawkins",
  "Savannah Nguyen",
  "Annette Black",
  "Kristin Watson",
  "Bessie Cooper",
  "Leslie Alexander",
  "Robert Fox",
  "Kathryn Murphy",
  "Eleanor Pena",
  "Devon Lane",
].map((name) => ({ name, following: true }));

export default function FollowingPage() {
  return <UserListScreen title="Following" people={following} />;
}
