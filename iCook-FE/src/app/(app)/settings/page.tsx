import type { Metadata } from "next";
import SettingsScreen from "@/components/app/SettingsScreen";

export const metadata: Metadata = {
  title: "Settings · iCook",
};

export default function SettingsPage() {
  return <SettingsScreen />;
}
