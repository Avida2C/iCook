"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  availableLoginMethods,
  clearSecurity,
  consumeBackupCode,
  getSecurity,
  moveSecurity,
  setSecurity,
  verifyTotp,
  type LoginMethod,
  type SecuritySettings,
} from "@/lib/auth/security";
import { assertPasskey } from "@/lib/auth/passkeys";
import { wipeAccountContent } from "@/lib/accountData";
import {
  displayName,
  normalizeUsername,
  validateUsername,
} from "@/lib/username";

/**
 * Local (no-backend) auth for development.
 *
 * Accounts and the active session live in localStorage so you can log in,
 * stay logged in across reloads, and build out the authenticated app. A demo
 * account is seeded automatically.
 *
 * Security settings (passkeys, authenticator, backup codes, passwordless)
 * are per-account and drive which methods appear on the login screen.
 *
 * NOTE: this stores credentials in plaintext in the browser and is only a
 * stand-in. Replace it with a real auth backend before shipping.
 */

export type User = {
  email: string;
  /** Permanent handle without leading @. */
  username: string;
  firstName: string;
  lastName: string;
  /** Display name derived from first + last. */
  name: string;
  /** Optional profile image as a data URL (local demo storage). */
  avatarUrl?: string;
  about?: string;
};

export type SignupInput = {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
  avatarUrl?: string;
};

export type ProfileUpdate = {
  firstName: string;
  lastName: string;
  about?: string;
  avatarUrl?: string | null;
};

/** Proof required to reset a forgotten password (no password method). */
export type RecoveryProof =
  | { method: "authenticator"; code: string }
  | { method: "passkey"; credentialId: string }
  | { method: "backup"; code: string }
  | { method: "email"; code: string };

/** Proof required before changing email or password (same as recovery). */
export type ReauthProof = RecoveryProof;

export type EmailUpdate = {
  email: string;
  confirmEmail: string;
  reauth: ReauthProof;
};

export type PasswordUpdate = {
  newPassword: string;
  confirmPassword: string;
  reauth: ReauthProof;
};

export type PasswordReset = {
  email: string;
  newPassword: string;
  confirmPassword: string;
  proof: RecoveryProof;
};

type StoredUser = User & {
  password?: string;
  /** Soft-delete timestamp (epoch ms). Cleared on restore; purged after grace. */
  deletedAt?: number;
};
type AuthResult =
  | { ok: true; pendingRestore?: boolean }
  | { ok: false; error: string };

export type PendingDeletion = {
  email: string;
  deletedAt: number;
  daysLeft: number;
};

/** Password check succeeded — email OTP is required before the session starts. */
type PasswordLoginChallenge = {
  ok: true;
  requiresEmailCode: true;
  email: string;
  demoCode: string;
};

type PasswordLoginResult = PasswordLoginChallenge | { ok: false; error: string };

const USERS_KEY = "icook.users";
const SESSION_KEY = "icook.session";
const PENDING_RESTORE_KEY = "icook.pendingRestore";
const LOGIN_EMAIL_OTP_KEY = "icook.loginEmailOtp";
const MIN_PASSWORD_LENGTH = 8;
const LOGIN_OTP_TTL_MS = 10 * 60 * 1000;
const ACCOUNT_DELETION_GRACE_MS = 30 * 24 * 60 * 60 * 1000;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

type PendingRestoreRecord = {
  email: string;
  deletedAt: number;
};

type PendingLoginEmailOtp = {
  email: string;
  code: string;
  expiresAt: number;
};

/** Methods for forgot-password recovery and sensitive reauth (never password). */
export type RecoveryMethod =
  | "authenticator"
  | "passkey"
  | "backup"
  | "email";

/** Same as recovery — confirm with passkey, authenticator, backup, or email. */
export type ReauthMethod = RecoveryMethod;

/** Passkey first; Authenticate via Email always last. */
const RECOVERY_PRIORITY: RecoveryMethod[] = [
  "passkey",
  "authenticator",
  "backup",
  "email",
];

export const DEMO_CREDENTIALS = {
  email: "demo@icook.app",
  password: "demo1234",
};

export function isDemoAccount(email: string | null | undefined): boolean {
  return !!email && email.trim().toLowerCase() === DEMO_CREDENTIALS.email;
}

const DEMO_LOCK_ERROR =
  "The demo account’s email and password can’t be changed.";
const DEMO_ACCOUNT_LOCK_ERROR =
  "The demo account can’t be reset or deleted.";

