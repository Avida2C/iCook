import type { Metadata } from "next";
import PublicProfileScreen from "@/components/app/PublicProfileScreen";

export const metadata: Metadata = {
  title: "Profile · iCook",
};

export default async function PublicUserPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  return <PublicProfileScreen handle={handle} />;
}
