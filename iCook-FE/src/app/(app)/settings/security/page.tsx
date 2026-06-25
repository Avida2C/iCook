import type { Metadata } from "next";
import SecurityScreen from "@/components/app/SecurityScreen";

export const metadata: Metadata = {
  title: "Login & Security · iCook",
};

export default function SecurityPage() {
  return <SecurityScreen />;
}
