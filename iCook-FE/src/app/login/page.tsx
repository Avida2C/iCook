import type { Metadata } from "next";
import LoginScreen from "@/components/auth/LoginScreen";

export const metadata: Metadata = {
  title: "Log In · iCook",
  description: "Log in to your iCook account.",
};

export default function LoginPage() {
  return <LoginScreen />;
}
