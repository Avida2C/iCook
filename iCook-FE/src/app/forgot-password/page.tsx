import type { Metadata } from "next";
import ResetPasswordScreen from "@/components/auth/ResetPasswordScreen";

export const metadata: Metadata = {
  title: "Forgot Password · iCook",
  description: "Reset your iCook account password.",
};

export default function ForgotPasswordPage() {
  return <ResetPasswordScreen />;
}