const DEMO_USER: StoredUser = {
  email: DEMO_CREDENTIALS.email,
  username: "courtneyhenry",
  firstName: "Courtney",
  lastName: "Henry",
  name: "Courtney Henry",
  password: DEMO_CREDENTIALS.password,
};

function toPublicUser(stored: StoredUser): User {
  return {
    email: stored.email,
    username: stored.username,
    firstName: stored.firstName,
    lastName: stored.lastName,
    name: stored.name,
    avatarUrl: stored.avatarUrl,
    about: stored.about,
  };
}

function migrateUser(raw: Record<string, unknown>): StoredUser | null {
  const email = typeof raw.email === "string" ? raw.email : "";
  if (!email) return null;

  const firstName =
    typeof raw.firstName === "string"
      ? raw.firstName
      : typeof raw.name === "string"
        ? String(raw.name).split(" ")[0] ?? ""
        : "";
  const lastName =
    typeof raw.lastName === "string"
      ? raw.lastName
      : typeof raw.name === "string"
        ? String(raw.name).split(" ").slice(1).join(" ")
        : "";
  const username =
    typeof raw.username === "string" && raw.username
      ? normalizeUsername(raw.username)
      : normalizeUsername(email.split("@")[0] ?? "user");

  return {
    email,
    username,
    firstName,
    lastName,
    name:
      typeof raw.name === "string" && raw.name
        ? raw.name
        : displayName(firstName, lastName) || email,
    avatarUrl: typeof raw.avatarUrl === "string" ? raw.avatarUrl : undefined,
    about: typeof raw.about === "string" ? raw.about : undefined,
    password: typeof raw.password === "string" ? raw.password : undefined,
    deletedAt:
      typeof raw.deletedAt === "number" && Number.isFinite(raw.deletedAt)
        ? raw.deletedAt
        : undefined,
  };
}

function daysLeftForDeletion(deletedAt: number, now = Date.now()): number {
  return Math.max(
    0,
    Math.ceil((deletedAt + ACCOUNT_DELETION_GRACE_MS - now) / MS_PER_DAY),
  );
}

function isWithinDeletionGrace(deletedAt: number, now = Date.now()): boolean {
  return now - deletedAt < ACCOUNT_DELETION_GRACE_MS;
}

function purgeExpiredUsers(users: StoredUser[]): StoredUser[] {
  const now = Date.now();
  const kept: StoredUser[] = [];
  for (const user of users) {
    if (
      user.deletedAt &&
      !isDemoAccount(user.email) &&
      !isWithinDeletionGrace(user.deletedAt, now)
    ) {
      clearSecurity(user.email);
      continue;
    }
    kept.push(user);
  }
  return kept;
}

