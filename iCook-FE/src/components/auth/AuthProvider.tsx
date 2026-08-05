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
  setSecurity,
  verifyTotp,
  type LoginMethod,
  type SecuritySettings,
} from "@/lib/auth/security";
import { assertPasskey } from "@/lib/auth/passkeys";

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

export type User = { email: string; name?: string };
type StoredUser = User & { password?: string };
type AuthResult = { ok: true } | { ok: false; error: string };

const USERS_KEY = "icook.users";
const SESSION_KEY = "icook.session";

export const DEMO_CREDENTIALS = {
  email: "demo@icook.app",
  password: "demo1234",
};

const DEMO_USER: StoredUser = {
  email: DEMO_CREDENTIALS.email,
  name: "Demo Chef",
  password: DEMO_CREDENTIALS.password,
};

function readUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    const users: StoredUser[] = raw ? JSON.parse(raw) : [];
    if (!users.some((u) => u.email === DEMO_USER.email)) {
      users.unshift(DEMO_USER);
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
  const id = identifier.trim().toLowerCase();
  return readUsers().find(
    (u) =>
      u.email.toLowerCase() === id || u.name?.toLowerCase() === id,
  );
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
  signup: (email: string, password?: string) => AuthResult;
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
      if (raw) setUser(JSON.parse(raw));
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
      persistSession({ email: found.email, name: found.name });
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
    (email: string, password?: string): AuthResult => {
      const e = email.trim().toLowerCase();
      if (!e) return { ok: false, error: "Enter an email address." };

      const users = readUsers();
      if (users.some((u) => u.email.toLowerCase() === e)) {
        return { ok: false, error: "An account with that email already exists." };
      }

      writeUsers([...users, { email: e, password }]);
      persistSession({ email: e });
      return { ok: true };
    },
    [persistSession],
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
        signup,
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
