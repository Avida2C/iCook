import type { Metadata } from "next";
import PostEditorScreen from "@/components/app/PostEditorScreen";

export const metadata: Metadata = {
  title: "Edit Post · iCook",
};

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PostEditorScreen postId={id} />;
}
