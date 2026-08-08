import type { Metadata } from "next";
import LegalDocumentScreen from "@/components/app/LegalDocumentScreen";
import PhoneFrame from "@/components/PhoneFrame";
import { APP_NAME } from "@/lib/appInfo";

export const metadata: Metadata = {
  title: `Privacy Policy · ${APP_NAME}`,
};

export default function PrivacyPage() {
  return (
    <PhoneFrame>
      <div className="flex h-full min-h-0 w-full flex-col overflow-y-auto bg-app">
        <LegalDocumentScreen doc="privacy" />
      </div>
    </PhoneFrame>
  );
}
