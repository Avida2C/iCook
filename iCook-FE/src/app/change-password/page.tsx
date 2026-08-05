import type { Metadata } from "next";
import ChangePasswordScreen from "@/components/auth/ChangePasswordScreen";

export const metadata: Metadata = {
  title: "Change Password · iCook",
  description: "Update your iCook account password.",
};

export default function ChangePasswordPage() {
  return <ChangePasswordScreen />;
}
