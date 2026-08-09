import type { Metadata } from "next";
import ResetAccountScreen from "@/components/auth/ResetAccountScreen";

export const metadata: Metadata = {
  title: "Reset Account · iCook",
  description: "Clear your iCook account data without deleting your login.",
};

export default function ResetAccountPage() {
  return <ResetAccountScreen />;
}
