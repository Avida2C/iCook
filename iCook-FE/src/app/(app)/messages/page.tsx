import type { Metadata } from "next";
import MessagesScreen from "@/components/app/MessagesScreen";

export const metadata: Metadata = {
  title: "Messages · iCook",
};

export default function MessagesPage() {
  return <MessagesScreen />;
}
