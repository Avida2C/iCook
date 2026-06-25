import type { Metadata } from "next";
import CreateScreen from "@/components/app/CreateScreen";

export const metadata: Metadata = {
  title: "Create · iCook",
};

export default function CreatePage() {
  return <CreateScreen />;
}
