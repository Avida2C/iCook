import type { Metadata } from "next";
import AboutScreen from "@/components/app/AboutScreen";
import { APP_NAME } from "@/lib/appInfo";

export const metadata: Metadata = {
  title: `About · ${APP_NAME}`,
};

export default function AboutPage() {
  return <AboutScreen />;
}
