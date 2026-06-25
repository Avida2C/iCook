import type { Metadata } from "next";
import ChatboxScreen from "@/components/app/ChatboxScreen";

export const metadata: Metadata = {
  title: "Chat · iCook",
};

export default function ChatboxPage() {
  return <ChatboxScreen />;
}
