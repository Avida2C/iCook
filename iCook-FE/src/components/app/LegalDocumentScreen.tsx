"use client";

import { APP_NAME, APP_SUPPORT_EMAIL, APP_VERSION } from "@/lib/appInfo";

export type LegalDoc = "terms" | "privacy";

const DOCS: Record<
  LegalDoc,
  { title: string; updated: string; sections: { heading: string; body: string }[] }
> = {
  terms: {
    title: "Terms of Service",
    updated: "4 August 2026",
    sections: [
      {
        heading: "1. Acceptance",
        body: `By using ${APP_NAME}, you agree to these Terms of Service. If you do not agree, please do not use the app.`,
      },
      {
        heading: "2. Your account",
        body: "You are responsible for keeping your login details secure and for activity that happens under your account. Provide accurate profile information and update it when it changes.",
      },
      {
        heading: "3. Content you share",
        body: "Recipes, posts, comments, and other content you publish remain yours. By posting, you grant iCook a non-exclusive licence to display and distribute that content within the app so other users can discover and engage with it.",
      },
      {
        heading: "4. Acceptable use",
        body: "Do not post harmful, illegal, or misleading content. Do not harass others, scrape the service, or attempt to disrupt our systems. We may remove content or suspend accounts that break these rules.",
      },
      {
        heading: "5. Recipes and safety",
        body: "Recipes and cooking tips are shared by the community for inspiration. Always use your own judgement for food safety, allergies, and dietary needs. iCook is not liable for outcomes from following user-generated recipes.",
      },
      {
        heading: "6. Changes",
        body: `We may update these terms from time to time. Continued use of ${APP_NAME} after changes means you accept the updated terms. The version shown in the app is ${APP_VERSION}.`,
      },
      {
        heading: "7. Contact",
        body: `Questions about these terms? Email ${APP_SUPPORT_EMAIL}.`,
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    updated: "4 August 2026",
    sections: [
      {
        heading: "1. Overview",
        body: `${APP_NAME} respects your privacy. This policy explains what information we collect, how we use it, and the choices you have.`,
      },
      {
        heading: "2. Information we collect",
        body: "Account details (such as name, email, and profile), content you create (recipes, posts, comments), pantry and saved-recipe preferences, and basic device or usage data needed to run and improve the app.",
      },
      {
        heading: "3. How we use information",
        body: "We use your data to provide the service, personalise discovery, send notifications you opt into, keep accounts secure, and improve product quality. We do not sell your personal information.",
      },
      {
        heading: "4. Sharing",
        body: "Profile details and public posts or recipes are visible to other users as part of the community experience. We may share data with service providers who help us operate iCook, under confidentiality obligations, or when required by law.",
      },
      {
        heading: "5. Retention",
        body: "We keep your information while your account is active and for a reasonable period afterward if needed for legal, security, or operational reasons. You can request deletion of your account and associated data.",
      },
      {
        heading: "6. Your choices",
        body: "You can update profile details, manage notification preferences, and contact us to access or delete personal data subject to applicable law.",
      },
      {
        heading: "7. Contact",
        body: `Privacy questions or requests? Email ${APP_SUPPORT_EMAIL}.`,
      },
    ],
  },
};

export default function LegalDocumentScreen({ doc }: { doc: LegalDoc }) {
  const content = DOCS[doc];

  return (
    <div className="flex min-h-full flex-col bg-surface">
      <section className="feed-card">
        <h1 className="text-lg font-bold">{content.title}</h1>
        <p className="text-xs text-muted">Last updated {content.updated}</p>
      </section>

      {content.sections.map((section) => (
        <section key={section.heading} className="feed-card flex flex-col">
          <h2 className="text-sm font-bold text-brand">{section.heading}</h2>
          <p className="text-sm leading-5 text-ink-secondary">{section.body}</p>
        </section>
      ))}
    </div>
  );
}
