"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  BackIcon,
  ShieldIcon,
  KeyIcon,
  SmartphoneIcon,
  ChevronRightIcon,
} from "@/components/app/icons";

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useAuth();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  const rowClass = "w-full text-left text-xl text-[#1a1a1a]";

  const securityRows = [
    { label: "Two-Factor Authentication", Icon: ShieldIcon },
    { label: "Authentication Codes", Icon: KeyIcon },
    { label: "Passkeys", Icon: SmartphoneIcon },
  ];

  return (
    <div className="flex min-h-full flex-col bg-[#f6f7fa]">
      {/* Sub header */}
      <div className="flex items-center gap-4 bg-white px-4 py-2 shadow-sm">
        <button type="button" onClick={() => router.back()} aria-label="Back">
          <BackIcon className="size-6 text-[#1a1a1a]" />
        </button>
        <span className="text-base font-bold text-[#1a1a1a]">Settings</span>
      </div>

      <div className="flex flex-col gap-5 bg-white px-2.5">
        {/* Account */}
        <section className="flex flex-col gap-4 border-b border-[#e5e5e5] p-4">
          <h2 className="text-base font-bold text-[#666]">Account</h2>
          <Link href="/settings/user" className={rowClass}>
            User Details
          </Link>
        </section>

        {/* Privacy & Security */}
        <section className="flex flex-col gap-4 border-b border-[#e5e5e5] p-4">
          <h2 className="text-base font-bold text-[#666]">
            Privacy &amp; Security
          </h2>
          <p className="-mt-2 text-base text-muted">Ways to log in</p>
          {securityRows.map(({ label, Icon }) => (
            <Link
              key={label}
              href="/settings/security"
              className="flex items-center gap-3 text-xl text-[#1a1a1a]"
            >
              <Icon className="size-6 shrink-0 text-brand" />
              <span className="flex-1">{label}</span>
              <ChevronRightIcon className="size-5 shrink-0 text-muted" />
            </Link>
          ))}
        </section>

        {/* Log Out */}
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center bg-brand px-4 py-2.5 text-left text-xl font-bold text-white"
        >
          Log Out
        </button>

        {/* Preferences */}
        <section className="flex flex-col gap-4 border-b border-[#e5e5e5] p-4">
          <h2 className="text-base font-bold text-[#666]">Preferences</h2>
          <Link href="/settings/notifications" className={rowClass}>
            Notifications
          </Link>
          <div className="flex items-center justify-between text-xl text-[#1a1a1a]">
            <span>Language</span>
            <span className="font-bold">ENG</span>
          </div>
        </section>

        {/* Help & Support */}
        <section className="flex flex-col gap-4 border-b border-[#e5e5e5] p-4">
          <h2 className="text-base font-bold text-[#666]">Help &amp; Support</h2>
          <button type="button" className={rowClass}>FAQ</button>
          <button type="button" className={rowClass}>Contact Support</button>
          <button type="button" className={rowClass}>Terms &amp; Privacy Policy</button>
        </section>

        {/* About */}
        <section className="flex flex-col gap-4 border-b border-[#e5e5e5] p-4">
          <h2 className="text-base font-bold text-[#666]">About the App</h2>
          <div className="flex items-center justify-between text-xl text-[#1a1a1a]">
            <span>App Version</span>
            <span className="font-bold">2.0.0</span>
          </div>
          <button type="button" className={rowClass}>Share App</button>
        </section>
      </div>
    </div>
  );
}
