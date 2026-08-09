import type { Metadata } from "next";
import RestoreAccountScreen from "@/components/auth/RestoreAccountScreen";

export const metadata: Metadata = {
  title: "Restore Account · iCook",
  description: "Restore your iCook account within the 30-day deletion window.",
};

export default function RestoreAccountPage() {
  return <RestoreAccountScreen />;
}
