import type { Metadata } from "next";
import UserScreen from "@/components/app/UserScreen";

export const metadata: Metadata = {
  title: "Profile · iCook",
};

export default function UserPage() {
  return <UserScreen />;
}
