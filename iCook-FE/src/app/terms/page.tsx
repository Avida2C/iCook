import type { Metadata } from "next";
import LegalDocumentScreen from "@/components/app/LegalDocumentScreen";
import { APP_NAME } from "@/lib/appInfo";

export const metadata: Metadata = {
  title: `Terms of Service · ${APP_NAME}`,
};

export default function TermsPage() {
  return (
    <div className="flex min-h-dvh justify-center bg-app-frame">
      <div className="flex min-h-dvh w-full max-w-[400px] flex-col bg-app shadow-xl">
        <LegalDocumentScreen doc="terms" />
      </div>
    </div>
  );
}