function readPendingRestore(): PendingRestoreRecord | null {
  try {
    const raw = sessionStorage.getItem(PENDING_RESTORE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingRestoreRecord;
    if (
      typeof parsed.email !== "string" ||
      typeof parsed.deletedAt !== "number"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writePendingRestore(record: PendingRestoreRecord) {
  sessionStorage.setItem(PENDING_RESTORE_KEY, JSON.stringify(record));
}

function clearPendingRestore() {
  sessionStorage.removeItem(PENDING_RESTORE_KEY);
}

function readUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    const parsed: unknown[] = raw ? JSON.parse(raw) : [];
    let users = parsed
      .map((u) =>
        u && typeof u === "object"
          ? migrateUser(u as Record<string, unknown>)
          : null,
      )
      .filter((u): u is StoredUser => !!u);

    const before = users.length;
    users = purgeExpiredUsers(users);
    if (users.length !== before) {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    if (!users.some((u) => u.email === DEMO_USER.email)) {
      users.unshift(DEMO_USER);
    } else {
      const idx = users.findIndex((u) => u.email === DEMO_USER.email);
      if (idx >= 0 && !users[idx].username) {
        users[idx] = {
          ...users[idx],
          ...DEMO_USER,
          password: users[idx].password,
        };
      }
      if (idx >= 0 && users[idx].deletedAt) {
        users[idx] = { ...users[idx], deletedAt: undefined };
      }
    }
    return users;
  } catch {
    return [DEMO_USER];
  }
}

function writeUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function findUser(identifier: string): StoredUser | undefined {
  const id = identifier.trim().toLowerCase().replace(/^@+/, "");
  return readUsers().find(
    (u) =>
      u.email.toLowerCase() === id ||
      u.username.toLowerCase() === id ||
      u.name?.toLowerCase() === id,
  );
}

function validateNewPassword(password: string): string | null {
  if (!password) return "Enter a password.";
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  return null;
}

function makeLoginEmailCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function readPendingLoginOtp(): PendingLoginEmailOtp | null {
  try {
    const raw = sessionStorage.getItem(LOGIN_EMAIL_OTP_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingLoginEmailOtp;
    if (
      typeof parsed.email !== "string" ||
      typeof parsed.code !== "string" ||
      typeof parsed.expiresAt !== "number"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writePendingLoginOtp(pending: PendingLoginEmailOtp) {
  sessionStorage.setItem(LOGIN_EMAIL_OTP_KEY, JSON.stringify(pending));
}

function clearPendingLoginOtp() {
  sessionStorage.removeItem(LOGIN_EMAIL_OTP_KEY);
}

function issueLoginEmailOtp(email: string): PasswordLoginChallenge {
  const code = makeLoginEmailCode();
  writePendingLoginOtp({
    email: email.trim().toLowerCase(),
    code,
    expiresAt: Date.now() + LOGIN_OTP_TTL_MS,
  });
  return {
    ok: true,
    requiresEmailCode: true,
    email,
    demoCode: code,
  };
}

function verifyReauth(found: StoredUser, proof: ReauthProof): AuthResult {
  return checkRecoveryProof(found, proof);
}

function listRecoveryMethods(found: StoredUser): RecoveryMethod[] {
  const settings = getSecurity(found.email);
  const available = new Set<RecoveryMethod>(["email"]);
  if (settings.authenticator.enabled && settings.authenticator.secret) {
    available.add("authenticator");
  }
  if (settings.passkeys.length > 0) available.add("passkey");
  if (settings.backupCodes.length > 0) available.add("backup");
  return RECOVERY_PRIORITY.filter((m) => available.has(m));
}

function listReauthMethods(found: StoredUser): ReauthMethod[] {
  return listRecoveryMethods(found);
}

function checkRecoveryProof(
  found: StoredUser,
  proof: RecoveryProof,
): AuthResult {
  const settings = getSecurity(found.email);

  if (proof.method === "passkey") {
    const match = settings.passkeys.some(
      (p) => p.credentialId === proof.credentialId,
    );
    if (!match) return { ok: false, error: "Unrecognized passkey." };
    return { ok: true };
  }

  if (proof.method === "authenticator") {
    if (!settings.authenticator.enabled || !settings.authenticator.secret) {
      return {
        ok: false,
        error: "Authenticator app is not set up for this account.",
      };
    }
    if (!verifyTotp(settings.authenticator.secret, proof.code)) {
      return { ok: false, error: "Invalid or expired authentication code." };
    }
    return { ok: true };
  }

  if (proof.method === "backup") {
    const remaining = consumeBackupCode(settings.backupCodes, proof.code);
    if (!remaining) {
      return { ok: false, error: "Invalid or already used backup code." };
    }
    return { ok: true };
  }

  // Email OTP requires a real mail backend — never accept a local/demo code.
  return {
    ok: false,
    error:
      "Email verification isn’t available yet. Use authenticator, passkey, or a backup code.",
  };
}

/** Consume single-use recovery proofs after a successful password reset. */
function consumeRecoveryProof(found: StoredUser, proof: RecoveryProof) {
  if (proof.method === "backup") {
    const settings = getSecurity(found.email);
    const remaining = consumeBackupCode(settings.backupCodes, proof.code);
    if (remaining) {
      setSecurity(found.email, { ...settings, backupCodes: remaining });
    }
  }
}

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (identifier: string, password: string) => AuthResult;
  /** Resolve which sign-in methods the account allows. */
  resolveLoginMethods: (
    identifier: string,
  ) =>
    | { ok: true; email: string; name?: string; methods: LoginMethod[] }
    | { ok: false; error: string };
  /** Validate password, then require an email OTP before signing in. */
  loginWithPassword: (email: string, password: string) => PasswordLoginResult;
  /** Resend the login email OTP after a successful password check. */
  resendLoginEmailCode: (email: string) => PasswordLoginResult;
  /** Complete password login with the email OTP. */
  confirmLoginEmailCode: (email: string, code: string) => AuthResult;
  loginWithAuthenticator: (email: string, code: string) => AuthResult;
  loginWithBackupCode: (email: string, code: string) => AuthResult;
  loginWithPasskey: (email: string) => Promise<AuthResult>;
  getSecuritySettings: (email?: string) => SecuritySettings | null;
  saveSecuritySettings: (settings: SecuritySettings) => void;
  /** Available confirmation methods for email/password changes. */
  getReauthMethods: () => ReauthMethod[];
  /** Prompt the platform authenticator and return a passkey reauth proof. */
  confirmPasskeyReauth: () => Promise<
    | { ok: true; proof: Extract<ReauthProof, { method: "passkey" }> }
    | { ok: false; error: string }
  >;
  /** Resolve recovery methods for forgot-password (email always included). */
  resolveRecoveryMethods: (
    identifier: string,
  ) =>
    | { ok: true; email: string; name?: string; methods: RecoveryMethod[] }
    | { ok: false; error: string; demoLocked?: boolean; email?: string };
  /** Simulate sending a recovery email (no local/demo OTP is issued). */
  sendRecoveryEmailCode: (email: string) => AuthResult;
  /** Prompt passkey for unauthenticated password recovery. */
  confirmPasskeyRecovery: (email: string) => Promise<
    | { ok: true; proof: Extract<RecoveryProof, { method: "passkey" }> }
    | { ok: false; error: string }
  >;
  /** Validate a recovery proof without consuming single-use codes. */
  validateRecoveryProof: (email: string, proof: RecoveryProof) => AuthResult;
  resetPassword: (update: PasswordReset) => AuthResult;
  signup: (input: SignupInput) => AuthResult;
  updateProfile: (update: ProfileUpdate) => AuthResult;
  updateEmail: (update: EmailUpdate) => AuthResult;
  changePassword: (update: PasswordUpdate) => AuthResult;
  /** Wipe local content data; keep credentials and security. */
  resetAccount: (reauth: ReauthProof) => AuthResult;
  /** Soft-delete the signed-in account (30-day restore window). */
  deleteAccount: (reauth: ReauthProof) => AuthResult;
  /** Restore a soft-deleted account from the pending-restore login state. */
  restoreAccount: () => AuthResult;
  /** Active soft-delete pending restore after login (null if none). */
  getPendingDeletion: () => PendingDeletion | null;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    writeUsers(readUsers());
    try {
      const pending = readPendingRestore();
      if (pending) {
        const found = findUser(pending.email);
        if (
          found?.deletedAt &&
          isWithinDeletionGrace(found.deletedAt) &&
          found.deletedAt === pending.deletedAt
        ) {
          // Keep pending restore; do not enter a normal app session.
          setLoading(false);
          return;
        }
        clearPendingRestore();
      }

      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        const email = typeof parsed.email === "string" ? parsed.email : "";
        const found = email ? findUser(email) : undefined;
        if (found?.deletedAt && isWithinDeletionGrace(found.deletedAt)) {
          writePendingRestore({
            email: found.email,
            deletedAt: found.deletedAt,
          });
          localStorage.removeItem(SESSION_KEY);
        } else if (found && !found.deletedAt) {
          setUser(toPublicUser(found));
        } else if (!found) {
          const migrated = migrateUser(parsed);
          if (migrated && !migrated.deletedAt) setUser(toPublicUser(migrated));
        }
      }
    } catch {
      // ignore malformed session
    }
    setLoading(false);
  }, []);

  const persistSession = useCallback((next: User | null) => {
    setUser(next);
    if (next) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(next));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, []);

  const startSession = useCallback(
    (found: StoredUser): AuthResult => {
      if (found.deletedAt) {
        if (!isWithinDeletionGrace(found.deletedAt)) {
          // Should already be purged; treat as missing.
          return { ok: false, error: "No account found." };
        }
        writePendingRestore({
          email: found.email,
          deletedAt: found.deletedAt,
        });
        persistSession(null);
        return { ok: true, pendingRestore: true };
      }
      clearPendingRestore();
      persistSession(toPublicUser(found));
      return { ok: true };
    },
    [persistSession],
  );

  const resolveLoginMethods = useCallback(
    (identifier: string) => {
      const id = identifier.trim();
      if (!id) {
        return { ok: false as const, error: "Enter your email or username." };
      }
      const found = findUser(id);
      if (!found) {
        return {
          ok: false as const,
          error: "No account found for that email.",
        };
      }
      const settings = getSecurity(found.email);
      const methods = availableLoginMethods(settings, !!found.password);
      if (methods.length === 0) {
        return {
          ok: false as const,
          error:
            "This account has no sign-in methods enabled. Contact support or re-enable password in Security settings from another session.",
        };
      }
      return {
        ok: true as const,
        email: found.email,
        name: found.name,
        methods,
      };
    },
    [],
  );

  const loginWithPassword = useCallback(
    (email: string, password: string): PasswordLoginResult => {
      const found = findUser(email);
      if (!found) return { ok: false, error: "No account found." };
      const settings = getSecurity(found.email);
      if (!settings.passwordEnabled) {
        return {
          ok: false,
          error: "Password sign-in is turned off for this account.",
        };
      }
      if (!found.password) {
        return {
          ok: false,
          error: "This account has no password. Use another sign-in method.",
        };
      }
      if (found.password !== password) {
        return { ok: false, error: "Incorrect password." };
      }
      return issueLoginEmailOtp(found.email);
    },
    [],
  );

  const resendLoginEmailCode = useCallback(
    (email: string): PasswordLoginResult => {
      const found = findUser(email);
      if (!found) return { ok: false, error: "No account found." };
      const pending = readPendingLoginOtp();
      if (
        !pending ||
        pending.email !== found.email.toLowerCase() ||
        pending.expiresAt < Date.now()
      ) {
        return {
          ok: false,
          error: "Enter your password again to request a new code.",
        };
      }
      return issueLoginEmailOtp(found.email);
    },
    [],
  );

  const confirmLoginEmailCode = useCallback(
    (email: string, code: string): AuthResult => {
      const found = findUser(email);
      if (!found) return { ok: false, error: "No account found." };
      const pending = readPendingLoginOtp();
      if (
        !pending ||
        pending.email !== found.email.toLowerCase()
      ) {
        return {
          ok: false,
          error: "Enter your password again to request a verification code.",
        };
      }
      if (pending.expiresAt < Date.now()) {
        clearPendingLoginOtp();
        return {
          ok: false,
          error: "That code has expired. Enter your password again.",
        };
      }
      const cleaned = code.trim().replace(/\s+/g, "");
      if (cleaned !== pending.code) {
        return { ok: false, error: "Incorrect verification code." };
      }
      clearPendingLoginOtp();
      return startSession(found);
    },
    [startSession],
  );

  const loginWithAuthenticator = useCallback(
    (email: string, code: string): AuthResult => {
      const found = findUser(email);
      if (!found) return { ok: false, error: "No account found." };
      const settings = getSecurity(found.email);
      if (!settings.authenticator.enabled || !settings.authenticator.secret) {
        return {
          ok: false,
          error: "Authenticator app is not set up for this account.",
        };
      }
      if (!verifyTotp(settings.authenticator.secret, code)) {
        return { ok: false, error: "Invalid or expired authentication code." };
      }
      return startSession(found);
    },
    [startSession],
  );

  const loginWithBackupCode = useCallback(
    (email: string, code: string): AuthResult => {
      const found = findUser(email);
      if (!found) return { ok: false, error: "No account found." };
      const settings = getSecurity(found.email);
      const remaining = consumeBackupCode(settings.backupCodes, code);
      if (!remaining) {
        return { ok: false, error: "Invalid or already used backup code." };
      }
      setSecurity(found.email, { ...settings, backupCodes: remaining });
      return startSession(found);
    },
    [startSession],
  );

  const loginWithPasskey = useCallback(
    async (email: string): Promise<AuthResult> => {
      const found = findUser(email);
      if (!found) return { ok: false, error: "No account found." };
      const settings = getSecurity(found.email);
      if (settings.passkeys.length === 0) {
        return { ok: false, error: "No passkeys registered for this account." };
      }
      try {
        const usedId = await assertPasskey(
          settings.passkeys.map((p) => p.credentialId),
        );
        const match = settings.passkeys.some((p) => p.credentialId === usedId);
        if (!match) {
          return { ok: false, error: "Unrecognized passkey." };
        }
        return startSession(found);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Passkey sign-in failed.";
        return { ok: false, error: message };
      }
    },
    [startSession],
  );

  /** Backward-compatible password login used by older call sites. */
  const login = useCallback(
    (identifier: string, password: string): AuthResult => {
      const resolved = resolveLoginMethods(identifier);
      if (!resolved.ok) return resolved;
      const challenged = loginWithPassword(resolved.email, password);
      if (!challenged.ok) return challenged;
      // Older callers expect an immediate session; complete with the issued demo OTP.
      return confirmLoginEmailCode(challenged.email, challenged.demoCode);
    },
    [resolveLoginMethods, loginWithPassword, confirmLoginEmailCode],
  );

  const getSecuritySettings = useCallback(
    (email?: string): SecuritySettings | null => {
      const target = email ?? user?.email;
      if (!target) return null;
      return getSecurity(target);
    },
    [user?.email],
  );

  const saveSecuritySettings = useCallback(
    (settings: SecuritySettings) => {
      if (!user?.email) return;
      setSecurity(user.email, settings);
    },
    [user?.email],
  );

  const signup = useCallback(
    (input: SignupInput): AuthResult => {
      const email = input.email.trim().toLowerCase();
      if (!email) return { ok: false, error: "Enter an email address." };

      const usernameError = validateUsername(input.username);
      if (usernameError) return { ok: false, error: usernameError };
      const username = normalizeUsername(input.username);

      const firstName = input.firstName.trim();
      const lastName = input.lastName.trim();
      if (!firstName) return { ok: false, error: "Enter your first name." };
      if (!lastName) return { ok: false, error: "Enter your last name." };

      const passwordError = validateNewPassword(input.password);
      if (passwordError) return { ok: false, error: passwordError };
      if (input.password !== input.confirmPassword) {
        return { ok: false, error: "Passwords do not match." };
      }

      const users = readUsers();
      if (users.some((u) => u.email.toLowerCase() === email)) {
        return { ok: false, error: "An account with that email already exists." };
      }
      if (users.some((u) => u.username.toLowerCase() === username)) {
        return {
          ok: false,
          error: "That username is already taken.",
        };
      }

      const next: StoredUser = {
        email,
        username,
        firstName,
        lastName,
        name: displayName(firstName, lastName),
        avatarUrl: input.avatarUrl,
        password: input.password,
      };

      writeUsers([...users, next]);
      persistSession(toPublicUser(next));
      return { ok: true };
    },
    [persistSession],
  );

  const updateProfile = useCallback(
    (update: ProfileUpdate): AuthResult => {
      if (!user?.email) {
        return { ok: false, error: "You must be signed in to update your profile." };
      }

      const firstName = update.firstName.trim();
      const lastName = update.lastName.trim();
      if (!firstName) return { ok: false, error: "Enter your first name." };
      if (!lastName) return { ok: false, error: "Enter your last name." };

      const users = readUsers();
      const idx = users.findIndex(
        (u) => u.email.toLowerCase() === user.email.toLowerCase(),
      );
      if (idx < 0) return { ok: false, error: "Account not found." };

      const current = users[idx];
      const next: StoredUser = {
        ...current,
        firstName,
        lastName,
        name: displayName(firstName, lastName),
        about: update.about?.trim() ?? current.about,
        avatarUrl:
          update.avatarUrl === null
            ? undefined
            : update.avatarUrl !== undefined
              ? update.avatarUrl
              : current.avatarUrl,
      };

      users[idx] = next;
      writeUsers(users);
      persistSession(toPublicUser(next));
      return { ok: true };
    },
    [persistSession, user?.email],
  );

  const getReauthMethods = useCallback((): ReauthMethod[] => {
    if (!user?.email) return [];
    const found = findUser(user.email);
    if (!found) return [];
    return listReauthMethods(found);
  }, [user?.email]);

  const confirmPasskeyReauth = useCallback(async () => {
    if (!user?.email) {
      return { ok: false as const, error: "You must be signed in." };
    }
    const found = findUser(user.email);
    if (!found) return { ok: false as const, error: "Account not found." };
    const settings = getSecurity(found.email);
    if (settings.passkeys.length === 0) {
      return { ok: false as const, error: "No passkeys registered." };
    }
    try {
      const credentialId = await assertPasskey(
        settings.passkeys.map((p) => p.credentialId),
      );
      const match = settings.passkeys.some((p) => p.credentialId === credentialId);
      if (!match) {
        return { ok: false as const, error: "Unrecognized passkey." };
      }
      return {
        ok: true as const,
        proof: { method: "passkey" as const, credentialId },
      };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Passkey confirmation failed.";
      return { ok: false as const, error: message };
    }
  }, [user?.email]);

  const resolveRecoveryMethods = useCallback((identifier: string) => {
    const id = identifier.trim();
    if (!id) {
      return { ok: false as const, error: "Enter your email or username." };
    }
    const found = findUser(id);
    if (!found) {
      return {
        ok: false as const,
        error: "No account found for that email.",
      };
    }
    if (isDemoAccount(found.email)) {
      return {
        ok: false as const,
        error: DEMO_LOCK_ERROR,
        demoLocked: true as const,
        email: found.email,
      };
    }
    return {
      ok: true as const,
      email: found.email,
      name: found.name,
      methods: listRecoveryMethods(found),
    };
  }, []);

  const sendRecoveryEmailCode = useCallback((email: string): AuthResult => {
    const found = findUser(email);
    if (!found) return { ok: false, error: "No account found." };
    if (isDemoAccount(found.email)) {
      return { ok: false, error: DEMO_LOCK_ERROR };
    }
    // Stand-in only: no code is stored or returned. Real delivery needs a backend.
    return { ok: true };
  }, []);

  const confirmPasskeyRecovery = useCallback(async (email: string) => {
    const found = findUser(email);
    if (!found) return { ok: false as const, error: "No account found." };
    if (isDemoAccount(found.email)) {
      return { ok: false as const, error: DEMO_LOCK_ERROR };
    }
    const settings = getSecurity(found.email);
    if (settings.passkeys.length === 0) {
      return { ok: false as const, error: "No passkeys registered." };
    }
    try {
      const credentialId = await assertPasskey(
        settings.passkeys.map((p) => p.credentialId),
      );
      const match = settings.passkeys.some(
        (p) => p.credentialId === credentialId,
      );
      if (!match) {
        return { ok: false as const, error: "Unrecognized passkey." };
      }
      return {
        ok: true as const,
        proof: { method: "passkey" as const, credentialId },
      };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Passkey confirmation failed.";
      return { ok: false as const, error: message };
    }
  }, []);

  const validateRecoveryProof = useCallback(
    (email: string, proof: RecoveryProof): AuthResult => {
      const found = findUser(email);
      if (!found) return { ok: false, error: "No account found." };
      if (isDemoAccount(found.email)) {
        return { ok: false, error: DEMO_LOCK_ERROR };
      }
      return checkRecoveryProof(found, proof);
    },
    [],
  );

  const resetPassword = useCallback((update: PasswordReset): AuthResult => {
    const found = findUser(update.email);
    if (!found) return { ok: false, error: "No account found." };
    if (isDemoAccount(found.email)) {
      return { ok: false, error: DEMO_LOCK_ERROR };
    }

    const passwordError = validateNewPassword(update.newPassword);
    if (passwordError) return { ok: false, error: passwordError };
    if (update.newPassword !== update.confirmPassword) {
      return { ok: false, error: "New passwords do not match." };
    }
    if (found.password && found.password === update.newPassword) {
      return {
        ok: false,
        error: "New password must be different from your current password.",
      };
    }

    const verified = checkRecoveryProof(found, update.proof);
    if (!verified.ok) return verified;

    const users = readUsers();
    const idx = users.findIndex(
      (u) => u.email.toLowerCase() === found.email.toLowerCase(),
    );
    if (idx < 0) return { ok: false, error: "Account not found." };

    const next: StoredUser = { ...users[idx], password: update.newPassword };
    users[idx] = next;
    writeUsers(users);
    consumeRecoveryProof(found, update.proof);

    const settings = getSecurity(next.email);
    if (!settings.passwordEnabled) {
      setSecurity(next.email, { ...settings, passwordEnabled: true });
    }

    return { ok: true };
  }, []);

  const updateEmail = useCallback(
    (update: EmailUpdate): AuthResult => {
      if (!user?.email) {
        return { ok: false, error: "You must be signed in to update your email." };
      }
      if (isDemoAccount(user.email)) {
        return { ok: false, error: DEMO_LOCK_ERROR };
      }

      const email = update.email.trim().toLowerCase();
      const confirm = update.confirmEmail.trim().toLowerCase();
      if (!email) return { ok: false, error: "Enter a new email address." };
      if (email !== confirm) {
        return { ok: false, error: "Email addresses do not match." };
      }
      if (email === user.email.toLowerCase()) {
        return { ok: false, error: "That is already your email address." };
      }

      const users = readUsers();
      const idx = users.findIndex(
        (u) => u.email.toLowerCase() === user.email.toLowerCase(),
      );
      if (idx < 0) return { ok: false, error: "Account not found." };

      const current = users[idx];
      const reauth = verifyReauth(current, update.reauth);
      if (!reauth.ok) return reauth;

      if (users.some((u) => u.email.toLowerCase() === email)) {
        return { ok: false, error: "An account with that email already exists." };
      }

      const next: StoredUser = { ...current, email };
      users[idx] = next;
      writeUsers(users);
      consumeRecoveryProof(current, update.reauth);
      moveSecurity(current.email, email);
      persistSession(toPublicUser(next));
      return { ok: true };
    },
    [persistSession, user?.email],
  );

  const changePassword = useCallback(
    (update: PasswordUpdate): AuthResult => {
      if (!user?.email) {
        return {
          ok: false,
          error: "You must be signed in to change your password.",
        };
      }
      return resetPassword({
        email: user.email,
        newPassword: update.newPassword,
        confirmPassword: update.confirmPassword,
        proof: update.reauth,
      });
    },
    [resetPassword, user?.email],
  );

  const getPendingDeletion = useCallback((): PendingDeletion | null => {
    const pending = readPendingRestore();
    if (!pending) return null;
    const found = findUser(pending.email);
    if (
      !found?.deletedAt ||
      found.deletedAt !== pending.deletedAt ||
      !isWithinDeletionGrace(found.deletedAt)
    ) {
      clearPendingRestore();
      return null;
    }
    return {
      email: found.email,
      deletedAt: found.deletedAt,
      daysLeft: daysLeftForDeletion(found.deletedAt),
    };
  }, []);

  const resetAccount = useCallback(
    (reauth: ReauthProof): AuthResult => {
      if (!user?.email) {
        return { ok: false, error: "You must be signed in to reset your account." };
      }
      if (isDemoAccount(user.email)) {
        return { ok: false, error: DEMO_ACCOUNT_LOCK_ERROR };
      }

      const users = readUsers();
      const idx = users.findIndex(
        (u) => u.email.toLowerCase() === user.email.toLowerCase(),
      );
      if (idx < 0) return { ok: false, error: "Account not found." };

      const current = users[idx];
      if (current.deletedAt) {
        return {
          ok: false,
          error: "This account is scheduled for deletion. Restore it first.",
        };
      }

      const verified = verifyReauth(current, reauth);
      if (!verified.ok) return verified;

      wipeAccountContent();

      const next: StoredUser = {
        ...current,
        about: undefined,
        avatarUrl: undefined,
      };
      users[idx] = next;
      writeUsers(users);
      consumeRecoveryProof(current, reauth);
      persistSession(toPublicUser(next));
      return { ok: true };
    },
    [persistSession, user?.email],
  );

  const deleteAccount = useCallback(
    (reauth: ReauthProof): AuthResult => {
      if (!user?.email) {
        return {
          ok: false,
          error: "You must be signed in to delete your account.",
        };
      }
      if (isDemoAccount(user.email)) {
        return { ok: false, error: DEMO_ACCOUNT_LOCK_ERROR };
      }

      const users = readUsers();
      const idx = users.findIndex(
        (u) => u.email.toLowerCase() === user.email.toLowerCase(),
      );
      if (idx < 0) return { ok: false, error: "Account not found." };

      const current = users[idx];
      if (current.deletedAt) {
        return {
          ok: false,
          error: "This account is already scheduled for deletion.",
        };
      }

      const verified = verifyReauth(current, reauth);
      if (!verified.ok) return verified;

      users[idx] = { ...current, deletedAt: Date.now() };
      writeUsers(users);
      consumeRecoveryProof(current, reauth);
      clearPendingRestore();
      persistSession(null);
      return { ok: true };
    },
    [persistSession, user?.email],
  );

  const restoreAccount = useCallback((): AuthResult => {
    const pending = readPendingRestore();
    if (!pending) {
      return { ok: false, error: "No account is waiting to be restored." };
    }

    const users = readUsers();
    const idx = users.findIndex(
      (u) => u.email.toLowerCase() === pending.email.toLowerCase(),
    );
    if (idx < 0) {
      clearPendingRestore();
      return { ok: false, error: "Account not found." };
    }

    const current = users[idx];
    if (!current.deletedAt || !isWithinDeletionGrace(current.deletedAt)) {
      clearPendingRestore();
      return {
        ok: false,
        error: "The restore window has ended and this account was deleted.",
      };
    }

    const next: StoredUser = { ...current, deletedAt: undefined };
    users[idx] = next;
    writeUsers(users);
    clearPendingRestore();
    persistSession(toPublicUser(next));
    return { ok: true };
  }, [persistSession]);

  const logout = useCallback(() => {
    clearPendingRestore();
    persistSession(null);
  }, [persistSession]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        resolveLoginMethods,
        loginWithPassword,
        resendLoginEmailCode,
        confirmLoginEmailCode,
        loginWithAuthenticator,
        loginWithBackupCode,
        loginWithPasskey,
        getSecuritySettings,
        saveSecuritySettings,
        getReauthMethods,
        confirmPasskeyReauth,
        resolveRecoveryMethods,
        sendRecoveryEmailCode,
        confirmPasskeyRecovery,
        validateRecoveryProof,
        resetPassword,
        signup,
        updateProfile,
        updateEmail,
        changePassword,
        resetAccount,
        deleteAccount,
        restoreAccount,
        getPendingDeletion,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

export type { LoginMethod, SecuritySettings };
