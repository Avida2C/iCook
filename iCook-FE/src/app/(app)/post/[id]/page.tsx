import type { Metadata } from "next";
import PostDetailScreen from "@/components/app/PostDetailScreen";

export const metadata: Metadata = {
  title: "Post · iCook",
};

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PostDetailScreen postId={id} />;
}
