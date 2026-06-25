import type { Metadata } from "next";
import ForgotPasswordScreen from "@/components/auth/ForgotPasswordScreen";

export const metadata: Metadata = {
  title: "Forgot Password · iCook",
  description: "Reset your iCook account password.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordScreen />;
}
