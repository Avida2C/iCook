import type { Metadata } from "next";
import HubScreen from "@/components/app/HubScreen";

export const metadata: Metadata = {
  title: "Hub · iCook",
};

export default function HubPage() {
  return <HubScreen />;
}
