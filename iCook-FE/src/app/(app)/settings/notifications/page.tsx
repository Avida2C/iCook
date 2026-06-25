import type { Metadata } from "next";
import SettingsNotificationsScreen from "@/components/app/SettingsNotificationsScreen";

export const metadata: Metadata = {
  title: "Notification Settings · iCook",
};

export default function SettingsNotificationsPage() {
  return <SettingsNotificationsScreen />;
}
