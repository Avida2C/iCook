import type { Metadata } from "next";
import LegalDocumentScreen from "@/components/app/LegalDocumentScreen";
import { APP_NAME } from "@/lib/appInfo";

export const metadata: Metadata = {
  title: `Terms of Service · ${APP_NAME}`,
};

export default function TermsPage() {
  return <LegalDocumentScreen doc="terms" />;
}
