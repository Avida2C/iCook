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
  consumeBackupCode,
  getSecurity,
  moveSecurity,
  setSecurity,
  verifyTotp,
  type LoginMethod,
  type SecuritySettings,
} from "@/lib/auth/security";
import { assertPasskey } from "@/lib/auth/passkeys";
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
  password?: string;
  avatarUrl?: string;
};

export type ProfileUpdate = {
  firstName: string;
  lastName: string;
  about?: string;
  avatarUrl?: string | null;
};

/** Proof required before changing email or password. */
export type ReauthProof =
  | { method: "password"; password: string }
  | { method: "authenticator"; code: string }
  | { method: "passkey"; credentialId: string };

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

type StoredUser = User & { password?: string };
type AuthResult = { ok: true } | { ok: false; error: string };

const USERS_KEY = "icook.users";
const SESSION_KEY = "icook.session";
const MIN_PASSWORD_LENGTH = 8;

/** Methods allowed to confirm sensitive account changes (no backup codes). */
export type ReauthMethod = "authenticator" | "passkey" | "password";

/** Prefer stronger / MFA options; password last and only when enabled. */
const REAUTH_PRIORITY: ReauthMethod[] = [
  "authenticator",
  "passkey",
  "password",
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
  };
}

function readUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    const parsed: unknown[] = raw ? JSON.parse(raw) : [];
    const users = parsed
      .map((u) =>
        u && typeof u === "object"
          ? migrateUser(u as Record<string, unknown>)
          : null,
      )
      .filter((u): u is StoredUser => !!u);

    if (!users.some((u) => u.email === DEMO_USER.email)) {
      users.unshift(DEMO_USER);
    } else {
      const idx = users.findIndex((u) => u.email === DEMO_USER.email);
      if (idx >= 0 && !users[idx].username) {
        users[idx] = { ...users[idx], ...DEMO_USER, password: users[idx].password };
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
  if (!password) return "Enter a new password.";
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  return null;
}

function verifyReauth(found: StoredUser, proof: ReauthProof): AuthResult {
  const settings = getSecurity(found.email);

  if (proof.method === "password") {
    if (!settings.passwordEnabled) {
      return {
        ok: false,
        error:
          "Password sign-in is turned off. Confirm with a passkey or authenticator instead.",
      };
    }
    const password = proof.password;
    if (!password) return { ok: false, error: "Enter your password." };
    if (!found.password) {
      return {
        ok: false,
        error: "This account has no password. Use a passkey or authenticator.",
      };
    }
    if (found.password !== password) {
      return { ok: false, error: "Incorrect password." };
    }
    return { ok: true };
  }

  if (proof.method === "passkey") {
    const match = settings.passkeys.some(
      (p) => p.credentialId === proof.credentialId,
    );
    if (!match) return { ok: false, error: "Unrecognized passkey." };
    return { ok: true };
  }

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

function listReauthMethods(found: StoredUser): ReauthMethod[] {
  const settings = getSecurity(found.email);
  const available = new Set<ReauthMethod>();
  if (settings.authenticator.enabled && settings.authenticator.secret) {
    available.add("authenticator");
  }
  if (settings.passkeys.length > 0) available.add("passkey");
  if (settings.passwordEnabled && found.password) available.add("password");

  return REAUTH_PRIORITY.filter((m) => available.has(m));
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
  loginWithPassword: (email: string, password: string) => AuthResult;
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
  signup: (input: SignupInput) => AuthResult;
  updateProfile: (update: ProfileUpdate) => AuthResult;
  updateEmail: (update: EmailUpdate) => AuthResult;
  changePassword: (update: PasswordUpdate) => AuthResult;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    writeUsers(readUsers());
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        const email = typeof parsed.email === "string" ? parsed.email : "";
        const found = email ? findUser(email) : undefined;
        if (found) {
          setUser(toPublicUser(found));
        } else {
          const migrated = migrateUser(parsed);
          if (migrated) setUser(toPublicUser(migrated));
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
    (email: string, password: string): AuthResult => {
      const found = findUser(email);
      if (!found) return { ok: false, error: "No account found." };
      const settings = getSecurity(found.email);
      if (!settings.passwordEnabled) {
        return {
          ok: false,
          error: "Password sign-in is turned off for this account.",
        };
      }
      if (found.password && found.password !== password) {
        return { ok: false, error: "Incorrect password." };
      }
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
      return loginWithPassword(resolved.email, password);
    },
    [resolveLoginMethods, loginWithPassword],
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
      if (isDemoAccount(user.email)) {
        return { ok: false, error: DEMO_LOCK_ERROR };
      }

      const passwordError = validateNewPassword(update.newPassword);
      if (passwordError) return { ok: false, error: passwordError };
      if (update.newPassword !== update.confirmPassword) {
        return { ok: false, error: "New passwords do not match." };
      }

      const users = readUsers();
      const idx = users.findIndex(
        (u) => u.email.toLowerCase() === user.email.toLowerCase(),
      );
      if (idx < 0) return { ok: false, error: "Account not found." };

      const current = users[idx];
      const reauth = verifyReauth(current, update.reauth);
      if (!reauth.ok) return reauth;

      if (
        update.reauth.method === "password" &&
        current.password === update.newPassword
      ) {
        return {
          ok: false,
          error: "New password must be different from your current password.",
        };
      }

      const next: StoredUser = { ...current, password: update.newPassword };
      users[idx] = next;
      writeUsers(users);

      const settings = getSecurity(next.email);
      if (!settings.passwordEnabled) {
        setSecurity(next.email, { ...settings, passwordEnabled: true });
      }

      return { ok: true };
    },
    [user?.email],
  );

  const logout = useCallback(() => persistSession(null), [persistSession]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        resolveLoginMethods,
        loginWithPassword,
        loginWithAuthenticator,
        loginWithBackupCode,
        loginWithPasskey,
        getSecuritySettings,
        saveSecuritySettings,
        getReauthMethods,
        confirmPasskeyReauth,
        signup,
        updateProfile,
        updateEmail,
        changePassword,
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
