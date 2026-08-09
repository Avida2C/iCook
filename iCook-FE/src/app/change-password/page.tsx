import type { Metadata } from "next";
import ResetPasswordScreen from "@/components/auth/ResetPasswordScreen";

export const metadata: Metadata = {
  title: "Change Password · iCook",
  description: "Update your iCook account password.",
};

export default function ChangePasswordPage() {
  return <ResetPasswordScreen />;
}
