import type { Metadata } from "next";
import SignUpScreen from "@/components/auth/SignUpScreen";

export const metadata: Metadata = {
  title: "Sign Up · iCook",
  description: "Create your iCook account.",
};

export default function SignUpPage() {
  return <SignUpScreen />;
}
