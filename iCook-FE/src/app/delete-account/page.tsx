import type { Metadata } from "next";
import DeleteAccountScreen from "@/components/auth/DeleteAccountScreen";

export const metadata: Metadata = {
  title: "Delete Account · iCook",
  description:
    "Temporarily delete your iCook account. Restore within 30 days or it is permanently removed.",
};

export default function DeleteAccountPage() {
  return <DeleteAccountScreen />;
}
