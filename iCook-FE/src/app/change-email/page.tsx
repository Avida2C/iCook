import type { Metadata } from "next";
import ChangeEmailScreen from "@/components/auth/ChangeEmailScreen";

export const metadata: Metadata = {
  title: "Change Email · iCook",
  description: "Update your iCook account email address.",
};

export default function ChangeEmailPage() {
  return <ChangeEmailScreen />;
}
