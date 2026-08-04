import type { Metadata } from "next";
import LegalDocumentScreen from "@/components/app/LegalDocumentScreen";
import { APP_NAME } from "@/lib/appInfo";

export const metadata: Metadata = {
  title: `Privacy Policy · ${APP_NAME}`,
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-dvh justify-center bg-app-frame">
      <div className="w-full max-w-[400px] bg-app shadow-xl">
        <LegalDocumentScreen doc="privacy" />
      </div>
    </div>
  );
}
