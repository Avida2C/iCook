import type { Metadata } from "next";
import CreatePostScreen from "@/components/app/CreatePostScreen";

export const metadata: Metadata = {
  title: "Write a Post · iCook",
};

export default function CreatePostPage() {
  return <CreatePostScreen />;
}
