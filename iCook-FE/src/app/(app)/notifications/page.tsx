import type { Metadata } from "next";
import NotificationsScreen from "@/components/app/NotificationsScreen";

export const metadata: Metadata = {
  title: "Notifications · iCook",
};

export default function NotificationsPage() {
  return <NotificationsScreen />;
}
