"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BackIcon,
  ShieldIcon,
  KeyIcon,
  SmartphoneIcon,
  CopyIcon,
  RefreshIcon,
  CheckIcon,
  TrashIcon,
  PlusIcon,
} from "@/components/app/icons";

type Passkey = { id: number; name: string; added: string };

const initialPasskeys: Passkey[] = [
  { id: 1, name: "iPhone 15 Pro · Face ID", added: "Added 12 Jun 2026" },
  { id: 2, name: "Windows Hello", added: "Added 03 Mar 2026" },
];

function makeCodes() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const block = () =>
    Array.from({ length: 4 }, () =>
      chars[Math.floor(Math.random() * chars.length)],
    ).join("");
  return Array.from({ length: 8 }, () => `${block()}-${block()}`);
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked ? "bg-brand" : "bg-[#d0d6e8]"
      }`}
    >
      <span
        className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${
          checked ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

function Card({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 bg-white p-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-brand">{icon}</span>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-[#292929]">{title}</h2>
          <p className="text-base text-muted">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export default function SecurityScreen() {
  const router = useRouter();
  const [twoFA, setTwoFA] = useState(true);
  const [showCodes, setShowCodes] = useState(false);
  const [codes, setCodes] = useState<string[]>(makeCodes);
  const [copied, setCopied] = useState(false);
  const [passkeys, setPasskeys] = useState<Passkey[]>(initialPasskeys);

  function copyCodes() {
    navigator.clipboard?.writeText(codes.join("\n")).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function addPasskey() {
    const date = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    setPasskeys((prev) => [
      ...prev,
      { id: Date.now(), name: "New device", added: `Added ${date}` },
    ]);
  }

  return (
    <div className="flex min-h-full flex-col bg-[#f6f7fa]">
      {/* Sub header */}
      <div className="flex items-center gap-4 bg-white px-4 py-2 shadow-sm">
        <button type="button" onClick={() => router.back()} aria-label="Back">
          <BackIcon className="size-6 text-[#1a1a1a]" />
        </button>
        <span className="text-base font-bold text-[#1a1a1a]">
          Login &amp; Security
        </span>
      </div>

      <p className="px-4 py-3 text-base text-muted">
        Manage the ways you sign in to iCook.
      </p>

      <div className="flex flex-col gap-[5px]">
        {/* Two-Factor Authentication */}
        <Card
          icon={<ShieldIcon className="size-6" />}
          title="Two-Factor Authentication"
          description="Use an authenticator app to generate a code each time you log in."
        >
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-[#292929]">
              Authenticator app
            </span>
            <Toggle
              checked={twoFA}
              onChange={() => setTwoFA((v) => !v)}
              label="Toggle two-factor authentication"
            />
          </div>
          {twoFA ? (
            <p className="flex items-center gap-2 text-base text-[#00a023]">
              <CheckIcon className="size-5" /> Authenticator app connected
            </p>
          ) : null}
        </Card>

        {/* Authentication Codes */}
        <Card
          icon={<KeyIcon className="size-6" />}
          title="Authentication Codes"
          description="One-time backup codes to use if you lose access to your authenticator."
        >
          {showCodes ? (
            <>
              <ul className="grid grid-cols-2 gap-2">
                {codes.map((code) => (
                  <li
                    key={code}
                    className="rounded-[4px] bg-[#f6f7fa] py-2 text-center font-mono text-base tracking-wider text-[#292929]"
                  >
                    {code}
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={copyCodes}
                  className="flex flex-1 items-center justify-center gap-2 rounded-[5px] border border-[#d0d6e8] py-2 text-base font-bold text-[#292929]"
                >
                  {copied ? (
                    <CheckIcon className="size-5 text-[#00a023]" />
                  ) : (
                    <CopyIcon className="size-5" />
                  )}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button
                  type="button"
                  onClick={() => setCodes(makeCodes())}
                  className="flex flex-1 items-center justify-center gap-2 rounded-[5px] border border-[#d0d6e8] py-2 text-base font-bold text-[#292929]"
                >
                  <RefreshIcon className="size-5" /> Regenerate
                </button>
              </div>
              <p className="text-sm text-muted">Each code can be used once.</p>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setShowCodes(true)}
              className="w-full rounded-[5px] bg-brand py-2 text-base font-bold text-white"
            >
              View codes
            </button>
          )}
        </Card>

        {/* Passkeys */}
        <Card
          icon={<SmartphoneIcon className="size-6" />}
          title="Passkeys"
          description="Sign in with Face ID, fingerprint, or a security key — no password needed."
        >
          <ul className="flex flex-col divide-y divide-[#e5e5e5]">
            {passkeys.map((passkey) => (
              <li
                key={passkey.id}
                className="flex items-center gap-3 py-2.5"
              >
                <KeyIcon className="size-5 shrink-0 text-brand" />
                <div className="flex-1">
                  <p className="text-base font-bold text-[#292929]">
                    {passkey.name}
                  </p>
                  <p className="text-sm text-muted">{passkey.added}</p>
                </div>
                <button
                  type="button"
                  aria-label={`Remove ${passkey.name}`}
                  onClick={() =>
                    setPasskeys((prev) =>
                      prev.filter((p) => p.id !== passkey.id),
                    )
                  }
                  className="text-muted hover:text-brand"
                >
                  <TrashIcon className="size-5" />
                </button>
              </li>
            ))}
            {passkeys.length === 0 ? (
              <li className="py-2.5 text-base text-muted">
                No passkeys added yet.
              </li>
            ) : null}
          </ul>
          <button
            type="button"
            onClick={addPasskey}
            className="flex items-center justify-center gap-2 rounded-[5px] bg-brand py-2 text-base font-bold text-white"
          >
            <PlusIcon className="size-5" /> Add passkey
          </button>
        </Card>
      </div>
    </div>
  );
}
