import type { Metadata } from "next";
import SettingsUserScreen from "@/components/app/SettingsUserScreen";

export const metadata: Metadata = {
  title: "User Details · iCook",
};

export default function SettingsUserPage() {
  return <SettingsUserScreen />;
}
