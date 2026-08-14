import type { Metadata } from "next";
import CreatedLibraryScreen from "@/components/app/CreatedLibraryScreen";

export const metadata: Metadata = {
  title: "My Creations · iCook",
};

export default function CreatedLibraryPage() {
  return <CreatedLibraryScreen />;
}
