/**
 * Per-account security preferences for the local (no-backend) auth stand-in.
 * Passkeys use real WebAuthn; TOTP uses otpauth; backup codes are single-use.
 */

import { Secret, TOTP } from "otpauth";

export type PasskeyRecord = {
  id: string;
  name: string;
  added: string;
  /** Raw credential id as base64url — used in allowCredentials */
  credentialId: string;
};

export type SecuritySettings = {
  /** When false, password cannot be used at login (passwordless). */
  passwordEnabled: boolean;
  authenticator: {
    enabled: boolean;
    /** Base32 secret; null until setup is verified */
    secret: string | null;
  };
  /** Remaining one-time backup codes (plaintext for demo; unused codes only). */
  backupCodes: string[];
  passkeys: PasskeyRecord[];
};

export const DEFAULT_SECURITY: SecuritySettings = {
  passwordEnabled: true,
  authenticator: { enabled: false, secret: null },
  backupCodes: [],
  passkeys: [],
};

const SECURITY_KEY = "icook.security";

type SecurityStore = Record<string, SecuritySettings>;

function readStore(): SecurityStore {
  try {
    const raw = localStorage.getItem(SECURITY_KEY);
    return raw ? (JSON.parse(raw) as SecurityStore) : {};
  } catch {
    return {};
  }
}

function writeStore(store: SecurityStore) {
  localStorage.setItem(SECURITY_KEY, JSON.stringify(store));
}

export function getSecurity(email: string): SecuritySettings {
  const key = email.trim().toLowerCase();
  const store = readStore();
  return store[key] ? { ...DEFAULT_SECURITY, ...store[key] } : { ...DEFAULT_SECURITY };
}

export function setSecurity(email: string, settings: SecuritySettings) {
  const key = email.trim().toLowerCase();
  const store = readStore();
  store[key] = settings;
  writeStore(store);
}

export function updateSecurity(
  email: string,
  updater: (prev: SecuritySettings) => SecuritySettings,
): SecuritySettings {
  const next = updater(getSecurity(email));
  setSecurity(email, next);
  return next;
}

/** Login methods available for an account based on its settings. */
export type LoginMethod = "password" | "passkey" | "authenticator" | "backup";

export function availableLoginMethods(
  settings: SecuritySettings,
  hasPassword: boolean,
): LoginMethod[] {
  const methods: LoginMethod[] = [];
  if (settings.passwordEnabled && hasPassword) methods.push("password");
  if (settings.passkeys.length > 0) methods.push("passkey");
  if (settings.authenticator.enabled && settings.authenticator.secret) {
    methods.push("authenticator");
  }
  if (settings.backupCodes.length > 0) methods.push("backup");
  return methods;
}

export function makeBackupCodes(count = 8): string[] {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const block = () =>
    Array.from({ length: 4 }, () =>
      chars[Math.floor(Math.random() * chars.length)],
    ).join("");
  return Array.from({ length: count }, () => `${block()}-${block()}`);
}

export function createTotpSecret(): string {
  return new Secret({ size: 20 }).base32;
}

export function totpUri(secret: string, accountName: string): string {
  const totp = new TOTP({
    issuer: "iCook",
    label: accountName,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: Secret.fromBase32(secret),
  });
  return totp.toString();
}

export function verifyTotp(secret: string, token: string): boolean {
  const cleaned = token.replace(/\s/g, "");
  if (!/^\d{6}$/.test(cleaned)) return false;
  const totp = new TOTP({
    issuer: "iCook",
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: Secret.fromBase32(secret),
  });
  // ±1 window for clock skew
  return totp.validate({ token: cleaned, window: 1 }) !== null;
}

/** Consume a backup code (case-insensitive). Returns updated list or null if invalid. */
export function consumeBackupCode(
  codes: string[],
  input: string,
): string[] | null {
  const normalized = input.trim().toUpperCase().replace(/\s+/g, "");
  const idx = codes.findIndex(
    (c) => c.replace(/-/g, "").toUpperCase() === normalized.replace(/-/g, ""),
  );
  if (idx < 0) return null;
  return codes.filter((_, i) => i !== idx);
}

export function formatAddedDate(date = new Date()): string {
  return `Added ${date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}`;
}

/** QR image URL via public chart API (no extra deps). */
export function qrImageUrl(data: string, size = 180): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;
}
