import type { Metadata } from "next";
import DiscoverScreen from "@/components/app/DiscoverScreen";

export const metadata: Metadata = {
  title: "Discover · iCook",
};

export default function DiscoverPage() {
  return <DiscoverScreen />;
}
