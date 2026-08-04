import type { Metadata } from "next";
import LegalDocumentScreen from "@/components/app/LegalDocumentScreen";
import { APP_NAME } from "@/lib/appInfo";

export const metadata: Metadata = {
  title: `Privacy Policy · ${APP_NAME}`,
};

export default function PrivacyPage() {
  return <LegalDocumentScreen doc="privacy" />;
}
