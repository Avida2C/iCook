"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldIcon,
  KeyIcon,
  SmartphoneIcon,
  CopyIcon,
  RefreshIcon,
  CheckIcon,
  TrashIcon,
  PlusIcon,
} from "@/components/app/icons";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  createTotpSecret,
  formatAddedDate,
  makeBackupCodes,
  qrImageUrl,
  totpUri,
  verifyTotp,
  type PasskeyRecord,
  type SecuritySettings,
  DEFAULT_SECURITY,
} from "@/lib/auth/security";
import { passkeysSupported, registerPasskey } from "@/lib/auth/passkeys";
import Switch from "@/components/Switch";

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
    <section className="flex flex-col gap-3 bg-surface p-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-brand">{icon}</span>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-ink">{title}</h2>
          <p className="text-base text-muted">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export default function SecurityScreen() {
  const { user, getSecuritySettings, saveSecuritySettings } = useAuth();
  const [settings, setSettings] = useState<SecuritySettings>(DEFAULT_SECURITY);
  const [pendingSecret, setPendingSecret] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [setupError, setSetupError] = useState<string | null>(null);
  const [showCodes, setShowCodes] = useState(false);
  const [freshCodes, setFreshCodes] = useState<string[] | null>(null);
  const [copied, setCopied] = useState(false);
  const [passkeyBusy, setPasskeyBusy] = useState(false);
  const [passkeyError, setPasskeyError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const current = getSecuritySettings();
    if (current) setSettings(current);
  }, [getSecuritySettings]);

  function persist(next: SecuritySettings) {
    setSettings(next);
    saveSecuritySettings(next);
  }

  function flash(message: string) {
    setNotice(message);
    setTimeout(() => setNotice(null), 2500);
  }

  function otherMethodsActive(next: SecuritySettings): boolean {
    return (
      next.passkeys.length > 0 ||
      (next.authenticator.enabled && !!next.authenticator.secret) ||
      next.backupCodes.length > 0
    );
  }

  function togglePassword() {
    const enabling = !settings.passwordEnabled;
    if (!enabling && !otherMethodsActive(settings)) {
      flash("Add a passkey, authenticator, or backup codes before going passwordless.");
      return;
    }
    persist({ ...settings, passwordEnabled: enabling });
  }

  function startAuthenticatorSetup() {
    setSetupError(null);
    setVerifyCode("");
    setPendingSecret(createTotpSecret());
  }

  function cancelAuthenticatorSetup() {
    setPendingSecret(null);
    setVerifyCode("");
    setSetupError(null);
  }

  function confirmAuthenticator() {
    if (!pendingSecret || !user) return;
    if (!verifyTotp(pendingSecret, verifyCode)) {
      setSetupError("That code didn’t match. Try the latest code from your app.");
      return;
    }
    const codes =
      settings.backupCodes.length > 0
        ? settings.backupCodes
        : makeBackupCodes();
    const next: SecuritySettings = {
      ...settings,
      authenticator: { enabled: true, secret: pendingSecret },
      backupCodes: codes,
    };
    persist(next);
    setPendingSecret(null);
    setVerifyCode("");
    setSetupError(null);
    if (settings.backupCodes.length === 0) {
      setFreshCodes(codes);
      setShowCodes(true);
      flash("Authenticator connected. Save your backup codes.");
    } else {
      flash("Authenticator app connected.");
    }
  }

  function disableAuthenticator() {
    persist({
      ...settings,
      authenticator: { enabled: false, secret: null },
    });
    setPendingSecret(null);
    flash("Authenticator app disconnected.");
  }

  function copyCodes(codes: string[]) {
    navigator.clipboard?.writeText(codes.join("\n")).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function regenerateCodes() {
    const codes = makeBackupCodes();
    persist({ ...settings, backupCodes: codes });
    setFreshCodes(codes);
    setShowCodes(true);
    flash("New backup codes generated. Old codes no longer work.");
  }

  async function addPasskey() {
    if (!user) return;
    setPasskeyError(null);
    setPasskeyBusy(true);
    try {
      const created = await registerPasskey(
        user.email,
        user.name ?? user.email,
      );
      const record: PasskeyRecord = {
        id: created.credentialId,
        credentialId: created.credentialId,
        name: created.name,
        added: formatAddedDate(),
      };
      persist({
        ...settings,
        passkeys: [...settings.passkeys, record],
      });
      flash("Passkey added. You can use it at sign-in.");
    } catch (err) {
      setPasskeyError(
        err instanceof Error ? err.message : "Could not add passkey.",
      );
    } finally {
      setPasskeyBusy(false);
    }
  }

  function removePasskey(id: string) {
    const nextPasskeys = settings.passkeys.filter((p) => p.id !== id);
    const next = { ...settings, passkeys: nextPasskeys };
    if (!next.passwordEnabled && !otherMethodsActive(next)) {
      next.passwordEnabled = true;
      flash("Password sign-in was re-enabled so you aren’t locked out.");
    }
    persist(next);
  }

  const displayCodes = freshCodes ?? settings.backupCodes;
  const authenticatorOn = settings.authenticator.enabled && !!settings.authenticator.secret;
  const qrUri =
    pendingSecret && user
      ? totpUri(pendingSecret, user.email)
      : null;

  return (
    <div className="flex min-h-full flex-col bg-app">
      <p className="px-4 py-3 text-base text-muted">
        Choose how you sign in to iCook. Only methods you enable here appear on
        the login screen.
      </p>

      {notice ? (
        <p
          role="status"
          className="mx-4 mb-2 rounded-sm bg-brand/10 px-3 py-2 text-sm font-bold text-brand"
        >
          {notice}
        </p>
      ) : null}

      <div className="flex flex-col gap-[5px]">
        {/* Password / passwordless */}
        <Card
          icon={<KeyIcon className="size-6" />}
          title="Password"
          description="Allow signing in with your password. Turn this off for passwordless when you have another method set up."
        >
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-ink">
              Password sign-in
            </span>
            <Switch
              checked={settings.passwordEnabled}
              onChange={togglePassword}
              label="Toggle password sign-in"
            />
          </div>
          {!settings.passwordEnabled ? (
            <p className="flex items-center gap-2 text-base text-online">
              <CheckIcon className="size-5" /> Passwordless — use passkey,
              authenticator, or backup codes
            </p>
          ) : null}
          <Link
            href="/change-password"
            className="mt-1 text-base font-bold text-brand"
          >
            Change Password
          </Link>
        </Card>

        {/* Authenticator */}
        <Card
          icon={<ShieldIcon className="size-6" />}
          title="Authenticator app"
          description="Generate a 6-digit code in Google Authenticator, Authy, or 1Password to sign in."
        >
          {authenticatorOn && !pendingSecret ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-ink">Connected</span>
                <Switch
                  checked
                  onChange={disableAuthenticator}
                  label="Disable authenticator app"
                />
              </div>
              <p className="flex items-center gap-2 text-base text-online">
                <CheckIcon className="size-5" /> Ready to use at login
              </p>
            </>
          ) : pendingSecret && qrUri ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted">
                Scan this QR code with your authenticator app, then enter the
                6-digit code to confirm.
              </p>
              <div className="flex justify-center rounded-sm bg-app p-3">
                <Image
                  src={qrImageUrl(qrUri)}
                  alt="Authenticator QR code"
                  width={180}
                  height={180}
                  unoptimized
                />
              </div>
              <p className="break-all text-center font-mono text-xs text-muted">
                {pendingSecret}
              </p>
              <label htmlFor="authenticator-code" className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-muted">
                  Verification code
                </span>
                <input
                  id="authenticator-code"
                  name="authenticator-code"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="000000"
                  className="field"
                />
              </label>
              {setupError ? (
                <p role="alert" className="text-sm font-bold text-brand">
                  {setupError}
                </p>
              ) : null}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={cancelAuthenticatorSetup}
                  className="flex flex-1 items-center justify-center gap-2 rounded-sm border border-line py-2 text-base font-bold text-ink"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmAuthenticator}
                  className="flex flex-1 items-center justify-center gap-2 rounded-sm bg-brand py-2 text-base font-bold text-white"
                >
                  Verify &amp; enable
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={startAuthenticatorSetup}
              className="w-full rounded-sm bg-brand py-2 text-base font-bold text-white"
            >
              Set up authenticator
            </button>
          )}
        </Card>

        {/* Backup codes */}
        <Card
          icon={<KeyIcon className="size-6" />}
          title="Authentication codes"
          description="One-time backup codes if you lose access to your authenticator or passkey."
        >
          {showCodes && displayCodes.length > 0 ? (
            <>
              <ul className="grid grid-cols-2 gap-2">
                {displayCodes.map((code) => (
                  <li
                    key={code}
                    className="rounded-sm bg-app py-2 text-center font-mono text-base tracking-wider text-ink"
                  >
                    {code}
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => copyCodes(displayCodes)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-sm border border-line py-2 text-base font-bold text-ink"
                >
                  {copied ? (
                    <CheckIcon className="size-5 text-online" />
                  ) : (
                    <CopyIcon className="size-5" />
                  )}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button
                  type="button"
                  onClick={regenerateCodes}
                  className="flex flex-1 items-center justify-center gap-2 rounded-sm border border-line py-2 text-base font-bold text-ink"
                >
                  <RefreshIcon className="size-5" /> Regenerate
                </button>
              </div>
              <p className="text-sm text-muted">
                {settings.backupCodes.length} unused · each code works once
              </p>
            </>
          ) : settings.backupCodes.length > 0 ? (
            <button
              type="button"
              onClick={() => {
                setFreshCodes(null);
                setShowCodes(true);
              }}
              className="w-full rounded-sm bg-brand py-2 text-base font-bold text-white"
            >
              View codes ({settings.backupCodes.length} left)
            </button>
          ) : (
            <button
              type="button"
              onClick={regenerateCodes}
              className="w-full rounded-sm bg-brand py-2 text-base font-bold text-white"
            >
              Generate backup codes
            </button>
          )}
        </Card>

        {/* Passkeys */}
        <Card
          icon={<SmartphoneIcon className="size-6" />}
          title="Passkeys"
          description="Sign in with Face ID, fingerprint, Windows Hello, or a security key — no password needed."
        >
          {!passkeysSupported() ? (
            <p className="text-sm text-muted">
              Passkeys aren’t supported in this browser. Try Chrome, Edge, or
              Safari on a device with biometrics.
            </p>
          ) : null}
          <ul className="flex flex-col divide-y divide-line">
            {settings.passkeys.map((passkey) => (
              <li key={passkey.id} className="flex items-center gap-3 py-2.5">
                <KeyIcon className="size-5 shrink-0 text-brand" />
                <div className="flex-1">
                  <p className="text-base font-bold text-ink">{passkey.name}</p>
                  <p className="text-sm text-muted">{passkey.added}</p>
                </div>
                <button
                  type="button"
                  aria-label={`Remove ${passkey.name}`}
                  onClick={() => removePasskey(passkey.id)}
                  className="text-muted hover:text-brand"
                >
                  <TrashIcon className="size-5" />
                </button>
              </li>
            ))}
            {settings.passkeys.length === 0 ? (
              <li className="py-2.5 text-base text-muted">
                No passkeys added yet.
              </li>
            ) : null}
          </ul>
          {passkeyError ? (
            <p role="alert" className="text-sm font-bold text-brand">
              {passkeyError}
            </p>
          ) : null}
          <button
            type="button"
            disabled={passkeyBusy || !passkeysSupported()}
            onClick={() => void addPasskey()}
            className="flex items-center justify-center gap-2 rounded-sm bg-brand py-2 text-base font-bold text-white disabled:opacity-50"
          >
            <PlusIcon className="size-5" />
            {passkeyBusy ? "Waiting for device…" : "Add passkey"}
          </button>
        </Card>
      </div>
    </div>
  );
}
